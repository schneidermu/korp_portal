import React, { Fragment } from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";
import { toNumber, toNumberOption } from "@/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline, TimelineInput, TimelineItem } from "../parts/Timeline";

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
            templateColumns="1fr 1fr 6fr"
            editing={editing}
            cols={["Дата начала", "Дата окончания", "Должность"]}
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
          >
            {career.map(({ year_start, year_leave, position }, row) => (
              <Fragment key={row}>
                <TimelineItem row={row}>
                  <TimelineInput
                    value={year_start}
                    onChange={({ target }) =>
                      updateUser(
                        (user) =>
                          (user.career[row].year_start = toNumber(
                            target.value,
                          )),
                      )
                    }
                  />
                </TimelineItem>

                <TimelineItem row={row}>
                  <TimelineInput
                    value={O.match(year_leave, {
                      onNone: () => "н. вр.",
                      onSome: (y) => y.toString(),
                    })}
                    onChange={({ target }) =>
                      updateUser(
                        (user) =>
                          (user.career[row].year_leave = toNumberOption(
                            target.value,
                          )),
                      )
                    }
                  />
                </TimelineItem>

                <TimelineItem lastCol row={row}>
                  <TimelineInput
                    value={position}
                    onChange={({ target }) =>
                      updateUser(
                        (user) => (user.career[row].position = target.value),
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
