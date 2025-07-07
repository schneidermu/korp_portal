import { HStack, Icon, Stack, StackProps, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { TreeNode, UnitNode, UserNode } from "@/features/UserTree/types";
import { LuUser } from "@/shared/icons/LuUser";

import { Tree } from "../types";

const UserLink = ({
  userId,
  fullname,
  ...rest
}: {
  userId: string;
  fullname: string;
} & StackProps) => {
  return (
    <HStack
      cursor="pointer"
      asChild
      _hover={{ textDecoration: "underline" }}
      {...rest}
    >
      <Link to={`/profile/${userId}`}>
        <Icon>
          <LuUser />
        </Icon>
        <Text color="blue.5">{fullname}</Text>
      </Link>
    </HStack>
  );
};

const UserNodeView = ({ user }: { user: UserNode }) => {
  return (
    <Stack textAlign="center">
      <Text fontSize="xl">{user.position}</Text>
      <UserLink
        justify="center"
        userId={user.id}
        fullname={`${user.lastName} ${user.firstName} ${user.patronym ?? ""}`}
      />
    </Stack>
  );
};

const UnitNodeView = ({ tree, unit }: { tree: Tree; unit: UnitNode }) => {
  const head = unit.head !== null && tree.nodes.get(unit.head);
  return (
    <Stack onMouseDown={(event) => event.stopPropagation()} textAlign="center">
      <Text fontSize="xl">{unit.name}</Text>
      {head && head.kind === "user" && (
        <UserLink
          justify="center"
          userId={head.id}
          fullname={`${head.lastName} ${head.firstName} ${head.patronym ?? ""}`}
        />
      )}
    </Stack>
  );
};

export const NodeView = ({ tree, node }: { tree: Tree; node: TreeNode }) => {
  return node.kind === "user" ? (
    <UserNodeView user={node} />
  ) : (
    <UnitNodeView tree={tree} unit={node} />
  );
};
