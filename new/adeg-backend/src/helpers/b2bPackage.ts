import { PackageTag } from "@prisma/client";

type B2BPackageTier = {
  minMOQ: number;
  maxMOQ: number | null;
  pricePerUnit: number;
  b2bPackageTag: PackageTag;
};

const B2B_PACKAGE_TIERS: B2BPackageTier[] = [
  {
    minMOQ: 1,
    maxMOQ: 50,
    pricePerUnit: 20,
    b2bPackageTag: PackageTag.SmallSupply,
  },
  {
    minMOQ: 51,
    maxMOQ: 100,
    pricePerUnit: 15,
    b2bPackageTag: PackageTag.MediumSupply,
  },
  {
    minMOQ: 101,
    maxMOQ: null,
    pricePerUnit: 10,
    b2bPackageTag: PackageTag.LargeSupply,
  },
];

export const parseMOQ = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const match = raw.match(/^\d+/);
  if (!match) {
    return null;
  }

  const moq = Number(match[0]);
  if (!Number.isInteger(moq) || moq < 1) {
    return null;
  }

  return moq;
};

export const getB2BPackagePricing = (moq: number) => {
  const tier = B2B_PACKAGE_TIERS.find(
    (item) => moq >= item.minMOQ && (item.maxMOQ === null || moq <= item.maxMOQ),
  );

  if (!tier) {
    return null;
  }

  return {
    moq,
    minMOQ: tier.minMOQ,
    maxMOQ: tier.maxMOQ,
    pricePerUnit: tier.pricePerUnit,
    b2bPackageTag: tier.b2bPackageTag,
    totalPrice: moq * tier.pricePerUnit,
  };
};
