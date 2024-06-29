import input from "input";
import { Helper } from "../utils/helper.js";
import { Config } from "../config/config.js";
import { Api, TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/StoreSession.js";
import logger from "../utils/logger.js";

export class Telegram {
  storeSession;

  constructor() {
    this.sessionName = "sessions";
    this.url = "https://gateway.blum.codes/";
  }

  async init() {
    try {
      await this.onBoarding();
    } catch (error) {
      console.log(error);
      logger.error(`${JSON.stringify(error)}`);
      throw error;
    }
  }
  async onBoarding() {
    try {
      const choice = await input.text(
        "Welcome to Blum Bot \nBy : Widiskel \n \nLets getting started. \n1. Create Session. \n2. Reset Sessions \n3. Start Bot \n \nInput your choice :"
      );
      if (choice == 1) {
        await this.sessionCreation();
      } else if (choice == 2) {
        Helper.resetSession(this.sessionName);
        await this.onBoarding();
      } else if (choice == 3) {
        if (Helper.getSession(this.sessionName)?.length == 0) {
          console.info("You don't have any sessions, please create first");
          await this.onBoarding();
        }
      } else {
        console.error("Invalid input, Please try again");
        await this.onBoarding();
      }
    } catch (error) {
      throw error;
    }
  }
  async sessionCreation() {
    try {
      const sessionList = Helper.getSession("sessions");
      let ctx = "Your session List :\n \n";

      for (const sess of sessionList) {
        ctx += `${sessionList.indexOf(sess) + 1}. ${sess}\n`;
      }
      if (sessionList.length == 0) {
        ctx += "<empty> \n \nPlease enter Session Name :";
      } else {
        ctx +=
          "\n \nYou alreay have sessions, cancel(CTRL+C) or create new Session :";
      }

      const newSession = await input.text(ctx);
      this.sessionName = Helper.createDir(newSession);
      await this.useSession(this.sessionName);
      await this.disconnect();
      logger.info(`Session ${this.sessionName} - Created`);
      console.log(`Session ${this.sessionName} - Created`);
      this.storeSession.save();
      await Helper.delay(2000);
      await this.init();
    } catch (error) {
      throw error;
    }
  }

  async useSession(sessionName) {
    try {
      this.storeSession = new StoreSession(sessionName);
      this.client = new TelegramClient(
        this.storeSession,
        Config.TELEGRAM_APP_ID,
        Config.TELEGRAM_APP_HASH,
        {
          connectionRetries: 5,
        }
      );
      this.storeSession.save();

      await this.client.start({
        phoneNumber: async () =>
          await input.text(
            "Enter your Telegram Phone Number starting with country code ex: +628xxxxxxx ?"
          ),
        password: async () => await input.text("Enter your Telegram Password?"),
        phoneCode: async () =>
          await input.text("Enter your Telegram Verification Code ?"),
        onError: (err) => {
          console.log(err.message);
        },
      });
      console.log();
    } catch (error) {
      throw error;
    }
  }

  async resolvePeer() {
    try {
      logger.info(`Session ${this.session} - Resolving Peer`);
      while (this.peer == undefined) {
        try {
          this.peer = await this.client.getEntity("BlumCryptoBot");
          break;
        } catch (error) {
          if (error instanceof FloodWaitError) {
            const fls = error.seconds;

            logger.warn(
              `${this.client.session.serverAddress} | FloodWait ${error}`
            );
            logger.info(`${this.client.session.serverAddress} | Sleep ${fls}s`);

            await Helper.delay((fls + 3) * 1000);
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    await this.client.disconnect();
    await this.client.destroy();
    this.peer = undefined;
    this.sessionName = undefined;
  }

  async initWebView() {
    try {
      const webView = await this.client.invoke(
        new Api.messages.RequestWebView({
          peer: this.peer,
          bot: this.peer,
          fromBotMenu: true,
          url: this.url,
          platform: "android",
        })
      );
      logger.info(`Session ${this.session} - Webview Connected`);

      const authUrl = webView.url;
      return Helper.getTelegramQuery(authUrl, 2);
    } catch (error) {
      throw error;
    }
  }
}
