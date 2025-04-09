import React, { Fragment } from "react";

import {
  Box,
  Grid,
  GridProps,
  IconButton,
  IconButtonProps,
  Input,
} from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";

export interface TimelineProps<T extends string> extends GridProps {
  cols: T[];
  data: string[][];
  editing: boolean;
  onItemChange: (col: T, i: number, value: string) => void;
  insertRow: (i: number) => void;
  removeRow: (i: number) => void;
}

interface RowButtonProps extends IconButtonProps {
  kind: "plus" | "minus";
}

const RowButton = React.forwardRef<HTMLButtonElement, RowButtonProps>(
  function RowButton(props, ref) {
    const { kind, ...rest } = props;

    return (
      <IconButton
        backgroundColor="white"
        borderRadius="full"
        borderWidth={3}
        minW="0"
        height="fit"
        position="absolute"
        right="0"
        bottom="0"
        transform={
          kind === "plus" ? "translate(50%, 50%)" : "translate(-110%, 50%)"
        }
        zIndex={1}
        color={kind === "plus" ? "blue.2" : "red.1"}
        borderColor={kind === "plus" ? "blue.2" : "red.1"}
        ref={ref}
        {...rest}
      >
        {kind === "plus" ? <LuPlus /> : <LuMinus />}
      </IconButton>
    );
  },
);

export const Timeline = React.memo(
  React.forwardRef(function Timeline<T extends string>(
    props: TimelineProps<T>,
    ref: React.RefAttributes<HTMLDivElement>["ref"],
  ) {
    const {
      cols,
      data,
      editing,
      onItemChange: onChange,
      insertRow,
      removeRow,
      ...rest
    } = props;

    return (
      <Grid ref={ref} {...rest}>
        {cols.map((header, i) => (
          <Box
            position="relative"
            px="6"
            pb="4"
            key={header}
            fontWeight="light"
            color="gray.2"
            fontSize="smaller"
            borderColor="gray.3"
            borderRightWidth={i < cols.length - 1 ? 1 : 0}
            borderBottomWidth={1}
          >
            {header}
            {editing && i === cols.length - 1 && (
              <RowButton kind="plus" onClick={() => insertRow(0)} />
            )}
          </Box>
        ))}

        {data.map((row, i) => (
          <Fragment key={i}>
            {row.map((value, j) => (
              <Box
                key={`${i}-${j}`}
                px="6"
                py="4"
                borderColor="gray.3"
                borderRightWidth={j < row.length - 1 ? 1 : 0}
                borderBottomWidth={1}
                fontSize="xl"
                position="relative"
              >
                <Input
                  required
                  disabled={!editing}
                  value={value}
                  onChange={({ target: { value } }) =>
                    onChange(cols[j], i, value)
                  }
                  opacity="1"
                  outline="none"
                />
                {editing && j === row.length - 1 && (
                  <RowButton kind="plus" onClick={() => insertRow(i + 1)} />
                )}
                {editing && j === row.length - 1 && (
                  <RowButton kind="minus" onClick={() => removeRow(i)} />
                )}
              </Box>
            ))}
          </Fragment>
        ))}
      </Grid>
    );
  }),
);
