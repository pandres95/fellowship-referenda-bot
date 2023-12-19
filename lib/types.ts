import { AccountId, Tally } from "@polkadot/types/interfaces";
import { Codec } from "@polkadot/types/types";

export interface FellowshipReferendumInfo extends Codec {
  ongoing: FellowshipReferendumStatus;
}

export interface FellowshipReferendumOrigin {
  fellowshipOrigins: string;
}

export interface FellowshipReferendumCall {
  inline: string;
  lookup: {
    hash: string;
    len: number;
  };
}

export type FellowshipReferendumStatus = ReferendumStatus<
  number,
  FellowshipReferendumOrigin,
  number,
  FellowshipReferendumCall,
  number
>;

export interface ReferendumStatus<
  TrackId,
  RuntimeOrigin,
  Moment,
  Call,
  Balance,
  Tally = ReferendumTally,
  AccountId = string
> {
  track: TrackId;
  origin: RuntimeOrigin;
  proposal: Call;
  submitted: Moment;
  submissionDepost: Deposit<AccountId, Balance>;
  decisionDeposit: Deposit<AccountId, Balance>;
  tally: Tally;
}

export interface Deposit<AccountId, Balance> {
  who: AccountId;
  amount: Balance;
}

export interface ReferendumTally {
  ayes: number;
  bareAyes: number;
  nays: number;
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
