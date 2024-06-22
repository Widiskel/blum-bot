import { API } from "../api/api.js";
import { Helper } from "../utils/helper.js";

export class Blum extends API {
  constructor(account) {
    super();
    this.query = account;
  }

  async login() {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://gateway.blum.codes/v1/auth/provider/PROVIDER_TELEGRAM_MINI_APP",
        "POST",
        undefined,
        {
          query: this.query,
        }
      )
        .then((data) => {
          this.token = data.token.access;
          this.refresh = data.token.refresh;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getUser() {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://gateway.blum.codes/v1/user/me",
        "GET",
        this.token
      )
        .then((data) => {
          this.user = data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getBalance() {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/user/balance",
        "GET",
        this.token
      )
        .then((data) => {
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
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/farming/claim",
        "POST",
        this.token
      )
        .then((data) => {
          this.balance.availableBalance = data.availableBalance;
          this.balance.playPasses = data.playPasses;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async mining() {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/farming/start",
        "POST",
        this.token
      )
        .then((data) => {
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
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getTasks() {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/tasks",
        "GET",
        this.token
      )
        .then((data) => {
          this.tasks = data;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async startAndCompleteTask(taskId) {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        `https://game-domain.blum.codes/api/v1/tasks/${taskId}/start`,
        "POST",
        this.token
      )
        .then(async (data) => {
          if (data.status == "STARTED" || data.status == "READY_FOR_CLAIM") {
            console.log(`-> Task ${taskId} ${data.title} Started`);
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
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/tasks/" + taskId + "/claim",
        "POST",
        this.token
      )
        .then((data) => {
          if (data.status == "FINISHED") {
            console.log(`-> Task ${taskId} ${data.title} ${data.status}`);
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
  async refreshToken() {
    return new Promise(async (resolve, reject) => {
      console.log("-> Refreshing token");
      await this.fetch(
        "https://gateway.blum.codes/v1/auth/refresh",
        "POST",
        undefined,
        {
          refresh: this.refresh,
        }
      )
        .then((data) => {
          this.token = data.access;
          this.refresh = data.refresh;
          resolve();
        })
        .catch((err) => {
          reject(new Error("Query Data Expired"));
        });
    });
  }
  async play() {
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/game/play",
        "POST",
        this.token
      )
        .then(async (data) => {
          console.log(data);
          console.log(`-> Play Game for 30 Second`);
          await Helper.delay(30000);
          await this.claimGame(
            data.gameId,
            Math.floor(Math.random() * (500 - 300 + 1)) + 300
          );
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async claimGame(gameId, score) {
    console.log(`-> Claim game with score ${score}`);
    return new Promise(async (resolve, reject) => {
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/game/claim",
        "POST",
        this.token,
        {
          gameId: gameId,
          points: score,
        }
      )
        .then((data) => {
          console.log(data);
          this.balance.playPasses -= 1;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async checkIn() {
    return new Promise(async (resolve, reject) => {
      console.log();
      console.log("-> Check In");
      await this.fetch(
        "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
        "GET",
        this.token
      )
        .then(async () => {
          console.log("-> Check In success");
          await this.fetch(
            "https://game-domain.blum.codes/api/v1/daily-reward?offset=-420",
            "POST",
            this.token
          )
            .then(resolve)
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          if (err.message.includes("Not Found")) {
            console.log("-> Already Checked In");
            resolve();
          } else {
            reject(err);
          }
        });
    });
  }
}
