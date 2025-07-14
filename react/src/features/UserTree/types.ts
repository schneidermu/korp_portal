export interface UnitNode {
  kind: "unit";
  children: string[];
  id: string;
  head: string | null;
  parent: string | null;
  supervisor: string | null;
  name: string;
}

export interface UserNode {
  kind: "user";
  children: string[];
  id: string;
  unit: string;
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
  root: string;
  nodes: { [key: string]: TreeNode };
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
    (child) => tree.nodes[child].children.length === 0,
  );
};

const calcBranchWidth = (
  tree: Tree,
  root = tree.root,
  widths: { [key: string]: number } = {},
): { [key: string]: number } => {
  const node = tree.nodes[root];

  if (!node.children) {
    widths[root] = 1;
    return widths;
  }

  if (nodeIsPreTerminal(tree, node)) {
    const w = node.children.length >= 2 ? 2 : 1;
    widths[root] = w;
    return widths;
  }

  widths[root] = 0;
  for (const child of node.children) {
    const m = calcBranchWidth(tree, child, widths);
    widths[root] += m[child];
  }

  return widths;
};

const _placeNodes = (
  tree: Tree,
  widths: { [key: string]: number },
  root: string = tree.root,
  cur: { row: number; col: number } = { row: 0, col: 0 },
  colorInd = 0,
  placement: { [key: string]: Placement } = {},
): { [key: string]: Placement } => {
  const node = tree.nodes[root];

  placement[root] = {
    ...cur,
    width: widths[root],
    node,
    colorInd,
  };

  if (node.children.length === 0) return placement;

  // Place each node in a 2xR grid below the pre-terminal node:
  if (nodeIsPreTerminal(tree, node)) {
    node.children.forEach((child, i) => {
      const row = cur.row + 1 + Math.floor(i / 2);
      const col = cur.col + (i % 2);
      placement[child] = {
        row,
        col,
        width: 1,
        node: tree.nodes[child],
        colorInd,
      };
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
    col += widths[child];
  });

  return placement;
};

export const placeNodes = (tree: Tree) => {
  const widths = calcBranchWidth(tree);
  return _placeNodes(tree, widths);
};

export const calcLinkChains = (
  tree: Tree,
  boxes: { [key: string]: NodeBox },
) => {
  const chains: { x: number; y: number }[][] = [];
  for (const [key, box] of Object.entries(boxes)) {
    const node = tree.nodes[key];
    if (!node) continue;
    for (const child of node.children) {
      const childBox = boxes[child];
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
