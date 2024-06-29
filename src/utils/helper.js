import { URL } from "url";
import moment from "moment";
import momentTz from "moment-timezone";
import fs from "fs";
import path from "path";

export class Helper {
  /**
   * Give random user agent
   *
   * @returns {string} random user agent
   */
  static randomUserAgent() {
    const list_useragent = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/125.2535.60 Mobile/15E148 Safari/605.1.15",
      "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 EdgA/124.0.2478.104",
      "Mozilla/5.0 (Linux; Android 10; VOG-L29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
      "Mozilla/5.0 (Linux; Android 10; SM-N975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.113 Mobile Safari/537.36 OPR/76.2.4027.73374",
    ];
    return list_useragent[Math.floor(Math.random() * list_useragent.length)];
  }

  /**
   * Checks given timestamp.
   *
   * @param {number} milliseconds - The timestamp in milliseconds.
   */
  static readTime(milliseconds) {
    const date = moment(milliseconds);
    return date.format("YYYY-MM-DD HH:mm:ss");
  }

  static getCurrentTimestamp() {
    const timestamp = momentTz().tz("Asia/Jakarta").unix();
    return timestamp.toString();
  }

  /**
   * Checks if the given timestamp in milliseconds is before than the current time.
   *
   * @param {number} milliseconds - The timestamp in milliseconds.
   * @returns {boolean} True if the timestamp is before than the current time, false otherwise.
   */
  static isFutureTime(milliseconds) {
    const now = moment.tz(moment(), "Asia/Jakarta");
    const givenTime = moment.tz(milliseconds, "Asia/Jakarta");

    return givenTime.isBefore(now);
  }

  /**
   * Extracts the domain from a given URL.
   *
   * @param {string} urlString - The URL from which to extract the domain.
   * @returns {string} The domain of the URL.
   */
  static getDomain(urlString) {
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return null;
    }
  }

  static async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static getSession(sessionName) {
    try {
      const sessionsPath = "sessions";
      if (!fs.existsSync(sessionsPath)) {
        fs.mkdirSync(sessionsPath);
      }
      const files = fs.readdirSync(path.resolve(sessionName));
      const session = [];
      files.forEach((file) => {
        session.push(file);
      });
      return session;
    } catch (error) {
      throw Error(`Error reading sessions directory: ${error},`);
    }
  }

  static resetSession(sessionName) {
    try {
      const files = fs.readdirSync(path.resolve(sessionName));
      console.log("Deleting Sessions...");
      files.forEach((file) => {
        fs.rm(
          `${path.join(path.resolve("sessions"), file)}`,
          { recursive: true },
          (err) => {
            if (err) throw err;
          }
        );
      });
      console.info("Sessions reset successfully");
    } catch (error) {
      throw Error(`Error deleting session files: ${error},`);
    }
  }

  static createDir(dirName) {
    try {
      const sessionsPath = "sessions";
      if (!fs.existsSync(sessionsPath)) {
        fs.mkdirSync(sessionsPath);
      }

      const dirPath = path.join(sessionsPath, dirName);

      fs.mkdirSync(dirPath, { recursive: true });

      console.log(dirPath);
      return dirPath;
    } catch (error) {
      throw new Error(`Error creating directory: ${error}`);
    }
  }

  static getTelegramQuery(url, type) {
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      throw new Error("No query string found in the URL.");
    }

    const queryString = url.substring(hashIndex + 1);
    const decodedQueryString = queryString.split("&");
    const param = decodedQueryString[0]
      .split("&")[0]
      .replace("tgWebAppData=", "");

    if (!param) {
      throw new Error("Param not found in the query string.");
    }

    if (type == "1") {
      return param;
    } else if (type == "2") {
      return this.decodeQueryString(param);
    } else {
      const newParam = this.decodeQueryString(param);
      return this.jsonToInitParam(newParam);
    }
  }

  static jsonToInitParam(dataString) {
    const newData = parse(dataString);

    if (newData.user) {
      const userObject = JSON.parse(newData.user);
      newData.user = encodeURIComponent(JSON.stringify(userObject));
    }

    const resultArray = [];
    for (const [key, value] of Object.entries(newData)) {
      resultArray.push(`${key}=${value}`);
    }
    const result = resultArray.join("&");

    return result;
  }

  static decodeQueryString(encodedString) {
    const decodedString = decodeURIComponent(encodedString);
    const paramsArray = decodedString.split("&");
    const paramsObject = {};

    paramsArray.forEach((param) => {
      const [key, value] = param.split("=");
      if (key === "user") {
        paramsObject[key] = JSON.parse(decodeURIComponent(value));
      } else {
        paramsObject[key] = value;
      }
    });

    const resultArray = [];
    for (const [key, value] of Object.entries(paramsObject)) {
      if (key === "user") {
        resultArray.push(`${key}=${JSON.stringify(value)}`);
      } else {
        resultArray.push(`${key}=${value}`);
      }
    }

    return resultArray.join("&");
  }
}
