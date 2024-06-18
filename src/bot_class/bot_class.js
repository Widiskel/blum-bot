import { API } from "../api/api.js";

export class BotClass extends API {
  constructor(account) {
    super(account);
  }

  async login() {
    return new Promise(async (resolve, reject) => {
      await this.fetch("login", "POST")
        .then((data) => {
          this.token = data.token;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
