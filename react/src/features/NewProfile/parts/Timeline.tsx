import { Box, Grid, HStack, Input, Show, Stack, Text } from "@chakra-ui/react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "./Button";

export const Timeline = <T extends string>({
  cols,
  data,
  editing,
  onChange,
  pushRow,
  popRow,
}: {
  cols: T[];
  data: string[][];
  editing: boolean;
  onChange: (col: T, i: number, value: string) => void;
  pushRow: () => void;
  popRow: () => void;
}) => {
  return (
    <Stack gap="7">
      <Grid templateColumns="1fr 1fr 4fr">
        {cols.map((header, i) => (
          <Text
            key={header}
            fontWeight="light"
            color="gray.2"
            fontSize="smaller"
            px="6"
            pb="4"
            borderColor="gray.3"
            borderRightWidth={i < cols.length - 1 ? 1 : 0}
            borderBottomWidth={1}
          >
            {header}
          </Text>
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
              </Box>
            ))}
          </Fragment>
        ))}
      </Grid>
      <Show when={editing}>
        <HStack w="fit">
          <Button variant="solid" onClick={pushRow}>
            Добавить
          </Button>
          <Button variant="ghost" onClick={popRow}>
            Удалить
          </Button>
        </HStack>
      </Show>
    </Stack>
  );
};
