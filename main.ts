import type { PalletReferendaReferendumInfoConvictionVotingTally } from "./lib/types.ts";

import { MatrixBot } from "./lib/bot-client.ts";
import { SubstrateApi } from "./lib/substrate-api.ts";
import { SubsquareApi } from "./lib/subsquare-api.ts";
import { GenericCall, Option, Vec, u8 } from "@polkadot/types";
import { StorageHandler } from "./lib/storage.ts";

const collectives = new SubstrateApi();
await collectives.connect();

const bot = new MatrixBot();
await bot.connect();

const subsquare = new SubsquareApi();

const storage = new StorageHandler();
await storage.load();

const referendumCount: number = (
  await collectives.query("fellowshipReferenda/referendumCount")
).toPrimitive() as number;

console.time("Fetching active referenda...");

const earliestActiveReferendum: number =
  storage.get("earliestActiveReferendum") ?? 0;

const referenda = await Promise.all(
  new Array(referendumCount - earliestActiveReferendum)
    .fill(0)
    .map(async (_, i) => ({
      id: earliestActiveReferendum + i,
      value: await collectives.query(
        "fellowshipReferenda/referendumInfoFor",
        earliestActiveReferendum + i
      ),
    }))
);
console.timeEnd("Fetching active referenda...");

const activeReferenda = referenda
  .filter(
    (referendum) =>
      (
        referendum.value
          .toJSON()
          .valueOf() as PalletReferendaReferendumInfoConvictionVotingTally
      )?.ongoing
  )
  .map(({ id, value }) => ({
    id,
    value: (
      value
        .toJSON()
        .valueOf() as PalletReferendaReferendumInfoConvictionVotingTally
    ).ongoing,
  }));

await storage.set("earliestActiveReferendum", activeReferenda?.[0]?.id ?? 0);

const messages = await Promise.all(
  activeReferenda.map(async ({ id, value: { tally, proposal } }) => {
    const { title, content, commentsCount } =
      await subsquare.fellowshipReferendumById(id);

    const hash = proposal.lookup.hash;

    let len: number;
    if (proposal.lookup.len === 0) {
      const preimageStatus = await collectives.query(
        "preimage/statusFor",
        hash
      );
      len = (
        preimageStatus.toJSON().valueOf() as { unrequested: { len: number } }
      ).unrequested.len;
    } else {
      len = proposal.lookup.len;
    }

    const maybePreimage: Option<Vec<u8>> = await collectives.query(
      "preimage/preimageFor",
      [hash, len]
    );

    let maybeExtrinsic: GenericCall | undefined;
    if (maybePreimage.isSome) {
      const preimage = maybePreimage.unwrap();
      try {
        maybeExtrinsic = await collectives.decodeCall(preimage.toString());
      } catch {}
    }

    if (
      maybeExtrinsic?.method === "remark" &&
      maybeExtrinsic.args.at(0).toHuman().toString().includes("RFC")
    ) {
      return `
#### ${id}: ${title}

🔗 [Link to post](https://collectives.subsquare.io/fellowship/referenda/${id})

${content
  .split("\n")
  .map((l) => `> ${l}`)
  .join("\n")}

**${tally.ayes} (${tally.bareAyes})** 👍 | **${
        tally.nays
      }** 👎 | **${commentsCount}** 💬
    `;
    }

    return "";
  })
).then((messages) => messages.filter((m) => m.length));

const content = `
### 🗳️ Active Referenda (RFCs)
    
${messages.join("\n")}
`;

if (process.env.NODE_ENV === "production") {
  await bot.send(content);
} else {
  console.log(content);
}

await collectives.disconnect();
await bot.disconnect();
