import type { SubsquareReferendumDetail } from "./types.ts";

import config from "../config.ts";
import { resolve } from "node:url";

export class SubsquareApi {
  baseUrl: URL;

  constructor(
    host = config.subsquare.host,
    chain = config.subsquare.chain,
    versionHash = config.subsquare.versionHash,
    private path = config.subsquare.path
  ) {
    this.baseUrl = new URL(
      `https://${chain}.${host}/_next/data/${versionHash}/`
    );
  }

  async referendum(id: number) {
    const path = resolve(
      this.baseUrl.toString(),
      `${this.path}/referenda/${id}.json`
    );
    const response = await fetch(path);
    const data = (await response.json()) as {
      pageProps: { detail: SubsquareReferendumDetail };
    };

    return data.pageProps.detail;
  }
}
