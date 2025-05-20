import useSWR from "swr";

import { useTokenFetcher } from "@/features/auth/hooks";
import { UserNode, Tree, UnitNode } from "@/features/UserTree/types";

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
          id: u.id,
          name: u.name,
          head: u.chief,
          supervisor: u.supervisor ?? null,
          parent: u.parent_structural_subdivision ?? null,
        }));
        const users: UserNode[] = data.positions.map((u) => ({
          kind: "user",
          children: [],
          id: u.id,
          unit: u.structural_division,
          boss: u.chief,
          lastName: u.surname,
          firstName: u.name,
          patronym: u.patronym,
          position: u.job_title,
        }));
        const nodes: Tree["nodes"] = new Map(
          [...units, ...users].map((node) => [node.id, node]),
        );
        const head = data.head;
        if (head === null) throw new Error("Organization head not set");
        // FIXME
        const root = (nodes.get(head) as UserNode).unit!;
        const tree: Tree = {
          name: data.name,
          address: data.address,
          nodes,
          root,
        };

        for (const unit of units) {
          if (unit.supervisor && unit.parent) {
            const p = nodes.get(unit.supervisor);
            if (!p || p.kind !== "user") continue;
            const p2 = nodes.get(p.unit);
            if (!p || !p2) continue;
            p.children!.push(unit.id);
            if (p2.children.findIndex((id) => id === unit.supervisor) < 0) {
              p2.children.push(unit.supervisor);
            }
          } else if (unit.parent) {
            const p = nodes.get(unit.parent);
            if (p) p.children!.push(unit.id);
          }
        }

        return tree;
      }),
  );
};
