import { Twisters } from "twisters";
import logger from "./logger.js";
import { Blum } from "../blum/blum.js";
import { Helper } from "./helper.js";

class Twist {
  constructor() {
    /** @type  {Twisters}*/
    this.twisters = new Twisters();
  }

  /**
   * @param {string} acc
   * @param {Blum} blum
   * @param {string} msg
   * @param {string} delay
   */
  log(msg = "", acc = "", blum = new Blum(), delay) {
    // console.log(acc);
    if (delay == undefined) {
      logger.info(`${acc.id} - ${msg}`);
      delay = "-";
    }

    const balance = blum.balance ?? {};
    const blumBalance = balance.availableBalance ?? "-";
    const playPasses = balance.playPasses ?? "-";
    const farm = balance.farming
      ? `${Helper.readTime(balance.farming.startTime)} - ${Helper.readTime(
          balance.farming.endTime
        )} Rate: ${balance.farming.earningsRate} Balance : ${
          balance.farming.balance
        }  ${
          Helper.isFutureTime(balance.farming.endTime)
            ? "(Claimable)"
            : "(Unclaimable)"
        }`
      : "-";

    const task = blum.tasks ?? [];
    const completedTask =
      task.length != 0
        ? task.filter((item) => {
            return item.status === "FINISHED";
          }).length
        : "-";
    const uncompletableTaskIds = [
      "a90d8b81-0974-47f1-bb00-807463433bde",
      "03e4a46f-7588-4950-8289-f42787e3eca2",
    ];
    const uncompletedTask =
      task.length > 0
        ? task.filter(
            (item) =>
              item.status !== "FINISHED" &&
              item.type !== "WALLET_CONNECTION" &&
              item.type !== "PROGRESS_TARGET" &&
              !uncompletableTaskIds.includes(item.id)
          ).length
        : "-";

    this.twisters.put(acc.id, {
      text: `
================= Account ${acc.id} =============
Name      : ${acc.firstName} ${acc.lastName}
Balance   : ${blumBalance}
Play Pass : ${playPasses}
Farm      : ${farm}
Task      : ${completedTask} Completed | ${uncompletedTask} Uncompleted

Status : ${msg}
Delay : ${delay}
==============================================`,
    });
  }
  /**
   * @param {string} msg
   */
  info(msg = "") {
    this.twisters.put(2, {
      text: `
==============================================
Info : ${msg}
==============================================`,
    });
    return;
  }

  clearInfo() {
    this.twisters.remove(2);
  }

  clear(acc) {
    this.twisters.remove(acc);
  }
}

export default new Twist();
