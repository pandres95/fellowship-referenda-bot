import type { PalletReferendaReferendumInfoConvictionVotingTally } from "./lib/types.ts";

import { marked } from "marked";

import { MatrixBot } from "./lib/bot-client.ts";
import { SubstrateApi } from "./lib/substrate-api.ts";
import { SubsquareApi } from "./lib/subsquare-api.ts";

const collectives = new SubstrateApi();
await collectives.connect();

const bot = new MatrixBot();
await bot.connect();

const subsquare = new SubsquareApi();

collectives.listenEvents().on("event", (event) => {
  console.log(event.toHuman());
});

const referendumCount: number = (
  await collectives.query("fellowshipReferenda/referendumCount")
).toPrimitive() as number;

console.time("Fetching active referenda...");
const referenda = await Promise.all(
  new Array(referendumCount).fill(0).map(async (_, i) => ({
    id: i,
    value: await collectives.query("fellowshipReferenda/referendumInfoFor", i),
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

const messages = await Promise.all(
  activeReferenda.map(async ({ id, value: { tally } }) => {
    const { title, content, commentsCount } = await subsquare.referendum(id);

    const article = `
##### ${id}: ${title}

🔗 [Link to post](https://collectives.subsquare.io/fellowship/referenda/${id})

${content
  .split("\n")
  .map((l) => `> ${l}`)
  .join("\n")}

**${tally.ayes} (${tally.bareAyes})** 👍 | **${
      tally.nays
    }** 👎 | **${commentsCount}** 💬
    `;

    return `<article>
      ${marked.parse(article)}
    </article>`;
  })
);

await bot.send(`
<html>
  <body>
    <h3>🗳️ Active Referenda</h3>
    
    ${messages.join("\n")}
  </body>
</html>
`);
