import { API } from "../api/api.js";
import { Helper } from "../utils/helper.js";

export class Blum extends API {
  constructor(acc, query, queryObj, proxy) {
    super(proxy);
    this.account = acc;
    this.query = query;
    this.elig = false;
  }

  async login() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(500, this.account, `Try to Login...`, this);
      await this.fetch(
        "https://user-domain.blum.codes/api/v1/auth/provider/PROVIDER_TELEGRAM_MINI_APP",
        "POST",
        undefined,
        {
          query: this.query,
        }
      )
        .then(async (data) => {
          this.token = data.token.access;
          this.refresh = data.token.refresh;
          await Helper.delay(500, this.account, `Succesfully Login...`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getUser(msg = false) {
    return new Promise(async (resolve, reject) => {
      if (msg)
        await Helper.delay(500, this.account, `Getting User Info...`, this);
      await this.fetch(
        "https://gateway.blum.codes/v1/user/me",
        "GET",
        this.token
      )
        .then(async (data) => {
          this.user = data;
          if (msg)
            await Helper.delay(500, this.account, `Succesfully Login...`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getBalance(msg = false) {
    return new Promise(async (resolve, reject) => {
      if (msg)
        await Helper.delay(500, this.account, `Getting User Balance...`, this);
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/user/balance",
        "GET",
        this.token
      )
        .then(async (data) => {
          if (msg)
            await Helper.delay(
              500,
              this.account,
              `Succesfully Get User Balance...`,
              this
            );
          this.balance = data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async claim() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        500,
        this.account,
        `Try To Claim Farming Reward...`,
        this
      );
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/farming/claim",
        "POST",
        this.token
      )
        .then(async (data) => {
          this.balance.availableBalance = data.availableBalance;
          this.balance.playPasses = data.playPasses;
          await Helper.delay(1000, this.account, `Farmin Reward Claimed`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async mining() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(500, this.account, `Try to Start Farm...`, this);
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/farming/start",
        "POST",
        this.token
      )
        .then(async (data) => {
          this.balance.farming = {
            startTime: 0,
            endTime: 0,
            earningsRate: 0,
            balance: 0,
          };
          this.balance.farming.startTime = data.startTime;
          this.balance.farming.endTime = data.endTime;
          this.balance.farming.earningsRate = data.earningsRate;
          this.balance.farming.balance = data.balance;

          await Helper.delay(500, this.account, `Farming Started...`, this);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getTasks(msg = false) {
    return new Promise(async (resolve, reject) => {
      if (msg)
        await Helper.delay(
          500,
          this.account,
          `Getting Available Task...`,
          this
        );
      await this.fetch(
        "https://earn-domain.blum.codes/api/v1/tasks",
        "GET",
        this.token
      )
        .then(async (data) => {
          this.tasks = [];
          for (const tasks of data) {
            if (tasks.tasks) {
              for (const item of tasks.tasks) {
                if (item.subTasks) {
                  this.tasks.push(...item.subTasks);
                } else {
                  this.tasks.push(item);
                }
              }
            }
            if (tasks.subSections) {
              for (const subsection of tasks.subSections) {
                this.tasks.push(...subsection.tasks);
              }
            }
          }
          if (msg)
            await Helper.delay(
              3000,
              this.account,
              `Successfully Get Tasks`,
              this
            );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async startAndCompleteTask(taskId) {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        1000,
        this.account,
        `Try To Complete Mission with id ${taskId}...`,
        this
      );
      await this.fetch(
        `https://earn-domain.blum.codes/api/v1/tasks/${taskId}/start`,
        "POST",
        this.token
      )
        .then(async (data) => {
          if (data.status == "STARTED" || data.status == "READY_FOR_CLAIM") {
            await this.completeTask(taskId)
              .then(resolve)
              .catch((err) => reject(err));
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async validateAndCompleteTask(taskId, answer) {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        1000,
        this.account,
        `Try To Validating Mission with id ${taskId}...`,
        this
      );
      const body = { keyword: answer };
      await this.fetch(
        `https://earn-domain.blum.codes/api/v1/tasks/${taskId}/validate`,
        "POST",
        this.token,
        body
      )
        .then(async (data) => {
          if (data.status == "STARTED" || data.status == "READY_FOR_CLAIM") {
            await this.completeTask(taskId)
              .then(resolve)
              .catch((err) => reject(err));
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async completeTask(taskId) {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        2000,
        this.account,
        `Mission Completion for Task ${taskId} Started`,
        this
      );
      await this.fetch(
        "https://earn-domain.blum.codes/api/v1/tasks/" + taskId + "/claim",
        "POST",
        this.token
      )
        .then(async (data) => {
          if (data.status == "FINISHED") {
            await Helper.delay(
              3000,
              this.account,
              `Mission Completion for Task ${taskId} ${data.title} ${data.status}`,
              this
            );
            await this.getTasks();
            resolve();
          } else {
            resolve();
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async play() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(
        500,
        this.account,
        `Trying to play a game using play pass...`,
        this
      );
      await this.fetch(
        "https://game-domain.blum.codes/api/v2/game/play",
        "POST",
        this.token
      )
        .then(async (data) => {
          await this.getBalance();
          const max = 250;
          const min = 200;
          await Helper.delay(
            500,
            this.account,
            `Got Game ID ${data.gameId},  Start playing`,
            this
          );
          await Helper.delay(
            30000,
            this.account,
            `Game ID ${data.gameId}, Playing for 30 Second`,
            this
          );
          await this.claimGame(
            data.gameId,
            Math.floor(Math.random() * (max - min + 1)) + min
          );

          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async gamePayloadGenerator(gameBody) {
    try {
      const zuydd = await this.fetch(
        "https://raw.githubusercontent.com/zuydd/database/main/blum.json",
        "GET"
      );

      const payloadServer = JSON.parse(zuydd).payloadServer.find(
        (item) => item.status === 1
      );

      if (!payloadServer) {
        throw new Error("No payload server found with status 1");
      }

      const requestBody = {
        game_id: gameBody.gameId,
        points: gameBody.points,
      };

      const res = await this.fetch(
        `https://${payloadServer.id}.vercel.app/api/`,
        "POST",
        undefined,
        requestBody
      );

      return res;
    } catch (err) {
      throw err;
    }
  }
  async getTaskAnswer() {
    try {
      const zuydd = await this.fetch(
        "https://raw.githubusercontent.com/zuydd/database/main/blum.json",
        "GET"
      );

      this.TASKANSWER = JSON.parse(zuydd).tasks;

      if (!this.TASKANSWER) {
        throw new Error("No Task ANswer FOund");
      }
    } catch (err) {
      throw err;
    }
  }

  async checkDogsElig() {
    await Helper.delay(
      500,
      this.account,
      `Checking if user eligible for dogs`,
      this
    );

    try {
      const res = await this.fetch(
        "https://game-domain.blum.codes/api/v2/game/eligibility/dogs_drop",
        "GET",
        this.token
      );
      this.elig = res.eligible;
      await Helper.delay(
        500,
        this.account,
        `You are ${
          res.eligible == true ? "Eligible" : "Not Eligible"
        } for dogs airdrop`,
        this
      );
    } catch (err) {}
  }

  async claimGame(gameId, score) {
    await Helper.delay(
      500,
      this.account,
      `Claiming game ${gameId} With Score ${score}`,
      this
    );

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        await this.fetch(
          "https://game-domain.blum.codes/api/v2/game/claim",
          "POST",
          this.token,
          await this.gamePayloadGenerator({
            gameId: gameId,
            points: score,
          })
        );
        await Helper.delay(
          10000,
          this.account,
          `Game ${gameId} Claimed with Score ${score}. Delaying For 10 Second`,
          this
        );
        return; // Resolve the promise
      } catch (err) {
        retryCount += 1;
        if (retryCount > maxRetries) {
          return Promise.reject(err); // Reject if max retries reached
        }
        await Helper.delay(
          3000,
          this.account,
          `Claim game failed, retrying after 3 seconds`,
          this
        );
      }
    }
  }

  async checkIn() {
    return new Promise(async (resolve, reject) => {
      await Helper.delay(500, this.account, `Try to Check In...`, this);
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
        "GET",
        this.token
      )
        .then(async () => {
          await this.fetch(
            "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
            "POST",
            this.token
          )
            .then(async () => {
              await Helper.delay(
                1000,
                this.account,
                `Successfully Check In`,
                this
              );
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch(async (err) => {
          if (err.message.includes("Not Found")) {
            await Helper.delay(
              1000,
              this.account,
              `User Already Checked In`,
              this
            );
            resolve();
          } else {
            reject(err);
          }
        });
    });
  }
}
