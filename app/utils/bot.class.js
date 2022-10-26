import { Telegraf } from 'telegraf';

export class Bot {
  constructor(botToken, notionClient) {
    this.bot = new Telegraf(botToken);
    this.botToken = botToken;
    this.notionClient = notionClient;
  }

  async start(queries) {
    const configQueries = queries ?? (await this.notionClient.getConfig())?.queries;

    if (!configQueries) {
      console.error('Config is missing');
      process.exit();
    }

    console.log('Queries are: ', configQueries);

    // Register logger middleware
    this.bot.use((ctx, next) => {
      const start = Date.now();
      return next().then(() => {
        const ms = Date.now() - start;
        console.log('response time %sms', ms);
      });
    });

    // Create a response trigger if message contains given set of keys
    const createTrigger = (keys) => (message) => {
      const messageIncludesAllKeys = keys.reduce((acc, key) => {
        return acc && message.toLowerCase().includes(key.toLowerCase());
      }, true);

      return messageIncludesAllKeys && message.toLowerCase().includes('финик');
    }

    for (const { keySets, response } of configQueries) {
      for (const keyString of keySets) {
        const trigger = createTrigger(keyString.split(', '));

        this.bot.hears(trigger, ctx => {
          try {
            ctx.reply(response, { reply_to_message_id : ctx?.message?.message_id });
          } catch(e) {
            console.error(e);
          }
        });
      }
    }

    try {
      await this.bot.launch();
    } catch(e) {
      console.error(e);
    }

    setTimeout(() => {
      this.reInitializeOnConfigChanged();
    }, process.env.NOTION_POLLING_INTERVAL);
  }

  async reInitializeOnConfigChanged() {
    console.log('Polling...');

    const config = await this.notionClient.getConfig();

    if (!config) {
      return;
    }

    if (config.hasConfigChanged) {
      console.log('Config changed, reinitializing');
      await this.reInitialize(config.queries);
    } else {
      setTimeout(() => {
        this.reInitializeOnConfigChanged();
      }, process.env.NOTION_POLLING_INTERVAL);
    }
  }

  async reInitialize(queries) {
    this.bot.stop('Config changed, need to revalidate');
    this.bot = new Telegraf(this.botToken);
    await this.start(queries);
  }
}
