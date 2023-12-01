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
  activeReferenda.map(async ({ id, value }) => {
    const subsquareDetails = await subsquare.referendum(id);

    return `<tr>
        <td>${id}</td>
        <td><a href="https://collectives.subsquare.io/fellowship/referenda/${id}">${
      subsquareDetails.title
    }</a></td>
        <td>${marked.parse(subsquareDetails.content)}</td>
        <td>${value.tally.ayes} (${value.tally.bareAyes})</td>
        <td>${value.tally.nays}</td>
        <td>${subsquareDetails.commentsCount}</td>
      </tr>`;
  })
);

await bot.send(`
<html>
  <body>
    <h1>Active Referenda</h1>
    <table>
      <theader>
        <th>#</th>
        <th>Title</th>
        <th>Content</th>
        <th>👍</th>
        <th>👎</th>
        <th>💬</th>
      </theader>
      <tbody>
        ${messages.join("\n")}
      </tbody>
    </table>
  </body>
</html>
`);
