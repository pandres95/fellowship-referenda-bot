import type { GenericEvent } from "@polkadot/types";

import config from "../config.ts";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { AddressOrPair } from "@polkadot/api/types";
import { Codec } from "@polkadot/types/types";
import { EventEmitter } from "node:events";

declare interface SubstrateApi {
  on(event: "event", listener: (event: GenericEvent) => void): this;
  on(event: string, listener: Function): this;
}

class SubstrateApi extends EventEmitter {
  #provider: WsProvider;
  #api?: ApiPromise;

  constructor(endpointUrl = config.substrate.endpointUrl) {
    super();
    this.#provider = new WsProvider(endpointUrl);
  }

  async connect() {
    this.#api = await ApiPromise.create({
      provider: this.#provider,
    });
  }

  async query<R extends Codec>(path: string, ...params: unknown[]): Promise<R> {
    let [pallet, key] = path.split("/");
    return this.#api.query[pallet][key](...params) as Promise<R>;
  }

  async submit(
    pallet: string,
    call: string,
    who: AddressOrPair,
    ...params: Codec[]
  ) {
    const extrinsic = this.#api.tx[pallet][call](...params);
    return extrinsic.signAndSend(who);
  }

  listenEvents() {
    this.#api.query.system.events((events: GenericEvent[]) =>
      events.map((event) => this.emit("event", event))
    );

    return this;
  }
}

export { SubstrateApi };
