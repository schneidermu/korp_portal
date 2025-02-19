import useSWR from "swr";

import { Organization } from "./types";

import { fetcher, useTokenFetcher } from "@/auth/slice";

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

export const useOrganization = (orgId: number) => {
  const { data } = useSWR<Organization>(
    `/organization/${orgId}/`,
    (path: string) =>
      fetcher(path)
        .then((res) => res.json())
        .then(toOrganization),
  );
  return { data };
};

export const useFetchOrgs = () => {
  const tokenFetch = useTokenFetcher();

  return useSWR<Organization[]>("/organization/", (path: string) =>
    tokenFetch(path)
      .then((res) => res.json())
      .then((raws) => raws.map(toOrganization)),
  );
};
