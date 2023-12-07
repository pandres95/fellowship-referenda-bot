import type { GenericCall, Option, Vec, u8 } from "@polkadot/types";
import type {
  FellowshipReferendumInfo,
  FellowshipReferendumStatus,
} from "./types.ts";

import { SubstrateApi } from "./substrate-api.ts";

export async function getActiveReferenda(
  api: SubstrateApi,
  earliestActiveReferendum = 0
) {
  const referendumCount: number = (
    await api.query("fellowshipReferenda/referendumCount")
  ).toPrimitive() as number;

  console.time("Fetching active referenda...");
  const referenda = await Promise.all(
    new Array(referendumCount - earliestActiveReferendum)
      .fill(0)
      .map(async (_, i) => ({
        id: earliestActiveReferendum + i,
        value: await api.query(
          "fellowshipReferenda/referendumInfoFor",
          earliestActiveReferendum + i
        ),
      }))
  );
  console.timeEnd("Fetching active referenda...");

  return referenda
    .filter(
      (referendum) =>
        (referendum.value.toJSON().valueOf() as FellowshipReferendumInfo)
          ?.ongoing
    )
    .map(({ id, value }) => ({
      id,
      value: (value.toJSON().valueOf() as FellowshipReferendumInfo).ongoing,
    }));
}

export async function getMaybeReferendumCall(
  api: SubstrateApi,
  ref: FellowshipReferendumStatus
) {
  const { proposal } = ref;

  const hash = proposal.lookup.hash;

  let len: number;
  if (proposal.lookup.len === 0) {
    const preimageStatus = await api.query("preimage/statusFor", hash);
    len = (
      preimageStatus.toJSON().valueOf() as { unrequested: { len: number } }
    ).unrequested.len;
  } else {
    len = proposal.lookup.len;
  }

  const maybePreimage: Option<Vec<u8>> = await api.query(
    "preimage/preimageFor",
    [hash, len]
  );

  let maybeExtrinsic: GenericCall | undefined;
  if (maybePreimage.isSome) {
    const preimage = maybePreimage.unwrap();
    try {
      maybeExtrinsic = await api.decodeCall(preimage.toString());
    } catch {}
  }

  return maybeExtrinsic;
}
