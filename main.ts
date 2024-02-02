import { MatrixBot } from "./lib/bot-client.ts";
import { SubstrateApi } from "./lib/substrate-api.ts";
import { SubsquareApi } from "./lib/subsquare-api.ts";
import { StorageHandler } from "./lib/storage.ts";
import { getActiveReferenda, getMaybeReferendumCall } from "./lib/referenda.ts";
import { GitHubApi } from "./lib/github-api.ts";
import { extractRfcNumber } from "./lib/helpers.ts";

const collectives = new SubstrateApi();
await collectives.connect();

let bot: MatrixBot | undefined;
if (process.env.NODE_ENV === "production") {
  bot = new MatrixBot();
  await bot.connect();
}

const subsquare = new SubsquareApi();
const github = new GitHubApi();

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
      rfcRemark: isRfcReferendum
        ? maybeExtrinsic.args.at(0).toHuman().toString()
        : undefined,
    };
  })
).then((referenda) => referenda.filter((ref) => ref.isRfcReferendum));

await storage.set("earliestActiveReferendum", activeReferenda?.[0]?.id ?? 0);

const messages = await Promise.all(
  activeRfcReferenda.map(async ({ id, value: { tally }, rfcRemark }) => {
    const { title, content, commentsCount } =
      await subsquare.fellowshipReferendumById(id);
    const { title: ghTitle } = await github.rfcPullRequestById(
      extractRfcNumber(rfcRemark)
    );

    return `#### ${id}: ${title ?? ghTitle}

🔗 Link to post: [Subsquare](https://collectives.subsquare.io/fellowship/referenda/${id}) | [Polkassembly](https://collectives.polkassembly.io/referenda/${id}?network=collectives)

${
  content?.length
    ? content
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n")
    : "> No description"
}

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
