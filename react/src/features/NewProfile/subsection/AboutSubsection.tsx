import React from "react";

import { Stack, Text, Textarea } from "@chakra-ui/react";

import { UpdateUserFn, User } from "@/features/user/types";
import { Subsection, SubsectionProps } from "../parts/Subsection";

export interface AboutSubsectionProps extends SubsectionProps {
  about: User["about"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const AboutSubsection = React.memo(
  React.forwardRef<HTMLDivElement, AboutSubsectionProps>(
    function AboutSubsection(props, ref) {
      const { about, editing, updateUser, ...rest } = props;

      if (editing)
        return (
          <Subsection show={editing || about.length > 0} ref={ref} {...rest}>
            <Textarea
              disabled={!editing}
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
        <Subsection ref={ref} {...rest}>
          <Stack fontSize="xl">
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
    },
  ),
);
