import { MatrixBot } from "./lib/bot-client.ts";
import { SubstrateApi } from "./lib/substrate-api.ts";
import { SubsquareApi } from "./lib/subsquare-api.ts";
import { StorageHandler } from "./lib/storage.ts";
import { getActiveReferenda, getMaybeReferendumCall } from "./lib/referenda.ts";

const collectives = new SubstrateApi();
await collectives.connect();

let bot: MatrixBot | undefined;
if (process.env.NODE_ENV === "production") {
  bot = new MatrixBot();
  await bot.connect();
}

const subsquare = new SubsquareApi();

const storage = new StorageHandler();
await storage.load();

const earliestActiveReferendum: number =
  storage.get("earliestActiveReferendum") ?? 0;

const activeReferenda = await getActiveReferenda(
  collectives,
  earliestActiveReferendum
);

const activeRfcReferenda = await Promise.all(
  activeReferenda.map(async ({ id, value }) => {
    const maybeExtrinsic = await getMaybeReferendumCall(collectives, value);

    const isRfcReferendum =
      (maybeExtrinsic?.method === "remark" ||
        maybeExtrinsic?.method === "remarkWithEvent") &&
      maybeExtrinsic.args.at(0).toHuman().toString().includes("RFC");

    return {
      id,
      value,
      isRfcReferendum,
    };
  })
).then((referenda) => referenda.filter((ref) => ref.isRfcReferendum));

await storage.set("earliestActiveReferendum", activeReferenda?.[0]?.id ?? 0);

const messages = await Promise.all(
  activeRfcReferenda.map(async ({ id, value: { tally } }) => {
    const { title, content, commentsCount } =
      await subsquare.fellowshipReferendumById(id);

    return `#### ${id}: ${title}

🔗 [Link to post](https://collectives.subsquare.io/fellowship/referenda/${id})

${content
  .split("\n")
  .map((l) => `> ${l}`)
  .join("\n")}

**${tally.ayes} (${tally.bareAyes})** 👍 | **${
      tally.nays
    }** 👎 | **${commentsCount}** 💬
    `;
  })
);

let content: string;
if (activeRfcReferenda.length) {
  content = `
### 🗳️ Active Referenda (RFCs)

${messages.join("\n")}
`;
} else {
  content = "No active referenda (RFCs) for now";
}

if (process.env.NODE_ENV === "production") {
  await bot.send(content);
} else {
  console.log(content);
}

await collectives.disconnect();
bot?.disconnect();
