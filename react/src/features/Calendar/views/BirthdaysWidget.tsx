import {
    Box,
    Grid,
    Heading,
    HStack,
    Image,
    StackProps
} from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice";

import { useBirthdays } from "../api";
import { useSliceSelector } from "../slice";

import { Avatar } from "@/features/user/comps/Avatar";
import { User, userAge } from "@/features/user/types";
import { ruOnNum } from "@/shared/utils/lang";
import celebrationImg from "../assets/celebration.png";

export const BirthdaysWidget = () => {
  const month = useSliceSelector(({ month }) => month);
  const day = useSliceSelector(({ day }) => day);
  const { orgId } = useAuth();

  const birthdays = useBirthdays({ orgId });

  const key = `${month}/${day}`;

  if (!birthdays[key]) return undefined;

  return (
    <Box
      as="section"
      bg="blue.1"
      shadow="0 4px 4px 0 rgba(0, 0, 0, 25%)"
      borderRadius={2}
      px={5}
      py={4}
    >
      <Grid position="relative" templateRows="1fr 1fr 1fr">
        <Image
          src={celebrationImg}
          h="100%"
          maxH={52}
          position="absolute"
          top="0"
          left="50%"
          transform="translate(-50%, 0)"
        />
        {birthdays[key]
          ?.slice(0, 3)
          .map((user) => <UserBirthday user={user} />)}
      </Grid>
    </Box>
  );
};

const UserBirthday = ({ user, ...rest }: { user: User } & StackProps) => {
  const age = userAge(user);

  return (
    <HStack
      key={user.id}
      as="article"
      backdropFilter="blur(15px)"
      borderRadius={1}
      px={3}
      py={2}
      bg="rgba(255, 255, 255, 0.2)"
      color="white"
      {...rest}
    >
      <Avatar user={user} w={14} h={14} />
      <Box>
        <Heading as="h1">{user.firstName}</Heading>
        {age && (
          <Box>
            {age}{" "}
            {ruOnNum(age, {
              other: "лет",
              one: "год",
              x234: "года",
            })}
          </Box>
        )}
      </Box>
    </HStack>
  );
};
