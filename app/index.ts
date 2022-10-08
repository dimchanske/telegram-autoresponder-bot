import 'dotenv/config';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');
const guideBaseUrl = 'https://telegra.ph/Test-10-08-168';

const guideHashLinks = {
  market: '#Рынок-в-Финике',
}

const botResponses = {
  market: `Информация по рынкам в Финике доступна в нашем [гайде](${getGuideLink(guideHashLinks.market)})`,
}

function getGuideLink(hash: string): string {
  return `${guideBaseUrl}${hash}`;
}

// Register logger middleware
bot.use((ctx, next) => {
  const start = Date.now();
  return next().then(() => {
    const ms = Date.now() - start;
    console.log("response time %sms", ms);
  });
});

bot.hears(/.*рынок.*/gm, ctx =>
  ctx.replyWithMarkdownV2(botResponses.market, { reply_to_message_id : ctx?.message?.message_id }),
);

// TODO: Sleep to rate limit

// Launch bot
bot.launch();
