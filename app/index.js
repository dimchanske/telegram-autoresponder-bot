import 'dotenv/config';
import { Client } from '@notionhq/client';
import { Telegraf } from 'telegraf';

import { getQueries } from './utils/notion-client.js';

const queries = await getQueries(
  new Client({ auth: process.env.NOTION_KEY }),
  process.env.NOTION_DATABASE_ID,
);

if (!queries) {
  console.error('Config is missing');
  process.exit();
}

console.log('Queries are: ', queries);

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');

// Register logger middleware
bot.use((ctx, next) => {
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

  // Respond to questions only
  return messageIncludesAllKeys && message.endsWith('?');
}

for (const { keySets, response } of queries) {
  for (const keyString of keySets) {
    const trigger = createTrigger(keyString.split(', '));

    bot.hears(trigger, ctx => {
      try {
        ctx.reply(response, { reply_to_message_id : ctx?.message?.message_id });
      } catch(e) {
        console.error(e);
      }
    });
  }
}

try {
  bot.launch();
} catch(e) {
  console.error(e);
}
