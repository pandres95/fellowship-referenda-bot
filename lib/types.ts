import { Codec } from "@polkadot/types/types";

export interface PalletReferendaReferendumInfoConvictionVotingTally
  extends Codec {
  ongoing: {
    track: number;
    proposal: {
      lookup: {
        hash: string;
        len: number;
      };
    };
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

export type SubsquareReferendumDetail = {
  _id: string;
  referendumIndex: number;
  proposer: string;
  title: string;
  content: string;
  contentType: "markdown" | "html";
  track: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  contentSummary: {
    postUpdatedAt: string;
    summary: string;
  };
  commentsCount: number;
  author: {
    username: string;
    publicKey: string;
    address: string;
  };
  authors: string[];
};
