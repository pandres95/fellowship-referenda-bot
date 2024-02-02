import type { GitHubResponse } from "./types.ts";

import config from "../config.ts";
import { resolve } from "node:url";

export class GitHubApi {
  baseUrl: URL;

  constructor(
    private org = config.github.org,
    private repo = config.github.repo
  ) {
    this.baseUrl = new URL(`https://api.github.com/`);
  }

  async rfcPullRequestById(id: number) {
    const path = resolve(
      this.baseUrl.toString(),
      `repos/${this.org}/${this.repo}/pulls/${id}`
    );

    const response = await fetch(path);
    return response.json() as Promise<GitHubResponse>;
  }
}
