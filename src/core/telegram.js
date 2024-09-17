import input from "input";
import { Helper } from "../utils/helper.js";
import { Api, TelegramClient } from "telegram";
import { StoreSession } from "telegram/sessions/StoreSession.js";
import logger from "../utils/logger.js";
import { FloodWaitError } from "telegram/errors/RPCErrorList.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Config } from "../config/config.js";

export class Telegram {
  storeSession;

  constructor() {
    this.accountName = "accounts";
    this.url = "https://game-domain.blum.codes";
    this.bot = "BlumCryptoBot";
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
      let ctx =
        "Welcome to BLUM Bot \nBy : Widiskel \n \nLets getting started.\n\nYour Session List:\n";
      const accountList = Helper.getSession("accounts");

      if (accountList.length == 0) {
        ctx += "<empty>";
      } else {
        for (const sess of accountList) {
          ctx += `- ${sess}\n`;
        }
      }
      ctx += "\n \nPlease Choose a menu: \n";
      ctx +=
        "\n \n1. Create Account \n2. Reset Account \n3. Start Bot\n4. Query modification\n \nInput your choice :";
      const choice = await input.text(ctx);
      if (choice == 1) {
        await this.accountType();
      } else if (choice == 2) {
        Helper.resetAccounts();
        await Helper.delay(3000);
        await this.onBoarding();
      } else if (choice == 3) {
        if (Helper.getSession(this.accountName)?.length == 0) {
          console.info("You don't have any Accounts, please create first");
          await this.onBoarding();
        }
      } else if (choice == 4) {
        await this.queryModificaiton();
      } else {
        console.error("Invalid input, Please try again");
        await this.onBoarding();
      }
    } catch (error) {
      throw error;
    }
  }

  async queryModificaiton() {
    try {
      const accountList = Helper.getSession("accounts");
      const queryAccountList = accountList.filter((item) =>
        item.includes("query")
      );
      let ctx = "Your Query Account List :\n \n";

      for (const acc of queryAccountList) {
        ctx += `${accountList.indexOf(acc) + 1}. ${acc}\n`;
      }
      if (queryAccountList.length == 0) {
        console.log("You dont have any Query Account.");
        await this.onBoarding();
      } else {
        ctx += "\n \nPlease Select Query Account for modification:";
      }

      const choice = await input.text(ctx);

      if (queryAccountList[choice - 1] != undefined) {
        const account = queryAccountList[choice - 1];
        this.accountName = `accounts/${account}`;
        const ctx2 = `Old Query : ${Helper.readQueryFile(
          `${this.accountName}/query.txt`
        )}\n \nPlease Enter New Query `;
        const newQuery = await input.text(ctx2);
        await Helper.saveQueryFile(this.accountName, newQuery);
        await Helper.delay(3000);
        await this.onBoarding();
      } else {
        console.error("Invalid input, Please try again");
        await this.queryModificaiton();
      }
    } catch (error) {
      throw error;
    }
  }

  async sessionCreation() {
    try {
      if (
        Config.TELEGRAM_APP_ID == undefined ||
        Config.TELEGRAM_APP_HASH == undefined
      ) {
        throw new Error(
          "Please configure your TELEGRAM_APP_ID and TELEGRAM_APP_HASH first"
        );
      }
      const accountList = Helper.getSession("accounts");
      let ctx = "Your Account List :\n \n";

      for (const sess of accountList) {
        ctx += `${accountList.indexOf(sess) + 1}. ${sess}\n`;
      }
      if (accountList.length == 0) {
        ctx += "<empty> \n \nPlease enter Session Name :";
      } else {
        ctx +=
          "\n \nYou already have sessions, cancel(CTRL+C) or create new Session :";
      }

      const newSession = await input.text(ctx);
      this.accountName = Helper.createDir("sessions-" + newSession);
      await this.useSession(this.accountName);
      await this.disconnect();
      logger.info(`Session ${this.accountName} - Created`);
      console.log(
        `Session ${newSession} - Created, Please Restart The Bot Again`
      );
      this.storeSession.save();
      await Helper.delay(3000);
      process.exit();
    } catch (error) {
      throw error;
    }
  }

  async queryCreation() {
    try {
      const accountList = Helper.getSession("accounts");
      let ctx = "Your Account List :\n \n";

      for (const acc of accountList) {
        ctx += `${accountList.indexOf(acc) + 1}. ${acc}\n`;
      }
      if (accountList.length == 0) {
        ctx += "<empty> \n \nPlease enter Account Name :";
      } else {
        ctx +=
          "\n \nYou already have Account, cancel(CTRL+C) or create new Account :";
      }

      const newAccount = await input.text(ctx);
      this.accountName = Helper.createDir("query-" + newAccount);

      let ctx2 = "Please Enter Telegram Query : ";
      const query = await input.text(ctx2);
      await Helper.saveQueryFile(this.accountName, query);

      logger.info(`Query ${this.accountName} - Created`);
      console.log(
        `Query ${newAccount} - Created, Please Restart The Bot Again`
      );
      await Helper.delay(3000);
      process.exit();
    } catch (error) {
      throw error;
    }
  }

  async accountType() {
    try {
      const accountList = Helper.getSession("accounts");
      let ctx = "Your Account List :\n \n";

      if (accountList.length > 0) {
        for (const sess of accountList) {
          ctx += `${accountList.indexOf(sess) + 1}. ${sess}\n`;
        }
      } else {
        ctx += `<empty>\n`;
      }
      ctx +=
        "\n \nAvailable Account Type: \n1. Session \n2. Query\n \nPlease Entery Your Choice : ";

      const type = await input.text(ctx);

      if (type == 1) {
        await this.sessionCreation();
      } else if (type == 2) {
        await this.queryCreation();
      } else {
        console.log("Invalid Input");
        await this.accountType();
      }
    } catch (error) {
      throw error;
    }
  }

  async useSession(accountName, proxy) {
    try {
      this.proxy = proxy;
      const clientOptions = {
        connectionRetries: 5,
      };
      if (this.proxy) {
        clientOptions.agent = new HttpsProxyAgent(this.proxy);
      }

      this.storeSession = new StoreSession(accountName);
      this.client = new TelegramClient(
        this.storeSession,
        Config.TELEGRAM_APP_ID,
        Config.TELEGRAM_APP_HASH,
        clientOptions
      );
      this.storeSession.save();

      await this.client.start({
        phoneNumber: async () =>
          await input.text("Enter your Telegram Phone Number ?"),
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
          this.peer = await this.client.getEntity(this.bot);
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
    this.accountName = undefined;
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
      // https://clicker.cowtopia.exchange/#tgWebAppData=query_id%3DAAGnbflTAgAAAKdt-VOyCnnH%26user%3D%7B%22id%22%3A5703822759%2C%22first_name%22%3A%22Widi%22%2C%22last_name%22%3A%22Saputro%22%2C%22username%22%3A%22Wskel%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D%26auth_date%3D1719831259%26hash%3De2647dd46bb9308103b20c27ba75fe8343295eed09f53d2bc927a59975d0f3c4&tgWebAppVersion=7.6&tgWebAppPlatform=tdesktop&tgWebAppThemeParams={"accent_text_color"%3A"%23168acd"%2C"bg_color"%3A"%23ffffff"%2C"button_color"%3A"%2340a7e3"%2C"button_text_color"%3A"%23ffffff"%2C"destructive_text_color"%3A"%23d14e4e"%2C"header_bg_color"%3A"%23ffffff"%2C"hint_color"%3A"%23999999"%2C"link_color"%3A"%23168acd"%2C"secondary_bg_color"%3A"%23f1f1f1"%2C"section_bg_color"%3A"%23ffffff"%2C"section_header_text_color"%3A"%23168acd"%2C"section_separator_color"%3A"%23e7e7e7"%2C"subtitle_text_color"%3A"%23999999"%2C"text_color"%3A"%23000000"}
      const authUrl = webView.url;
      // console.log(authUrl);
      return Helper.getTelegramQuery(authUrl, 3);
    } catch (error) {
      throw error;
    }
  }
}
