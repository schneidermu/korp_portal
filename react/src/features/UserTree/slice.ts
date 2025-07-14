import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";
import { Tree, UnitNode, UserNode } from "./types";

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

      if (node.kind === "unit" && oldNode.kind === "unit") {
        // Remove old supervisor.
        if (
          node.supervisor !== oldNode.supervisor &&
          oldNode.supervisor !== null
        ) {
          if (node.parent) {
            const parentNode = state.tree.nodes[oldNode.supervisor];
            parentNode.children = parentNode.children.filter(
              (child) => child !== node.id,
            );
            node.parent = null;
          }
        }

        // Add new supervisor.
        if (
          node.supervisor !== oldNode.supervisor &&
          node.supervisor !== null
        ) {
          node.parent = node.supervisor;
          const superNode = state.tree.nodes[node.supervisor];
          const parentNode = state.tree.nodes[oldNode.parent!];

          parentNode.children = parentNode.children.filter(
            (id) => id !== node.id,
          );
          parentNode.children.push(node.supervisor);
          superNode.children.push(node.id);
        }
      }

      Object.assign(oldNode, node);
      state.node = undefined;
      return state;
    },
    unitEdited(state, { payload }: PayloadAction<Partial<UnitNode>>) {
      if (!state.node || state.node.kind !== "unit") return;

      Object.assign(state.node, payload);

      return state;
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

// export const useNode = (id: string): TreeNode | undefined =>
//   useSliceSelector((state) => state.tree?.nodes[id]);

export const actions = slice.actions;
