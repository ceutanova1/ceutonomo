export type ClientRegion = "CEUTA" | "MAINLAND_SPAIN" | "EU" | "NON_EU";
export type ClientKind = "B2B" | "B2C";

export type ClientDistributionInput = Readonly<{
  id: string;
  label: string;
  region: ClientRegion;
  clientKind: ClientKind;
  shareBasisPoints: number;
}>;

export type ClientDistributionResult = Readonly<{
  totalBasisPoints: number;
  unallocatedBasisPoints: number;
  isComplete: boolean;
  segments: ClientDistributionInput[];
}>;

export const analyzeClientDistribution = (
  segments: ClientDistributionInput[],
): ClientDistributionResult => {
  for (const segment of segments) {
    if (!Number.isInteger(segment.shareBasisPoints) || segment.shareBasisPoints < 0 || segment.shareBasisPoints > 10_000) {
      throw new RangeError(`Client share for ${segment.label} must be between 0% and 100%.`);
    }
  }
  const totalBasisPoints = segments.reduce((total, segment) => total + segment.shareBasisPoints, 0);
  if (totalBasisPoints > 10_000) throw new RangeError("Client distribution cannot exceed 100%.");
  return {
    totalBasisPoints,
    unallocatedBasisPoints: 10_000 - totalBasisPoints,
    isComplete: totalBasisPoints === 10_000,
    segments,
  };
};

