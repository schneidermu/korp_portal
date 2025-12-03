import useSWR from "swr";

import { useTokenFetcher } from "@legacy/features/auth/hooks";
import { UserNode, Tree, UnitNode } from "@legacy/features/UserTree/types";

interface HierarchyRaw {
  address: string;
  head: string | null;
  id: number;
  name: string;
  positions: {
    id: string;
    structural_division: number;
    chief: string | null;
    surname: string;
    name: string;
    patronym: string | null;
    job_title: string;
  }[];
  structural_subdivisions: {
    id: number;
    name: string;
    chief: string | null;
    supervisor: string | null;
    parent_structural_subdivision: number | null;
  }[];
}

export const useFetchHierarchy = (orgId: number | null) => {
  const tokenFetch = useTokenFetcher();
  const key = orgId === null ? null : `/hierarchy/${orgId}/`;

  return useSWR<Tree>(key, (path: string) =>
    tokenFetch(path)
      .then((res) => {
        if (res.status !== 200)
          throw new Error(
            `Failed to fetch hierarchy: ${res.status} ${res.statusText}`,
          );
        return res.json();
      })
      .then((data: HierarchyRaw) => {
        const units: UnitNode[] = data.structural_subdivisions.map((u) => ({
          kind: "unit",
          children: [],
          id: u.id.toString(),
          name: u.name,
          head: u.chief,
          supervisor: u.supervisor ?? null,
          parent: u.parent_structural_subdivision
            ? u.parent_structural_subdivision.toString()
            : null,
        }));
        const users: UserNode[] = data.positions.map((u) => ({
          kind: "user",
          children: [],
          id: u.id,
          unit: u.structural_division.toString(),
          boss: u.chief,
          lastName: u.surname,
          firstName: u.name,
          patronym: u.patronym,
          position: u.job_title,
        }));
        const nodes: Tree["nodes"] = Object.fromEntries(
          [...units, ...users].map((node) => [node.id, node]),
        );
        const head = data.head;
        if (head === null) throw new Error("Organization head not set");
        // FIXME
        const root = (nodes[head] as UserNode).unit.toString();
        const tree: Tree = {
          name: data.name,
          orgId: orgId!,
          address: data.address,
          nodes,
          root,
        };

        for (const unit of units) {
          if (unit.supervisor && unit.parent) {
            const p = nodes[unit.supervisor];
            if (!p || p.kind !== "user") continue;
            const p2 = nodes[p.unit];
            if (!p || !p2) continue;
            p.children!.push(unit.id.toString());
            if (p2.children.findIndex((id) => id === unit.supervisor) < 0) {
              p2.children.push(unit.supervisor);
            }
          } else if (unit.parent) {
            const p = nodes[unit.parent];
            if (p) p.children!.push(unit.id.toString());
          }
        }

        return tree;
      }),
  );
};
