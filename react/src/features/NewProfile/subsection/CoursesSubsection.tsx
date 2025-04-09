import React from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline } from "../parts/Timeline";

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
            templateColumns="1fr 1fr 4fr"
            editing={editing}
            cols={["Дата начала", "Дата окончания", "Курсы"]}
            data={courses.map(({ year, name }) => [
              year ? year.toString() : "",
              year ? year.toString() : "",
              name,
            ])}
            onItemChange={(col, i, value) => {
              if (col === "Курсы") {
                updateUser((user) => (user.courses[i].name = value));
              } else {
                updateUser((user) => (user.courses[i].year = toNumber(value)));
              }
            }}
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
          />
        </Subsection>
      );
    },
  ),
);
