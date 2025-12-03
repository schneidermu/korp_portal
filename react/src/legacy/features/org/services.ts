import useSWR from "swr";

import { Organization } from "./types";

import { useTokenFetcher } from "@legacy/features/auth/hooks";

interface OrganizationData {
  id: number;
  name: string;
  address: string;
  structural_subdivisions: {
    id: number;
    name: string;
  }[];
}

const toOrganization = (data: OrganizationData): Organization => ({
  id: data.id,
  name: data.name,
  address: data.address,
  units: data.structural_subdivisions,
});

export const useFetchOrgs = () => {
  const tokenFetch = useTokenFetcher();

  return useSWR<Organization[]>("/organization/", (path: string) =>
    tokenFetch(path)
      .then((res) => res.json())
      .then((raws) => raws.map(toOrganization)),
  );
};

export const useFetchOrg = (orgId: number | null) => {
  const tokenFetch = useTokenFetcher();

  const key = orgId !== null ? `/organization/${orgId}/` : null;

  return useSWR<Organization>(key, (path: string) =>
    tokenFetch(path)
      .then((res) => res.json())
      .then(toOrganization),
  );
};
