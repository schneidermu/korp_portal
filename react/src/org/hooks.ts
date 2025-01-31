import { useCallback } from "react";

import { useSearchParams } from "react-router-dom";

export const useOrgIdSearchParam = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const org = searchParams.get("org");

  let orgId: number | null = null;
  if (org !== null) {
    orgId = parseInt(org);
    if (Number.isNaN(orgId)) {
      orgId = null;
    }
  }

  const setOrgId = useCallback(
    (orgId: number | null) =>
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (orgId === null) {
          params.delete("org");
        } else {
          params.set("org", orgId.toString());
        }
        return params;
      }),
    [setSearchParams],
  );

  return [orgId, setOrgId] as const;
};
