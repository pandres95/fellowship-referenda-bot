import { Codec } from "@polkadot/types/types";

export interface PalletReferendaReferendumInfoConvictionVotingTally
  extends Codec {
  ongoing: {
    track: number;
    origin: { fellowshipOrigins: string };
    submitted: number;
    submissionDepost: {
      who: string;
      amount: number;
    };
    decisionDeposit: {
      who: string;
      amount: number;
    };
    deciding: { since: number; confirming: number | null };
    tally: {
      ayes: number;
      bareAyes: number;
      nays: number;
    };
  };
}
