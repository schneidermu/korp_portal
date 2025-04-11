import React, { Fragment } from "react";

import { Option as O } from "effect";

import { UpdateUserFn, User } from "@/features/user/types";

import { Subsection, SubsectionProps } from "../parts/Subsection";
import { Timeline, TimelineInput, TimelineItem } from "../parts/Timeline";

export interface TrainingSubsectionProps extends SubsectionProps {
  training: User["training"];
  editing: boolean;
  updateUser: UpdateUserFn;
}

export const TrainingSubsection = React.memo(
  React.forwardRef<HTMLDivElement, TrainingSubsectionProps>(
    function TrainingSubsection(props, ref) {
      const { training, editing, updateUser, ...rest } = props;

      return (
        <Subsection show={editing || training.length > 0} ref={ref} {...rest}>
          <Timeline
            templateColumns="1fr 7fr"
            editing={editing}
            cols={["Дата получения", "Квалификация"]}
            insertRow={(i) =>
              updateUser((user) =>
                user.training.splice(i, 0, {
                  name: "",
                  attachment: O.none(),
                }),
              )
            }
            removeRow={(i) => updateUser((user) => user.training.splice(i, 1))}
          >
            {training.map(({ name }, row) => (
              <Fragment key={row}>
                <TimelineItem row={row}></TimelineItem>
                <TimelineItem lastCol row={row}>
                  <TimelineInput
                    value={name}
                    onChange={({ target }) =>
                      updateUser(
                        (user) => (user.training[row].name = target.value),
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
