import React, { Fragment } from "react";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline, TimelineInput, TimelineItem } from "../parts/Timeline";

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
            {education.map(({ year, university }, row) => (
              <Fragment key={row}>
                <TimelineItem row={row}>
                  <TimelineInput
                    value={year}
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
                    value={university}
                    onChange={({ target }) =>
                      updateUser(
                        (user) =>
                          (user.education[row].university = target.value),
                      )
                    }
                  />
                </TimelineItem>
              </Fragment>
            ))}
          </Timeline>
        </Subsection>
      );
    },
  ),
);
