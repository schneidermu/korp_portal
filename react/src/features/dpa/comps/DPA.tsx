import { useState } from "react";

import { Box, Center, Flex, FlexProps, HStack, Link } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";

import { DPA_TERMS_URL } from "@/app/const";

import { useAgreeDPA } from "../services";

const OneshotCheckbox = ({
  onCheck,
  ...rest
}: { onCheck: () => void } & FlexProps) => {
  const [checked, setChecked] = useState(false);

  const check = () => {
    setChecked(true);
    onCheck();
  };

  return (
    <Flex position="relative" {...rest}>
      <Center
        w="4"
        h="4"
        borderWidth={1}
        borderRadius="small"
        borderColor="blue.5"
        onClick={check}
        p="1px"
      >
        {checked && <LuCheck />}
      </Center>
    </Flex>
  );
};

/** Data Processing Agreement (DPA) Component
 *
 * This component displays a notification to the user, prompting them to agree
 * to the DPA. It includes a checkbox that, when checked, triggers a delay
 * before automatically closing the notification. The delay is defined by the
 * `DPA_CLOSE_DELAY` constant.
 *
 * The notification is styled to appear at the bottom-right of the screen and
 * contains a link (defined by the `DPA_TERMS_URL` constant) to the full terms
 * of the DPA, allowing users to review the agreement before giving their
 * consent.
 *
 * * DPA = согласие на обработку персональных данных
 */
export const DPA = () => {
  const { shown, checked, check } = useAgreeDPA();

  if (!shown || checked) return undefined;

  return (
    <HStack
      position="fixed"
      right="3"
      bottom="2"
      w="400px"
      px="6"
      py="8"
      fontSize="lg"
      bg="white"
      borderWidth={1}
      borderColor="blue.2"
      borderRadius="2"
      align="top"
    >
      <OneshotCheckbox mt="1" onCheck={check} />
      <Box>
        я даю согласие на обработку{" "}
        <Link
          href={DPA_TERMS_URL}
          target="_blank"
          textDecoration="underline"
          color="blue.2"
        >
          персональных данных
        </Link>
      </Box>
    </HStack>
  );
};
