import { useActionState, useContext } from "react";

import { Box, HStack, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { Button, IconButton } from "@ui/atoms/buttons";
import { Modal } from "@view/Modal";

import { SaxCloseCircleLinear } from "@meysam213/iconsax-react";
import { css } from "@styled-system/css";
import { IDEA_MAX_TEXT_LENGTH } from "../../const";
import { DrawerContext } from "@ui/molecules/navigation";

import { useAppDispatch } from "@app/store";
import { actions, submitIdea, useSliceSelector } from "./slice";
import { Congrats } from "./assets/Congrats";

export const IdeaPrompt = () => {
  const dispatch = useAppDispatch();

  // TODO: extract higher
  const ctx = useContext(DrawerContext);

  if (!ctx.isOpen || ctx.isAnimating) return;

  return (
    <styled.article
      className={stack({ gap: 4, align: "center" })}
      borderColor="Corporate/Accent"
      borderWidth="1px"
      color="Grayscale/Black"
      borderRadius="24px" /* FIXME */
      p={6}
    >
      <Stack gap={3} textAlign="center">
        <styled.h1 fontWeight="semibold" fontSize="Body/M">
          У Вас есть идеи?
        </styled.h1>
        <styled.p fontSize="Body/XS">
          Предложите идею по развитию внутреннего контура, и мы обязательно её
          реализуем
        </styled.p>
      </Stack>
      {/* TODO: icons */}
      <Button w="fit" onClick={() => dispatch(actions.opened())}>
        Предложить идею
      </Button>
      <IdeaWindow />
    </styled.article>
  );
};

const IdeaWindow = () => {
  const dispatch = useAppDispatch();

  const isSuccess = useSliceSelector((s) => s.isSuccess);
  const isOpen = useSliceSelector((s) => s.isOpen);

  return (
    <Modal isOpen={isOpen} onClose={() => dispatch(actions.closed())}>
      <Box
        borderRadius="25px" // FIXME
        p={6}
        w="600px"
        bg="white"
      >
        {isSuccess ? <SuccessScreen /> : <IdeaForm />}
      </Box>
    </Modal>
  );
};

const IdeaForm = () => {
  const dispatch = useAppDispatch();

  const text = useSliceSelector((s) => s.text);

  const [, submitAction, isPending] = useActionState(async () => {
    try {
      await dispatch(submitIdea());
    } catch (e) {
      return e;
    }
    return null;
  }, null);

  return (
    <styled.form action={submitAction}>
      <styled.article className={stack({ gap: 10 })}>
        <HStack justify="space-between">
          <styled.h1 fontSize="Headline/H3" fontWeight="semibold">
            Предложить идею
          </styled.h1>
          <IconButton
            color="Grayscale/Border"
            onClick={() => dispatch(actions.closed())}
          >
            <SaxCloseCircleLinear className={css({ w: 6, h: 6 })} />
          </IconButton>
        </HStack>
        <styled.label className={stack({ gap: 1 })}>
          <Box fontSize="Body/M" fontWeight="semibold">
            Идея
          </Box>
          <styled.textarea
            required
            name="text"
            borderRadius="8px"
            borderWidth="1px"
            borderColor="Grayscale/SpacerLight"
            rows={6}
            value={text}
            onChange={(e) => dispatch(actions.typed(e.target.value))}
            p={3}
            maxLength={IDEA_MAX_TEXT_LENGTH}
          />
          <Box alignSelf="end" fontSize="Body/XS" color="Grayscale/Border">
            {text.length}/{IDEA_MAX_TEXT_LENGTH}
          </Box>
        </styled.label>
        <Button
          type="submit"
          size="L"
          disabled={text.length === 0 || isPending}
        >
          Предложить идею
        </Button>
      </styled.article>
    </styled.form>
  );
};

const SuccessScreen = () => {
  const dispatch = useAppDispatch();

  return (
    <styled.article className={stack({ gap: 10 })}>
      <IconButton
        color="Grayscale/Border"
        onClick={() => dispatch(actions.closed())}
        alignSelf="end"
      >
        <SaxCloseCircleLinear className={css({ w: 6, h: 6 })} />
      </IconButton>
      <Stack gap={3} align="center">
        <Congrats className={css({ w: 32 })} />
        <styled.h1 fontSize="Headline/H3" fontWeight="semibold">
          Всё получилось
        </styled.h1>
        <styled.p fontWeight="light">
          Мы изучим Ваше предложение и вернёмся с обратной связью!
        </styled.p>
      </Stack>
      <Button onClick={() => dispatch(actions.closed())}>
        Вернуться на главную
      </Button>
    </styled.article>
  );
};
