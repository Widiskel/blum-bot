import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";

export class API {
  constructor() {}

  generateHeaders(token, url) {
    const headers = {
      accept: "application/json, text/plain, */*",
      "user-agent": Helper.randomUserAgent(),
      "content-type": "application/json",
      origin: "https://telegram.blum.codes",
      "x-requested-with": "org.telegram.messenger",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer: "https://telegram.blum.codes/",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en,en-US;q=0.9",
    };
    if (this.token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // console.log(headers);
    return headers;
  }

  async fetch(endpoint, method, token, body = null) {
    try {
      const url = `${endpoint}`;
      const headers = this.generateHeaders(token, endpoint);
      const options = {
        cache: "default",
        credentials: "include",
        headers,
        method,
        mode: "cors",
        redirect: "follow",
        referrerPolicy: "no-referrer",
      };
      logger.info(`${method} : ${url}`);

      if (method !== "GET") {
        if (body != {}) {
          options.body = `${JSON.stringify(body)}`;
          headers["Content-Length"] = Buffer.byteLength(options.body, "utf-8");
        }
      }
      logger.info(`Request : ${JSON.stringify(options)}`);
      logger.info(`Request Header : ${JSON.stringify(headers)}`);
      logger.info(`Request Body : ${JSON.stringify(options.body)}`);

      const res = await fetch(url, options);

      logger.info(`Response : ${res.status} ${res.statusText}`);
      if (res.ok || res.status == 412) {
        const contentType = res.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        logger.info(`Response Data : ${JSON.stringify(data)}`);
        return data;
      } else {
        throw new Error(res.statusText);
      }
    } catch (err) {
      logger.error(`Error : ${err.message}`);
      throw err;
    }
  }
}
