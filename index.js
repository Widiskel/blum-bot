import { Blum } from "./src/blum/blum.js";
import { Telegram } from "./src/core/telegram.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

async function operation(acc) {
  try {
    const blum = new Blum(acc);

    await blum.login();
    logger.info(`TOKEN : ${blum.token}`);

    await blum.checkIn();
    await blum.getUser();
    console.log(`===========================================================`);
    console.log(`@${blum.user.username}`);
    console.log(`===========================================================`);
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

    const uncompletableTaskIds = [
      "a90d8b81-0974-47f1-bb00-807463433bde",
      "03e4a46f-7588-4950-8289-f42787e3eca2",
    ];

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

    if (blum.balance.playPasses > 0) {
      for (let play = 0; play < blum.balance.playPasses; play++) {
        var err = false;
        await blum.play().catch(() => {
          err = true;
        });
        if (err) {
          break;
        }
      }
    }
    console.log("Account Processing done, continue using next account");
    console.log(`===========================================================`);
    console.log();
  } catch (error) {
    throw error;
  }
}
async function startBot() {
  try {
    const tele = await new Telegram();
    await tele.init();

    const sessionList = Helper.getSession("sessions");
    for (const ses of sessionList) {
      await tele.useSession("sessions/" + ses);
      tele.session = ses;

      const user = await tele.client.getMe();

      console.log("USER INFO");
      console.log("ID       : " + user.id);
      console.log("Username : " + user.username);
      console.log("Phone    : " + user.phone);
      console.log();

      const acc = await tele
        .resolvePeer()
        .then(
          async () =>
            await tele
              .initWebView()
              .then((query) => {
                return query;
              })
              .catch((err) => {
                throw err;
              })
        )
        .catch((err) => {
          throw err;
        });

      await tele.disconnect().then(async () => {
        console.log();
        await Helper.delay(1000);
      });

      console.log(acc);
      await operation(acc);
    }

    console.log("-> All Account processed, delaying for 10 minute");
    await Helper.delay(60000 * 10);
    await startBot();
  } catch (error) {
    console.error("Error :", error);
    logger.info(`Application Error : ${error}`);
    logger.error(JSON.stringify(error));
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
