import { account } from "./account.js";
import { Blum } from "./src/blum/blum.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startBot() {
  try {
    for (const acc of account) {
      const blum = new Blum(acc);

      try {
        await blum.login();
        logger.info(`TOKEN : ${blum.token}`);

        await blum.checkIn();
        await blum.getUser();
        console.log(
          `===========================================================`
        );
        console.log(`@${blum.user.username}`);
        console.log(
          `===========================================================`
        );
        console.log(`Id           : ${blum.user.id.id}`);
        console.log(`Username     : ${blum.user.username}`);
        await blum.getBalance();

        console.log(`Balance      : ${blum.balance.availableBalance}`);
        console.log(`Play Pases   : ${blum.balance.playPasses}`);
        if (blum.balance.farming) {
          console.log(
            `Farming      : ${Helper.readTime(
              blum.balance.farming.startTime
            )} - ${Helper.readTime(blum.balance.farming.endTime)} Rate: ${
              blum.balance.farming.earningsRate
            } Balance : ${blum.balance.farming.balance}  ${
              Helper.isFutureTime(blum.balance.farming.endTime)
                ? "(Claimable)"
                : "(Unclaimable)"
            }`
          );
          console.log();
          if (Helper.isFutureTime(blum.balance.farming.endTime)) {
            await blum
              .claim()
              .then(() => {
                console.log("-> Mining Claimed Successfully");
              })
              .catch((err) => {
                console.error("Error during claim:", err.message);
                logger.info(`Application Error : ${err}`);
                throw err;
              });
          }
        }
        await blum
          .mining()
          .then(() => {
            console.log("-> Mining Started Successfully");
          })
          .catch((err) => {
            console.error("Error during mining:", err.message);
            logger.info(`Application Error : ${err}`);
            throw err;
          });

        console.log();

        await blum.getTasks();

        const uncompletableTaskIds = ["a90d8b81-0974-47f1-bb00-807463433bde"];

        const uncompletedTasks = blum.tasks.filter(
          (task) =>
            task.status !== "FINISHED" &&
            task.type === "SOCIAL_SUBSCRIPTION" &&
            !uncompletableTaskIds.includes(task.id)
        );

        console.log(`Tasks             : ${blum.tasks.length}`);
        console.log(`Uncompleted Task  : ${uncompletedTasks.length}`);
        console.log();

        for (const task of uncompletedTasks) {
          if (task.status === "NOT_STARTED") {
            await blum.startAndCompleteTask(task.id);
          } else {
            await blum.completeTask(task.id);
          }
        }

        // if (blum.balance.playPasses > 0) {
        //   for (let play = 0; play < blum.balance.playPasses; play++) {
        //     await blum.play();
        //   }
        // }
        console.log("Account Processing done, continue using next account");
        console.log(
          `===========================================================`
        );
        console.log();
      } catch (err) {
        console.error(
          `Error during operation for account ${account.indexOf(acc) + 1}:`,
          err.message
        );
        throw err;
      }
    }

    console.log("-> All Account processed, delaying for 10 minute");
    await delay(60000 * 10);
    await startBot();
  } catch (error) {
    console.error("Error :", error);
    logger.info(`Application Error : ${error}`);
  }
}

(async () => {
  try {
    logger.info("");
    logger.info("Application Started");
    await startBot();
  } catch (error) {
    console.error("Error in main process:", error);
    logger.info(`Application Error : ${error}`);
    throw error;
  }
})();