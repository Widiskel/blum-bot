import { Blum } from "./src/blum/blum.js";
import { TASKANSWER } from "./src/blum/taskanswer.js";
import { proxyList } from "./src/config/proxy_list.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

async function operation(acc, query, queryObj, proxy) {
  logger.clear();
  try {
    const blum = new Blum(acc, query, queryObj, proxy);

    await blum.login();
    await blum.getUser(true);
    await blum.getBalance(true);
    await blum.checkIn();
    if (blum.balance.farming) {
      if (Helper.isFutureTime(blum.balance.farming.endTime)) {
        await blum.claim();
      }
    }
    await blum.mining();
    await blum.getTasks(true);
    const uncompletableTaskIds = [
      "a90d8b81-0974-47f1-bb00-807463433bde",
      "03e4a46f-7588-4950-8289-f42787e3eca2",
    ];

    const uncompletedTasks = blum.tasks.filter(
      (task) =>
        task.status !== "FINISHED" &&
        task.type !== "WALLET_CONNECTION" &&
        task.type !== "PROGRESS_TARGET" &&
        !uncompletableTaskIds.includes(task.id)
    );
    for (const task of uncompletedTasks) {
      if (task.status === "NOT_STARTED") {
        await blum.startAndCompleteTask(task.id);
      } else if (task.status === "READY_FOR_VERIFY") {
        const answer = TASKANSWER.getAnswer(task.id);
        if (answer) {
          await blum.validateAndCompleteTask(task.id, answer);
        }
      } else {
        await blum.completeTask(task.id);
      }
    }

    let err = 0;
    while (blum.balance.playPasses > 0) {
      await blum.play().catch(() => {
        err += 1;
      });
      if (err > 5) {
        await Helper.delay(
          3000,
          acc,
          "Failed to play game something wen't wrong",
          blum
        );
        logger.error(err);
        break;
      }
    }
    await Helper.delay(
      60000 * 10,
      acc,
      "Account Processing Complete, Delaying for 1 hour",
      blum
    );
    await operation(acc, query, queryObj, proxy);
  } catch (error) {
    await Helper.delay(
      10000,
      acc,
      `Error : ${error}, Retrying after 10 Second`
    );
    await operation(acc, query, queryObj, proxy);
  }
}

let init = false;
async function startBot() {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info(`BOT STARTED`);

      const tele = await new Telegram();
      if (init == false) {
        await tele.init();
        init = true;
      }

      const accountList = Helper.getSession("accounts");
      const paramList = [];

      if (proxyList.length > 0) {
        if (accountList.length != proxyList.length) {
          reject(
            `You have ${accountList.length} Session but you provide ${proxyList.length} Proxy`
          );
        }
      }

      for (const acc of accountList) {
        const accIdx = accountList.indexOf(acc);
        const proxy = proxyList.length > 0 ? proxyList[accIdx] : undefined;
        if (!acc.includes("query")) {
          await tele.useSession("accounts/" + acc, proxy);
          tele.session = acc;
          const user = await tele.client.getMe();
          const query = await tele
            .resolvePeer()
            .then(async () => {
              return await tele.initWebView();
            })
            .catch((err) => {
              throw err;
            });

          const queryObj = Helper.queryToJSON(query);
          await tele.disconnect();
          paramList.push([user, query, queryObj, proxy]);
        } else {
          const query = Helper.readQueryFile("accounts/" + acc + "/query.txt");
          const queryObj = Helper.queryToJSON(query);
          const user = queryObj.user;
          user.firstName = user.first_name;
          user.lastName = user.last_name;
          paramList.push([user, query, queryObj, proxy]);
        }
      }

      const promiseList = paramList.map(async (data) => {
        await operation(data[0], data[1], data[2], data[3]);
      });

      await Promise.all(promiseList);
      resolve();
    } catch (error) {
      logger.info(`BOT STOPPED`);
      logger.error(JSON.stringify(error));
      reject(error);
    }
  });
}

(async () => {
  try {
    logger.info("");
    logger.clear();
    logger.info("Application Started");
    await startBot();
  } catch (error) {
    console.error("Error in main process:", error);
    logger.info(`Application Error : ${error}`);
    throw error;
  }
})();
