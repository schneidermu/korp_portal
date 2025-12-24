import React from "react";

import { Stack, Text, Textarea } from "@chakra-ui/react";

import { UpdateUserFn, User } from "@legacy/features/user/types";
import { Subsection, SubsectionProps } from "../parts/Subsection";

export interface AboutSubsectionProps extends SubsectionProps {
  about: User["about"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const AboutSubsection = React.memo(function AboutSubsection({
  about,
  editing,
  updateUser,
  ...rest
}: AboutSubsectionProps) {
  if (editing)
    return (
      <Subsection show={editing || about.length > 0} {...rest}>
        <Textarea
          disabled={!editing}
          maxLength={1024}
          value={about}
          onChange={({ target }) =>
            updateUser((user) => (user.about = target.value))
          }
          rows={4}
          px="3"
          py="2"
          fontSize="md"
          borderWidth={1}
          borderColor="gray.1"
          borderRadius="2"
        />
      </Subsection>
    );

  return (
    <Subsection {...rest}>
      <Stack fontSize={{ lg: "lg", xl: "xl" }}>
        {about
          .trim()
          .split("\n")
          .map(
            (para) =>
              para && (
                <Text as="p" key={para}>
                  {para}
                </Text>
              ),
          )}
      </Stack>
    </Subsection>
  );
});
