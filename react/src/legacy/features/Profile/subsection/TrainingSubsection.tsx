import React, { Fragment } from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@legacy/features/user/types";
import { toNumber } from "@legacy/shared/utils";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline, TimelineInput, TimelineItem } from "../parts/Timeline";

export interface TrainingSubsectionProps extends SubsectionProps {
  training: User["training"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const TrainingSubsection = React.memo(function TrainingSubsection({
  training,
  editing,
  updateUser,
  ...rest
}: TrainingSubsectionProps) {
  return (
    <Subsection show={editing || training.length > 0} {...rest}>
      <Timeline
        templateColumns="1fr 7fr"
        editing={editing}
        cols={["Дата получения", "Квалификация"]}
        insertRow={(i) =>
          updateUser((user) =>
            user.training.splice(i, 0, {
              name: "",
              year: user.training[i - 1]?.year || new Date().getFullYear(),
              attachment: O.none(),
            }),
          )
        }
        removeRow={(i) => updateUser((user) => user.training.splice(i, 1))}
      >
        {training.map(({ name, year }, row) => (
          <Fragment key={row}>
            <TimelineItem row={row}>
              <TimelineInput
                fontSize={{ lg: "lg", xl: "xl" }}
                value={year || ""}
                maxLength={4}
                onChange={({ target }) =>
                  updateUser(
                    (user) =>
                      (user.training[row].year = toNumber(target.value)),
                  )
                }
              />
            </TimelineItem>
            <TimelineItem lastCol row={row}>
              <TimelineInput
                fontSize={{ lg: "lg", xl: "xl" }}
                value={name}
                maxLength={80}
                onChange={({ target }) =>
                  updateUser((user) => (user.training[row].name = target.value))
                }
              />
            </TimelineItem>
          </Fragment>
        ))}
      </Timeline>
    </Subsection>
  );
});
