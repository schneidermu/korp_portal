import React, { createContext, useContext } from "react";

import {
  Box,
  BoxProps,
  Grid,
  GridProps,
  IconButton,
  IconButtonProps,
  Input,
  InputProps,
} from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";

export interface TimelineProps extends GridProps {
  cols: string[];
  editing: boolean;
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

const TimelineContext = createContext<{
  cols: string[];
  editing: boolean;
  insertRow: (i: number) => void;
  removeRow: (i: number) => void;
} | null>(null);

export const TimelineInput = React.memo(
  React.forwardRef<HTMLInputElement, InputProps>(
    function TimelineInput(props, ref) {
      const ctx = useContext(TimelineContext);
      if (!ctx) return;

      const { editing } = ctx;

      return (
        <Input
          required
          disabled={!editing}
          opacity="1"
          outline="none"
          borderWidth={0}
          cursor="auto"
          ref={ref}
          {...props}
        />
      );
    },
  ),
);

export interface TimelineItemProps extends BoxProps {
  row: number;
  lastCol?: boolean;
}

export const TimelineItem = React.memo(
  React.forwardRef<HTMLDivElement, TimelineItemProps>(
    function TimelineItem(props, ref) {
      const ctx = useContext(TimelineContext);
      if (!ctx) return;

      const { editing, insertRow, removeRow } = ctx;
      const { row, lastCol, children, ...rest } = props;

      return (
        <Box
          px="6"
          py="4"
          borderColor="gray.3"
          borderRightWidth={lastCol ? 0 : 1}
          borderBottomWidth={1}
          fontSize="xl"
          position="relative"
          ref={ref}
          {...rest}
        >
          {children}
          {editing && lastCol && (
            <RowButton kind="plus" onClick={() => insertRow(row + 1)} />
          )}
          {editing && lastCol && (
            <RowButton kind="minus" onClick={() => removeRow(row)} />
          )}
        </Box>
      );
    },
  ),
);

export const Timeline = React.memo(
  React.forwardRef(function Timeline(
    props: TimelineProps,
    ref: React.RefAttributes<HTMLDivElement>["ref"],
  ) {
    const { cols, editing, insertRow, removeRow, children, ...rest } = props;

    return (
      <TimelineContext.Provider value={{ cols, editing, insertRow, removeRow }}>
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
              textWrap="nowrap"
            >
              {header}
              {editing && i === cols.length - 1 && (
                <RowButton kind="plus" onClick={() => insertRow(0)} />
              )}
            </Box>
          ))}

          {children}
        </Grid>
      </TimelineContext.Provider>
    );
  }),
);
