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

- Register blum on telegram t.me/BlumCryptoBot/app?startapp=ref_dvQqzUMseK
- Start bot `/start`
- Launch Blum

## Set Up And Run

- clone the project `git clone https://github.com/Widiskel/blum-bot.git`
- run `cd blum-bot`.
- run `npm install`.
- run `cp src/config/config_tmp.js src/config/config.js && cp src/config/proxy_list_tmp.js src/config/proxy_list.js`
- To configure the app, open `src/config/config.js` and add your telegram app id and hash there
- To Configure Proxy, open `src/config/proxy_list.js` and fill up yout proxy using provided format (it currently support only HTTPS proxy)
- run `npm run start`

## How To Update

- run `git pull` or `git stash && git pull`
- run `npm update`
- read Setup and run again if any new step added
- run the bot again `npm run start`

## Note

This bot using telegram sessions. if you ever one of my bot that use telegram sessions, you can just copy the sessions folder to this bot.

if any error happen please check [HERE](https://github.com/Widiskel/blum-bot)
check the commit if any new commit, then update the bot.
