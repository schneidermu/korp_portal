import { useEffect } from "react";

import { Box, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { Button } from "@ui/atoms/buttons";
import { Modal } from "@ui/molecules/feedback";
import { Input, Label, LabelProps, Textarea, Tip } from "@ui/molecules/inputs";

import { useAppDispatch } from "@app/store";
import {
  actions,
  updateSecretSanta,
  useIsRegistrationFinished,
  useGiftGiverSelector,
  useSliceSelector,
} from "./slice";

import { useSecretSanta } from "@api/seasonal/santa";

import { GiftgiverBanner, JoinBanner, WaitingBanner } from "./banners";

export const SecretSanta = () => {
  const dispatch = useAppDispatch();
  const isOpen = useSliceSelector((s) => s.isOpen);
  const isActive = useSliceSelector((s) => s.isActive);
  const isParticipating = useSliceSelector((s) => s.participating);
  const isRegistrationFinished = useIsRegistrationFinished();

  const { data, error } = useSecretSanta();

  if (error) {
    console.error(error);
  }

  useEffect(() => {
    if (!data) return;
    dispatch(actions.hydrated(data));
  }, [dispatch, data]);

  const noMatch =
    isParticipating && isRegistrationFinished && !data?.giftReceiver;

  if (!isActive || noMatch) {
    return;
  }

  return (
    <Box>
      <Modal
        title="Тайный Дед Мороз"
        isOpen={isOpen}
        close={() => dispatch(actions.closed())}
      >
        <styled.form
          onSubmit={async (e) => {
            e.preventDefault();
            await dispatch(updateSecretSanta());
          }}
          className={stack({ gap: 11 })}
          mt={11}
        >
          <Stack gap={3}>
            <WishesInput label="Пожелания" />
            <TextInput required label="Адрес" attr="address" />
            <NumberInput required label="Индекс" attr="zipCode" />
            <TextInput required label="Телефон" attr="phone" />
          </Stack>
          <Button type="submit" w="full">
            {isParticipating ? "Сохранить" : "Зарегистрироваться"}
          </Button>
        </styled.form>
      </Modal>
      {isParticipating ? (
        isRegistrationFinished ? (
          <GiftgiverBanner />
        ) : (
          <WaitingBanner />
        )
      ) : (
        !isRegistrationFinished && <JoinBanner />
      )}
    </Box>
  );
};

const WishesInput = (props: Omit<LabelProps, "children">) => {
  const dispatch = useAppDispatch();
  const wishes = useGiftGiverSelector((d) => d.wishes);

  return (
    <Label {...props}>
      <Textarea
        required
        rows={6}
        text={wishes}
        setText={(wishes) => dispatch(actions.edited({ wishes }))}
        // TODO: extract const
        maxLength={100}
      />
      <Tip>
        {wishes.length} / {100}
      </Tip>
    </Label>
  );
};

const TextInput = ({
  attr,
  required = false,
  ...rest
}: { attr: "address" | "phone"; required?: boolean } & Omit<
  LabelProps,
  "children"
>) => {
  const dispatch = useAppDispatch();
  const text = useGiftGiverSelector((d) => d[attr]);

  return (
    <Label {...rest}>
      <Input
        required={required}
        text={text}
        setText={(text) => dispatch(actions.edited({ [attr]: text }))}
      />
    </Label>
  );
};

const NumberInput = ({
  attr,
  required = false,
  ...rest
}: { attr: "zipCode"; required?: boolean } & Omit<LabelProps, "children">) => {
  const dispatch = useAppDispatch();
  const num = useGiftGiverSelector((d) => d[attr]);

  return (
    <Label {...rest}>
      <Input
        required={required}
        text={num ? num.toString() : ""}
        setText={(text) =>
          dispatch(
            actions.edited({
              [attr]: Number(text.replace(/[^0-9]/g, "")) || null,
            }),
          )
        }
      />
    </Label>
  );
};
