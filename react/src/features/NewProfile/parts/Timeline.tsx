import { Grid, HStack, Input, Show, Stack, Text } from "@chakra-ui/react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "./Button";

export const Timeline = ({
  headers,
  data,
  editing,
  onChange,
  pushRow,
  popRow,
}: {
  headers: string[];
  data: string[][];
  editing: boolean;
  onChange: (i: number, j: number, value: string) => void;
  pushRow: () => void;
  popRow: () => void;
}) => {
  return (
    <Stack gap="7">
      <Grid templateColumns="1fr 1fr 4fr">
        {headers.map((header, i) => (
          <Text
            key={header}
            fontWeight="light"
            color="gray.2"
            fontSize="smaller"
            px="6"
            pb="4"
            borderColor="gray.3"
            borderRightWidth={i < headers.length - 1 ? 1 : 0}
            borderBottomWidth={1}
          >
            {header}
          </Text>
        ))}

        {data.map((row, i) => (
          <Fragment key={i}>
            {row.map((value, j) => (
              <Input
                key={`${i}-${j}`}
                onChange={({ target: { value } }) => onChange(i, j, value)}
                disabled={!editing}
                opacity="1"
                fontSize="xl"
                px="6"
                py="4"
                borderColor="gray.3"
                borderRightWidth={j < row.length - 1 ? 1 : 0}
                borderBottomWidth={1}
                defaultValue={value}
                outline="none"
              />
            ))}
          </Fragment>
        ))}
      </Grid>
      <Show when={editing}>
        <HStack w="fit">
          <Button onClick={() => console.log("here")}>Добавить</Button>
          <Button onClick={popRow}>Удалить</Button>
        </HStack>
      </Show>
    </Stack>
  );
};
