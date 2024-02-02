export function extractRfcNumber(rfcRemark: string) {
  const rfcId = /RFC_APPROVE\((?<id>\d*),\w*\)/.exec(rfcRemark).groups!.id!;
  return Number(rfcId);
}
