import { account } from "./account.js";
import { BotClass } from "./src/bot_class/bot_class.js";
import logger from "./src/utils/logger.js";

async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      for (const acc of account) {
        const botClass = new BotClass(acc);
        await botClass
          .login()
          .then(async () => {})
          .catch((error) => {
            console.error("Error during login : ", error);
          });
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

(async () => {
  try {
    logger.info("");
    logger.info("Application Started");
    await startBot();
  } catch (error) {
    console.log("Error During executing bot", error);
  }
})();
