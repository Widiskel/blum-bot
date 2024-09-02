# BLUM BOT

Blum ? Blum is telegram web app mining on telegram, and blum bot is blum auto mining and complete missions bot

## Prerequisite

- Node JS (v22.1.0)
- Git
- Blum Account t.me/BlumCryptoBot/app?startapp=ref_dvQqzUMseK
- TELEGRAM_APP_ID & TELEGRAM_APP_HASH Get it from [Here](https://my.telegram.org/auth?to=apps)

## BOT Feature

- Auto Check In (Experimental)
- Auto start and claim mining
- Auto complete missions
- Auto claim misisons reward
- Auto play game

## Register Blum Account

- Register blum on telegram https://t.me/BlumCryptoBot/app?startapp=ref_dvQqzUMseK
- Start bot `/start`
- Launch Blum

## Set Up And Run

- clone the project `git clone https://github.com/Widiskel/blum-bot.git`
- run `cd blum-bot`.
- run `npm install`.
- run `cp src/config/config_tmp.js src/config/config.js && cp src/config/proxy_list_tmp.js src/config/proxy_list.js`
- To configure the app, run `nano src/config/config.js` and add your telegram app id and hash there (if you use telegram sessions)
- To Configure Proxy, run `nano src/config/proxy_list.js` and fill up your proxy using provided format (it currently support only HTTPS proxy), if you don't use proxy then just let it blank [].
```
export const proxyList = [];
```
- run `npm run start`

## Setup Accounts

1. Run bot `npm run start`
2. Choose option `1` to create account
3. Choose account type `Query` or `Sessions`
4. `Session` Type
   1. Enter Account Name
   2. Enter your phone number starting with countrycode ex : `+628xxxxxxxx`
   3. You will be asked for verification code and password (if any)
   4. Start The bot Again after account creation complete
5. `Query` Type
   1. Enter Account Name
   2. Enter Telegram Query
   3. Start The bot Again after account creation complete
6.  after bot started choose option 3 start bot
7.  if something wrong with your Account, reset Account (option 2) first or just delete problematic a, to cancel running bot press `ctrl+c` twice, and start again [from No 1.](#setup-session).

## How To Update

- run `git pull` or `git stash && git pull`
- run `npm update`
- read Setup and run again if any new step added
- run the bot again `npm run start`

## Note

This bot using telegram sessions. if you ever use one of my bot that use telegram sessions, you can just copy the sessions folder to this bot.

if any error happen please check [HERE](https://github.com/Widiskel/blum-bot)
check the commit if any new commit, then update the bot.
