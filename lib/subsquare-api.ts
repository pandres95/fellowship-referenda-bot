import type { SubsquareReferendumDetail } from "./types.ts";

import config from "../config.ts";
import { resolve } from "node:url";

export class SubsquareApi {
  baseUrl: URL;

  constructor(host = config.subsquare.host, chain = config.subsquare.chain) {
    this.baseUrl = new URL(`https://${chain}.${host}/api/`);
  }

  async fellowshipReferendumById(id: number) {
    const path = resolve(
      this.baseUrl.toString(),
      `fellowship/referenda/${id}.json`
    );

    const response = await fetch(path);
    return response.json() as Promise<SubsquareReferendumDetail>;
  }
}
