import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import useDraggableScroll from "use-draggable-scroll";
import { produce } from "immer";
import { useNavigate } from "react-router-dom";

import { Box, Flex, Grid, GridProps, Stack } from "@chakra-ui/react";

import { Canvas } from "@/shared/comps/Canvas";
import { drawRoundedChain } from "@/features/UserTree/utils";
import {
  calcLinkChains,
  NodeBox,
  placeNodes,
  Tree,
} from "@/features/UserTree/types";
import { useFetchHierarchy } from "@/features/UserTree/services";
import { Page } from "@/features/App/comps/Page";
import { NodeView } from "./parts/NodeView";
import { USER_TREE_COLORS } from "@/app/const";
import { useAuth } from "@/features/auth/slice.ts";
import { useIntParam } from "@/shared/hooks/useIntParam.ts";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";
import { OrgPicker } from "@/features/org/comps/OrgPicker.tsx";
import { useAppDispatch } from "@/app/store";
import { actions, useSliceSelector } from "./slice";

interface UserTreeView extends GridProps {
  tree: Tree;
}

const UserTreeView = React.memo(function HierarchyView({
  tree,
  ...rest
}: { tree: Tree } & GridProps) {
  const placement = placeNodes(tree);

  const [boxes, setBoxes] = useState<{ [key: string]: NodeBox }>({});

  const measuredRef = useCallback((elem: HTMLDivElement) => {
    if (!elem) return;
    const key = elem.getAttribute("data-key")!;
    const p = elem.parentElement!.getBoundingClientRect();
    const c = elem.getBoundingClientRect();
    const box = { x: c.x - p.x, y: c.y - p.y, w: c.width, h: c.height };
    setBoxes((boxes) =>
      produce(boxes, (b) => {
        b[key] = box;
      }),
    );
  }, []);

  const chains = useMemo(() => calcLinkChains(tree, boxes), [tree, boxes]);

  const render = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const r = 15;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#999";
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      chains.forEach((arc) => drawRoundedChain(ctx, r, arc));
    },
    [chains],
  );

  return (
    <Grid
      position="relative"
      margin="10"
      gridAutoColumns={400}
      gridAutoRows="auto"
      justifyItems="center"
      alignItems="center"
      gap="8"
      {...rest}
    >
      <Canvas position="absolute" w="full" h="full" render={render} />
      {Object.entries(placement).map(
        ([key, { row, col, width, node, colorInd }]) => (
          <Box
            ref={measuredRef}
            key={key}
            data-key={key}
            cursor="default"
            onMouseDown={(event) => event.stopPropagation()}
            gridRowStart={row + 1}
            gridColumnStart={col + 1}
            gridColumnEnd={`span ${width}`}
            p="2"
            w={400}
            h="full"
            zIndex={1}
            background={USER_TREE_COLORS[colorInd % USER_TREE_COLORS.length].bg}
            borderColor={
              USER_TREE_COLORS[colorInd % USER_TREE_COLORS.length].border
            }
            borderWidth={2}
            borderRadius="2"
          >
            <NodeView tree={tree} node={node} />
          </Box>
        ),
      )}
    </Grid>
  );
});

export default function UserTreePage() {
  const dispatch = useAppDispatch();
  const viewRef = useRef<HTMLDivElement | null>(null);
  // @ts-expect-error: The types are too restrictive.
  const { onMouseDown } = useDraggableScroll(viewRef);

  const navigate = useNavigate();
  const auth = useAuth();
  const orgId = useIntParam("orgId") ?? auth.orgId;

  const { data: tree, error } = useFetchHierarchy(orgId);

  useEffect(() => {
    if (tree) {
      dispatch(actions.view(tree));
    }
  }, [dispatch, tree]);

  const treeState = useSliceSelector(({ tree }) => tree);

  useEffect(() => {
    const elem = viewRef?.current;
    if (!elem) return;
    elem.scrollTo((elem.scrollWidth - elem.offsetWidth) / 2, 0);
  }, [treeState]);

  if (error) {
    console.error(error);
  }

  return (
    <Page>
      <Stack>
        <PageHeading>
          <OrgPicker
            title="Руководство и структура"
            concreteOnly
            orgId={orgId}
            setOrgId={(orgId) => navigate(`/tree/${orgId}`)}
          />
        </PageHeading>
        <Box
          h="800px"
          overflow="auto"
          ref={viewRef}
          onMouseDown={onMouseDown}
          borderWidth={2}
          borderRadius="2"
        >
          <Flex minW="full" w="fit" h="fit" p="10" justify="center">
            {treeState && <UserTreeView tree={treeState} />}
          </Flex>
        </Box>
      </Stack>
    </Page>
  );
}
