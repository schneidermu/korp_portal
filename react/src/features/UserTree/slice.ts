import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";
import { recomputeChildren, Tree, UnitNode, UserNode } from "./types";

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
