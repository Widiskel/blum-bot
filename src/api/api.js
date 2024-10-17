import fetch from "node-fetch";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { HttpsProxyAgent } from "https-proxy-agent";

export class API {
  constructor(proxy) {
    this.proxy = proxy;
  }

  generateHeaders(token) {
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
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // console.log(headers);
    return headers;
  }

  async fetch(endpoint, method, token, body = {}) {
    try {
      const url = `${endpoint}`;
      const headers = this.generateHeaders(token);
      const options = {
        cache: "default",
        credentials: "include",
        headers,
        method,
        mode: "cors",
        redirect: "follow",
        referrerPolicy: "no-referrer",
      };
      let ip;
      if (this.proxy) {
        options.agent = new HttpsProxyAgent(this.proxy);
        ip = await this.checkIP();
      }
      logger.info(
        `${method} : ${url} ${
          this.proxy
            ? `(Requester : Original IP : ${ip[0]} : Proxy IP ${ip[1]})`
            : ``
        }`
      );

      if (method !== "GET") {
        if (body != {}) {
          options.body = `${JSON.stringify(body)}`;
          headers["Content-Length"] = Buffer.byteLength(options.body, "utf-8");
        }
      }
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
        if (this.proxy) {
          if (res.status == 520) {
            throw Error(`520 Bad Gateway (Posible Proxy Problem)`);
          }
        }
        if (res.status == 520) {
          throw Error(`520 Bad Gateway (Posible Game Server Problem)`);
        }

        throw new Error(
          `${res.status} ${res.statusText ?? "Something wen't wrong"}`
        );
      }
    } catch (err) {
      logger.error(`Error : ${err.message}`);
      throw err;
    }
  }

  async checkIP() {
    const options = {};

    if (this.proxy) {
      let originalIp;
      let proxyIp;
      try {
        const res = await fetch("https://api.ipify.org?format=json", options);
        const data = await res.json();
        originalIp = data.ip;
      } catch (error) {
        throw Error(`Failed to fetch IP: ${error.message}`);
      }

      options.agent = new HttpsProxyAgent(this.proxy);

      try {
        const res = await fetch("https://api.ipify.org?format=json", options);
        const data = await res.json();
        proxyIp = data.ip;
      } catch (error) {
        throw Error(`Failed to fetch IP: ${error.message}`);
      }

      return [originalIp, proxyIp];
    }
  }
}
