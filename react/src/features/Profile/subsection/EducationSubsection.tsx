import React, { Fragment } from "react";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline, TimelineInput, TimelineItem } from "../parts/Timeline";
import { Show } from "@chakra-ui/react";

export interface EducationSubsectionProps extends SubsectionProps {
  education: User["education"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const EducationSubsection = React.memo(
  React.forwardRef<HTMLDivElement, EducationSubsectionProps>(
    function EducationSubsection(props, ref) {
      const { education, editing, updateUser, ...rest } = props;

      return (
        <Subsection show={editing || education.length > 0} ref={ref} {...rest}>
          <Timeline
            templateColumns="1fr 7fr"
            editing={editing}
            cols={["Дата окончания", "Университет"]}
            insertRow={(i) =>
              updateUser((user) =>
                user.education.splice(i, 0, {
                  year:
                    user.education[user.education.length - 1]?.year ??
                    new Date().getFullYear(),
                  university: "",
                  major: "",
                }),
              )
            }
            removeRow={(i) => updateUser((user) => user.education.splice(i, 1))}
          >
            {education.map(({ year, university, major }, row) => (
              <Fragment key={row}>
                <TimelineItem row={row}>
                  <TimelineInput
                    fontSize={{ lg: "lg", xl: "xl" }}
                    value={year || ""}
                    maxLength={4}
                    onChange={({ target }) =>
                      updateUser(
                        (user) =>
                          (user.education[row].year = toNumber(target.value)),
                      )
                    }
                  />
                </TimelineItem>
                <TimelineItem lastCol row={row}>
                  <TimelineInput
                    fontSize={{ lg: "lg", xl: "xl" }}
                    placeholder="Университет"
                    maxLength={80}
                    value={university}
                    onChange={({ target }) =>
                      updateUser(
                        (user) =>
                          (user.education[row].university = target.value),
                      )
                    }
                  />
                  <Show when={editing || major}>
                    <TimelineInput
                      fontSize={{ lg: "md", xl: "lg" }}
                      maxLength={80}
                      placeholder={
                        editing ? "Факультет или институт" : undefined
                      }
                      value={major}
                      onChange={({ target }) =>
                        updateUser(
                          (user) => (user.education[row].major = target.value),
                        )
                      }
                    />
                  </Show>
                </TimelineItem>
              </Fragment>
            ))}
          </Timeline>
        </Subsection>
      );
    },
  ),
);
