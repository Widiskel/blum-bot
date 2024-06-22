import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";

export class API {
  constructor() {}

  generateHeaders(token, url) {
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      "Content-Type": "application/json",
      Priority: "u=1, i",
      Referer: `${Helper.getDomain(url)}`,
      Origin: `https://telegram.blum.codes'`,
      "User-Agent": Helper.randomUserAgent(),
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      Connection: "keep-alive",
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
      if (res.ok) {
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
