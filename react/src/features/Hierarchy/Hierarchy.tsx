import { NewPage } from "@/features/App/comps/NewPage.tsx";
import { Heading, Stack, Box, Grid } from "@chakra-ui/react";

// interface Hierarchy {
//   name: string;
//   address: string;
//   root: number;
//   head: string;
//   units: Map<
//     number,
//     {
//       name: string;
//       parent: number | null;
//       head: string | null;
//     }
//   >;
//   bosses: Map<
//     string,
//     {
//       firstName: string;
//       lastName: string;
//       patronym: string | null;
//       position: string;
//       boss: string | null;
//       unit: number;
//     }
//   >;
// }

// const sampleHierarchy: Hierarchy = {
//   name: "РосНИИВХ",
//   address: "",
//   head: "kae",
//   units: new Map([
//     [
//       1,
//       {
//         name: "Административно-управленческий персонал",
//         parent: null,
//         head: "kae",
//       },
//     ],
//     [
//       2,
//       {
//         name: 'Отдел обеспечения функционирования и развития цифровой платформы "Водные данные"',
//         parent: 1,
//         head: null,
//       },
//     ],
//     [
//       3,
//       {
//         name: 'Сектор обеспечения функционирования ГИС ЦП "Вода"',
//         parent: 2,
//         head: "bks",
//       },
//     ],
//   ]),
//   bosses: new Map([
//     [
//       "kae",
//       {
//         lastName: "Косолапов",
//         firstName: "Алексей",
//         patronym: "Евгеньевич",
//         position: "Директор",
//         boss: null,
//         unit: 1,
//       },
//     ],
//     [
//       "kta",
//       {
//         lastName: "Калиманов",
//         firstName: "Тарас",
//         patronym: "Александрович",
//         position:
//             "Заместитель директора по информационным технологиям и цифровой трансформации",
//         boss: null,
//         unit: 1,
//       },
//     ],
//     [
//       "bks",
//       {
//         lastName: "Бузыкин",
//         firstName: "Константин",
//         patronym: "Сергеевич",
//         position: "Заведующий сектором",
//         boss: "kta",
//         unit: 3,
//       },
//     ],
//   ]),
// };

type Key = number | string;

interface Unit {
  kind: "unit";
  name: string;
  head: string | null;
  children?: Key[];
}

interface Boss {
  kind: "boss";
  firstName: string;
  lastName: string;
  patronym: string | null;
  position: string;
  children?: Key[];
}

type Node = Unit | Boss;

interface Hierarchy {
  name: string;
  address: string;
  root: number;
  nodes: Map<Key, Node>;
}

const sampleHierarchy: Hierarchy = {
  name: "РосНИИВХ",
  address: "",
  root: 1,
  nodes: new Map<Key, Node>([
    [
      1,
      {
        kind: "unit",
        name: "Административно-управленческий персонал",
        head: "kae",
        children: ["kta"],
      },
    ],
    [
      2,
      {
        kind: "unit",
        name: 'Отдел обеспечения функционирования и развития цифровой платформы "Водные данные"',
        head: null,
        children: [3, 4],
      },
    ],
    [
      3,
      {
        kind: "unit",
        name: 'Сектор обеспечения функционирования ГИС ЦП "Вода"',
        head: "bks",
      },
    ],
    [
      4,
      {
        kind: "unit",
        name: 'Сектор разработки и развития компонентов ЦП "Вода"',
        head: "ssn",
      },
    ],
    [
      "kae",
      {
        kind: "boss",
        lastName: "Косолапов",
        firstName: "Алексей",
        patronym: "Евгеньевич",
        position: "Директор",
      },
    ],
    [
      "kta",
      {
        kind: "boss",
        lastName: "Калиманов",
        firstName: "Тарас",
        patronym: "Александрович",
        position:
          "Заместитель директора по информационным технологиям и цифровой трансформации",
        children: [2],
      },
    ],
    [
      "bks",
      {
        kind: "boss",
        lastName: "Бузыкин",
        firstName: "Константин",
        patronym: "Сергеевич",
        position: "Заведующий сектором",
      },
    ],
    [
      "ssn",
      {
        kind: "boss",
        lastName: "Стехов",
        firstName: "Станислав",
        patronym: "Николаевич",
        position: "Заведующий сектором",
      },
    ],
  ]),
};

const calcBranchWidth = (
  h: Hierarchy,
  root: string | number,
  widths: Map<Key, number> = new Map(),
): Map<Key, number> => {
  console.log("calc", root);
  const node = h.nodes.get(root)!;

  if (!node.children) {
    widths.set(root, 1);
    return widths;
  }

  widths.set(root, 0);
  for (const child of node.children) {
    const m = calcBranchWidth(h, child, widths);
    widths.set(root, widths.get(root)! + m.get(child)!);
  }

  return widths;
};

const placeNodes = (
  h: Hierarchy,
  root: Key,
  widths: Map<Key, number>,
  cur: { row: number; col: number } = { row: 0, col: 0 },
  pos: Map<
    Key,
    { row: number; col: number; width: number; node: Unit | Boss }
  > = new Map(),
): Map<Key, { row: number; col: number; width: number; node: Unit | Boss }> => {
  const node = h.nodes.get(root)!;
  console.log("place", root, "at", cur, "/", node);

  const children: Key[] = [...(node.children ?? [])];
  if (node.kind === "unit") {
    if (node.head) {
      const head = h.nodes.get(node.head)!;
      children.push(...(head.children ?? []));
    }
  }
  console.log("> children", children);

  pos.set(root, {
    ...cur,
    width: widths.get(root)!,
    node,
  });

  if (!children) return pos;

  let col = cur.col;
  for (const child of children) {
    placeNodes(h, child, widths, { row: cur.row + 1, col }, pos);
    console.log("get child", col, "/", child, widths.get(child));
    col += widths.get(child)!;
  }

  return pos;
};

const Node = ({ h, node }: { h: Hierarchy; node: Node }) => {
  if (node.kind === "boss") {
    return (
      <Box>
        {node.position}
        <br />
        {node.lastName} {node.firstName} {node.patronym}
      </Box>
    );
  }

  const head = node.head !== null && h.nodes.get(node.head);
  return (
    <>
      <Box textAlign="center">{node.name}</Box>
      {head && head.kind === "boss" && (
        <>
          <Box>
            {head.position}
            <br />
            {head.lastName} {head.firstName} {head.patronym}
          </Box>
        </>
      )}
    </>
  );
};

export const HierarchyPage = () => {
  const h = sampleHierarchy;
  const w = calcBranchWidth(h, h.root);
  const placement = placeNodes(h, h.root, w);
  console.log("w", w);
  console.log("p", [...placement.entries()]);

  return (
    <NewPage>
      <Stack>
        <Heading color="blue.4" fontSize="3xl">
          Руководство и структура
        </Heading>
        <Grid
          gridAutoColumns="400px"
          gridAutoRows="100px"
          justifyItems="center"
          alignItems="center"
          gap="4"
        >
          {[...placement.entries()].map(([key, { row, col, width, node }]) => (
            <Box
              key={key}
              gridRowStart={row + 1}
              gridColumnStart={col + 1}
              gridColumnEnd={`span ${width}`}
              p="2"
              w={400}
              borderWidth={1}
              h="full"
            >
              <Node h={h} node={node} />
            </Box>
          ))}
        </Grid>
      </Stack>
    </NewPage>
  );
};
