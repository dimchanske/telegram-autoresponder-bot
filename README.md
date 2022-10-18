# Telegram Autoresponder Bot

Telegram Bot, which automatically responds to messages.  
Based on [Telegraf](https://github.com/telegraf/telegraf).  
Uses Notion Database as config.

## Getting Started

1. Clone the project and move into it
2. Create the env file: `cp .env.example .env`
3. Go to [BotFather](https://t.me/botfather) and create your bot.  
Copy the bot key into your created `.env`
4. Create your Notion DB (if you don't have Notion account, you should get one, this bot only works with Notion).  
Then create an API integration, paste your Database ID and integration token into your `env`.
5. Fill your Notion DB with data (keywords and responses) for the bot to listen.  
The table should contain at least two columns - *keysets* and *responses*.  
You can name the columns however you want, then copy the column headers into your `.env`

Keysets is a string of keywords, separated by `, .`.  
Bot listens for the words in the keyset to appear in a message in any order.  
Response is just a text response for the bot to use when the keyset was found in a message.  

You can have multiple keysets tied to one response, just separate them by `\n` in Notion.

Run:  
`npm i`  
`npm run dev:server`  
Then go to your bot and test your keysets.
