import React from "react";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline } from "../parts/Timeline";

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
            templateColumns="1fr 1fr 4fr"
            editing={editing}
            cols={["Дата начала", "Дата окончания", "Университет"]}
            data={education.map(({ year, university }) => [
              year ? year.toString() : "",
              year ? year.toString() : "",
              university,
            ])}
            onItemChange={(col, i, value) => {
              if (col === "Университет") {
                updateUser((user) => (user.education[i].university = value));
              } else {
                updateUser(
                  (user) => (user.education[i].year = toNumber(value)),
                );
              }
            }}
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
          />
        </Subsection>
      );
    },
  ),
);
