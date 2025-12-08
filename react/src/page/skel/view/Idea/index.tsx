import { useActionState, useContext } from "react";

import { Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { Button } from "@ui/atoms/buttons";

import { css } from "@styled-system/css";
import { DrawerContext } from "@ui/molecules/navigation";
import { IDEA_MAX_TEXT_LENGTH } from "../../const";

import { useAppDispatch } from "@app/store";
import { Modal } from "@ui/molecules/feedback";
import { Label, Textarea, Tip } from "@ui/molecules/inputs";
import { useFormStatus } from "react-dom";
import { Congrats } from "./assets/Congrats";
import { actions, submitIdea, useSliceSelector } from "./slice";

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
  const isSuccess = useSliceSelector((s) => s.isSuccess);

  return isSuccess ? <SuccessModal /> : <IdeaModalForm />;
};

const IdeaModalForm = () => {
  const dispatch = useAppDispatch();

  const isOpen = useSliceSelector((s) => s.isOpen);

  const [, submitAction] = useActionState(async () => {
    try {
      await dispatch(submitIdea());
    } catch (e) {
      return e;
    }
    return null;
  }, null);

  return (
    <Modal
      heading="Предложить идею"
      isOpen={isOpen}
      close={() => dispatch(actions.closed())}
    >
      <styled.form action={submitAction} mt={11} className={stack({ gap: 11 })}>
        <IdeaTextInput />
        <IdeaSubmit />
      </styled.form>
    </Modal>
  );
};

const IdeaTextInput = () => {
  const dispatch = useAppDispatch();
  const text = useSliceSelector((s) => s.text);

  return (
    <Label label="Идея">
      <Textarea
        required
        text={text}
        setText={(text) => dispatch(actions.typed(text))}
        rows={6}
        maxLength={IDEA_MAX_TEXT_LENGTH}
      />
      <Tip>
        {text.length} / {IDEA_MAX_TEXT_LENGTH}
      </Tip>
    </Label>
  );
};

const IdeaSubmit = () => {
  const isEmpty = useSliceSelector((s) => s.text.length === 0);
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="L" disabled={isEmpty || pending}>
      Предложить идею
    </Button>
  );
};

const SuccessModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useSliceSelector((s) => s.isOpen);

  const close = () => dispatch(actions.closed());

  return (
    <Modal isOpen={isOpen} close={close}>
      <Stack mt={11} gap={11}>
        <Stack gap={3} align="center">
          <Congrats className={css({ w: 32 })} />
          <styled.h1 fontSize="Headline/H3" fontWeight="semibold">
            Всё получилось
          </styled.h1>
          <styled.p fontWeight="light">
            Мы изучим Ваше предложение и вернёмся с обратной связью!
          </styled.p>
        </Stack>
        <Button onClick={close}>Вернуться на главную</Button>
      </Stack>
    </Modal>
  );
};
