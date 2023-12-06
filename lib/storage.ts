import config from "../config.ts";
import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";

export class StorageHandler {
  #kv: Record<string, unknown> = {};

  constructor(private path = config.storage.path) {
    this.load();
  }

  async load() {
    try {
      const file = await readFile(this.path, { encoding: "utf-8" });
      this.#kv = JSON.parse(file);
    } catch {}
  }

  get<T>(k: string) {
    return this.#kv[k] as T;
  }

  async set(k: string, v: unknown) {
    this.#kv[k] = v;
    await this.#write();
  }

  async #write() {
    await writeFile(this.path, JSON.stringify(this.#kv));
  }
}
