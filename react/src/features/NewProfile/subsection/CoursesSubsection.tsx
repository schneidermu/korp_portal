import React, { Fragment } from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline, TimelineInput, TimelineItem } from "../parts/Timeline";

export interface CoursesSubsectionProps extends SubsectionProps {
  courses: User["courses"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const CoursesSubsection = React.memo(
  React.forwardRef<HTMLDivElement, CoursesSubsectionProps>(
    function CoursesSubsection(props, ref) {
      const { courses, editing, updateUser, ...rest } = props;

      return (
        <Subsection show={editing || courses.length > 0} ref={ref} {...rest}>
          <Timeline
            templateColumns="1fr 7fr"
            editing={editing}
            cols={["Дата окончания", "Курсы"]}
            insertRow={(i) =>
              updateUser((user) =>
                user.courses.splice(i, 0, {
                  year:
                    user.courses[user.courses.length - 1]?.year ??
                    new Date().getFullYear(),
                  name: "",
                  attachment: O.none(),
                }),
              )
            }
            removeRow={(i) => updateUser((user) => user.courses.splice(i, 1))}
          >
            {courses.map(({ year, name }, row) => (
              <Fragment key={row}>
                <TimelineItem row={row}>
                  <TimelineInput
                    value={year || ""}
                    onChange={({ target }) =>
                      updateUser(
                        (user) =>
                          (user.courses[row].year = toNumber(target.value)),
                      )
                    }
                  />
                </TimelineItem>
                <TimelineItem lastCol row={row}>
                  <TimelineInput
                    value={name}
                    onChange={({ target }) =>
                      updateUser(
                        (user) => (user.courses[row].name = target.value),
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
