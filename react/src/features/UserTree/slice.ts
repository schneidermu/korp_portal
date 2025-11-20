import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, useAppSelector } from "@/app/store";
import { tokenFetch } from "../auth/hooks";
import {
  recomputeChildren,
  Tree,
  treeUnits,
  treeUserIdsSet,
  UnitNode,
  UserNode,
} from "./types";
import { mutate } from "swr";

export const NAME = "userTree";

type State = { tree?: Tree; editing?: boolean; node?: UnitNode | UserNode };

const initialState: State = {};

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    viewed(_, { payload }: PayloadAction<Tree>) {
      return { tree: payload };
    },
    edited(state) {
      state.editing = true;
      return state;
    },
    saved(state) {
      state.editing = false;
      return state;
    },
    reset(state, { payload }: PayloadAction<Tree>) {
      state.editing = false;
      state.tree = payload;
      return state;
    },
    nodeOpened(state, { payload: id }: PayloadAction<string>) {
      if (!state.tree) return;
      state.node = state.tree.nodes[id];
      return state;
    },
    nodeClosed(state) {
      delete state.node;
      return state;
    },
    nodeSaved(state) {
      if (state.tree === undefined || state.node === undefined) return;
      const node = state.node;
      const oldNode = state.tree.nodes[state.node.id];

      Object.assign(oldNode, node);
      state.node = undefined;
      recomputeChildren(state.tree);
      return state;
    },
    unitEdited(state, { payload: update }: PayloadAction<Partial<UnitNode>>) {
      if (!state.node || state.node.kind !== "unit") return;

      Object.assign(state.node, update);

      return state;
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

// export const useNode = (id: string): TreeNode | undefined =>
//   useSliceSelector((state) => state.tree?.nodes[id]);

export const actions = slice.actions;

const saveOrg = async (token: string, t0: Tree, t: Tree) => {
  const root0 = t0.nodes[t0.root];
  const root = t.nodes[t.root];
  if (
    root0?.kind !== "unit" ||
    root?.kind !== "unit" ||
    root0.head === null ||
    root.head === null
  ) {
    return;
  }
  const head0 = t0.nodes[root0.head];
  const head = t.nodes[root.head];
  if (head0?.kind !== "user" || head?.kind !== "user") {
    return;
  }

  if (t0.name === t.name && t0.address === t.address && head0 === head) {
    return;
  }

  return tokenFetch(token, `/organization/${t0.orgId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: t.name,
      head: head.id,
      address: t.address,
    }),
  });
};

const cleanDeletedUnits = (token: string, t0: Tree, t: Tree) => {
  const units = new Set(
    Object.values(t.nodes)
      .filter((node) => node.kind === "unit")
      .map(({ id }) => id),
  );

  return Object.values(t0.nodes)
    .filter(
      (node0): node0 is UnitNode =>
        node0.kind === "unit" && !units.has(node0.id),
    )
    .map(({ id }) =>
      tokenFetch(token, `/subdivisions/${id}/`, {
        method: "DELETE",
      }),
    );
};

const saveUnit = async (token: string, t0: Tree, t: Tree, u: UnitNode) => {
  const users = treeUserIdsSet(t);

  const u0 = t0.nodes[u.id];
  if (u0 === undefined) {
    // Create unit.
    return tokenFetch(token, `/subdivisions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: u.name,
        chief: u.head,
        supervisor: u.supervisor,
        parent_structural_subdivision: u.parent,
        positions: [...users],
      }),
    });
  }
  if (u0.kind !== "unit") {
    return;
  }

  const users0 = treeUserIdsSet(t0);

  const sameUsers =
    [...users].every((u) => users0.has(u)) &&
    [...users0].every((u0) => users.has(u0));

  if (
    u0.name === u.name &&
    u0.supervisor === u.supervisor &&
    u0.head === u.head &&
    u0.parent === u.parent &&
    sameUsers
  ) {
    return;
  }

  return tokenFetch(token, `/subdivisions/${u0.id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: u.name,
      chief: u.head,
      supervisor: u.supervisor,
      parent_structural_subdivision: u.parent,
      positions: [...users],
    }),
  });
};

export const saveTree = createAsyncThunk(
  `${NAME}/save`,
  async (initialTree: Tree, thunkAPI) => {
    const { auth: authState, [NAME]: state } = thunkAPI.getState() as RootState;

    if (!state.tree) return;

    const t0 = initialTree;
    const t = state.tree;

    const requests: Promise<Response | void>[] = [];

    requests.push(saveOrg(authState.token, t0, t));

    requests.push(...cleanDeletedUnits(authState.token, t0, t));

    requests.push(
      ...treeUnits(t).map((u) => saveUnit(authState.token, t0, t, u)),
    );

    await Promise.all(requests);

    thunkAPI.dispatch(actions.saved());

    await mutate(`/hierarchy/${t0.orgId}/`);
  },
);
