export type NodeKey = string | number;

export interface UnitNode {
  kind: "unit";
  children: NodeKey[];
  id: number;
  head: string | null;
  parent: number | null;
  supervisor: string | null;
  name: string;
}

export interface UserNode {
  kind: "user";
  children: NodeKey[];
  id: string;
  unit: number;
  boss: string | null;
  firstName: string;
  lastName: string;
  patronym: string | null;
  position: string;
}

export type TreeNode = UnitNode | UserNode;

export interface Tree {
  name: string;
  address: string;
  root: number;
  nodes: Map<NodeKey, TreeNode>;
}

export interface NodeBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Placement {
  row: number;
  col: number;
  width: number;
  node: UnitNode | UserNode;
  colorInd: number;
}

const nodeIsPreTerminal = (tree: Tree, node: TreeNode) => {
  return node.children.every(
    (child) => tree.nodes.get(child)!.children.length === 0,
  );
};

const calcBranchWidth = (
  tree: Tree,
  root: NodeKey = tree.root,
  widths: Map<NodeKey, number> = new Map(),
): Map<NodeKey, number> => {
  const node = tree.nodes.get(root)!;

  if (!node.children) {
    widths.set(root, 1);
    return widths;
  }

  if (nodeIsPreTerminal(tree, node)) {
    const w = node.children.length >= 2 ? 2 : 1;
    widths.set(root, w);
    return widths;
  }

  widths.set(root, 0);
  for (const child of node.children) {
    const m = calcBranchWidth(tree, child, widths);
    widths.set(root, widths.get(root)! + m.get(child)!);
  }

  return widths;
};

const _placeNodes = (
  tree: Tree,
  widths: Map<NodeKey, number>,
  root: NodeKey = tree.root,
  cur: { row: number; col: number } = { row: 0, col: 0 },
  colorInd = 0,
  placement: Map<NodeKey, Placement> = new Map(),
): Map<NodeKey, Placement> => {
  const node = tree.nodes.get(root)!;

  placement.set(root, {
    ...cur,
    width: widths.get(root)!,
    node,
    colorInd,
  });

  if (node.children.length === 0) return placement;

  // Place each node in a 2xR grid below the pre-terminal node:
  if (nodeIsPreTerminal(tree, node)) {
    node.children.forEach((child, i) => {
      const row = cur.row + 1 + Math.floor(i / 2);
      const col = cur.col + (i % 2);
      placement.set(child, {
        row,
        col,
        width: 1,
        node: tree.nodes.get(child)!,
        colorInd,
      });
    });

    return placement;
  }

  let col = cur.col;
  node.children.forEach((child, i) => {
    _placeNodes(
      tree,
      widths,
      child,
      { row: cur.row + 1, col },
      colorInd + i + 1,
      placement,
    );
    col += widths.get(child)!;
  });

  return placement;
};

export const placeNodes = (tree: Tree) => {
  const widths = calcBranchWidth(tree);
  return _placeNodes(tree, widths);
};

export const calcLinkChains = (tree: Tree, boxes: Map<NodeKey, NodeBox>) => {
  const chains: { x: number; y: number }[][] = [];
  for (const [key, box] of boxes) {
    const node = tree.nodes.get(key);
    if (!node) continue;
    for (const child of node.children) {
      const childBox = boxes.get(child);
      if (!childBox) continue;

      if (nodeIsPreTerminal(tree, node)) {
        const x1 = box.x + box.w / 2;
        const x2 = childBox.x < box.x ? childBox.x + childBox.w : childBox.x;
        const y1 = box.y + box.h;
        const y2 = childBox.y + childBox.h / 2;

        chains.push([
          { x: x1, y: y1 },
          { x: x1, y: y2 },
          { x: x2, y: y2 },
        ]);
      } else if (box.x + box.w === childBox.x + childBox.w) {
        const x = box.x + box.w / 2;
        const y1 = box.y + box.h;
        const y2 = childBox.y;

        chains.push([
          { x: x, y: y1 },
          { x: x, y: y1 },
          { x: x, y: y2 },
        ]);
      } else {
        const x1 = box.x + box.w / 2;
        const x2 = childBox.x + childBox.w / 2;
        const y1 = box.y + box.h;
        const y2 = childBox.y;

        chains.push([
          { x: x1, y: y1 },
          { x: x1, y: (y1 + y2) / 2 },
          { x: x2, y: (y1 + y2) / 2 },
          { x: x2, y: y2 },
        ]);
      }
    }
  }
  return chains;
};
