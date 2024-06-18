# BLUM BOT

Blum ? Blum is telegram web app mining on telegram, and blum bot is blum auto mining and complete missions bot

## Prerequisite

- Node JS (v22.1.0)
- Git
- Blum Account [Register HERE](t.me/BlumCryptoBot/app?startapp=ref_dvQqzUMseK)

## BOT Feature

- Auto Check In (Experimental)
- Auto start and claim mining
- Auto complete missions
- Auto claim misisons reward

## Register Metaboss Account

- Register blum on telegram [HERE](t.me/BlumCryptoBot/app?startapp=ref_dvQqzUMseK)
- Start bot `/start`
- Launch Blum

## Set Up And Run

- clone the project `git clone https://github.com/Widiskel/blum-bot.git`
- run `cd blum-bot`.
- run `npm install`.
- run `cp src/account_tmp.js src/account.js`

Since blum team add more security to the app, botting is not easy like before, here i will tell you how to run the bot

1. Install [Telegram Desktop](https://desktop.telegram.org/).
2. Go to Settings > Advance > Experimental Settings > And enable Webview inspecting.
   ![image](https://github.com/Widiskel/metaboss-bot/blob/master/assets/image2.png)

Also read how to do inspect on your Operating system.

3. Now open Metaboss Webview game on your Telegram Desktop.
4. On the Webview window right click > inspect (on Windows) or open Safari > Develop > Your Device > Telegram (on Mac)
5. On Inspect Element or Developer Tools > go to Storage / Application tab
6. find `Session Storage`
7. look at `tgWebAppData` copy value, example `user=xxx` or `query_id=xxx`
   ![image](https://github.com/Widiskel/blum-bot/blob/master/assets/ss.png)
8. Now open `account.js` and fill up or paste your data like template data provided

```js
export const account = ["query_id=xxx", "query_id=xxx", "user=xxx", "user=xxx"];
```

10. Finnally run `npm run start`

## How To Update

- run `git pull`
- run `npm update`
- run the bot again `npm run start`

## Note

The account data can be expired (query data livetime around 1-2 day), because it have `hash` and `timeAuth`, so if your run the bot and you got error unauthorized, get your new `tgWebAppData`

if any error happen please check [HERE](https://github.com/Widiskel/blum-bot)
check the commit if any new commit, then update the bot.
