import 'dotenv/config';
import { Bot } from './utils/bot.class.js';
import { NotionClient } from './utils/notion-client.class.js';

const notionClient = new NotionClient(process.env.NOTION_KEY, process.env.NOTION_DATABASE_ID);
const bot = new Bot(process.env.BOT_TOKEN, notionClient);

await bot.start();
