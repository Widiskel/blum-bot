import { Blum } from "./blum.js";

class BlumException {
  constructor(blum) {
    this.maxRetries = 3;
    this.retryableErrors = [];

    /** @type {Blum} */
    this.blum = blum;
  }

  setRoutine() {
    this.retryableErrors = [];
  }

  async retryContext(context, subcontext) {
    console.log(`Retrying... ${context} ${subcontext}`);
    if (context === "rollDice") {
      await this.civitia.rollDice();
    }
  }

  async handlingError(error, context) {
    if (error.me != undefined) {
    } else {
    }
  }
}
