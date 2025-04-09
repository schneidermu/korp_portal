import React from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber, toNumberOption } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline } from "../parts/Timeline";

export interface CareerSubsectionProps extends SubsectionProps {
  career: User["career"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const CareerSubsection = React.memo(
  React.forwardRef<HTMLDivElement, CareerSubsectionProps>(
    function CareerSubsection(props, ref) {
      const { career, editing, updateUser, ...rest } = props;

      return (
        <Subsection show={editing || career.length > 0} ref={ref} {...rest}>
          <Timeline
            templateColumns="1fr 1fr 4fr"
            editing={editing}
            cols={["Дата начала", "Дата окончания", "Должность"]}
            data={career.map(({ year_start, year_leave, position }) => [
              year_start ? year_start.toString() : "",
              O.match(year_leave, {
                onNone: () => "н. вр.",
                onSome: (y) => y.toString(),
              }),
              position,
            ])}
            onItemChange={(col, i, value) => {
              if (col === "Дата начала") {
                updateUser(
                  (user) => (user.career[i].year_start = toNumber(value)),
                );
              } else if (col === "Дата окончания") {
                updateUser(
                  (user) => (user.career[i].year_leave = toNumberOption(value)),
                );
              } else if (col === "Должность") {
                updateUser((user) => (user.career[i].position = value));
              }
            }}
            insertRow={(i) =>
              updateUser((user) =>
                user.career.splice(i, 0, {
                  month_start: O.none(),
                  month_leave: O.none(),
                  year_start: 0,
                  year_leave: O.some(
                    user.career[user.career.length - 1]?.year_start ??
                      new Date().getFullYear(),
                  ),
                  position: "",
                }),
              )
            }
            removeRow={(i) => updateUser((user) => user.career.splice(i, 1))}
          />
        </Subsection>
      );
    },
  ),
);
