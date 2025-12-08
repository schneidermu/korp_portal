import { Box, BoxProps, HStack, Stack, styled } from "@styled-system/jsx";

import { useFetchUser } from "@api/user";

import { Button } from "@ui/atoms/buttons";
import { Prompt } from "@ui/molecules/feedback";

import {
  actions,
  deleteSecretSanta,
  useFormattedDeadline,
  useGiftReceiverSelector,
  useSliceSelector,
} from "./slice";

import { fullNameLong } from "@api/user/utils";
import { useAppDispatch } from "@app/store";
import gifts from "./gifts.webp";
import letter from "./letter.webp";
import santa from "./santa.webp";

export const GiftgiverBanner = () => {
  const budget = Math.floor(Number(useSliceSelector((s) => s.budget)));
  const wishes = useGiftReceiverSelector((p) => p.wishes);
  const phone = useGiftReceiverSelector((p) => p.phone);
  const address = useGiftReceiverSelector((p) => p.address);
  const zipCode = useGiftReceiverSelector((p) => p.zipCode);
  const { data: receiver } = useFetchUser(useGiftReceiverSelector((p) => p.id));

  if (!receiver) return;

  return (
    <Banner
      img={gifts}
      bg="linear-gradient(97deg, #FFF 62.86%, #EB888A 167.56%)"
    >
      <Stack gap={4}>
        <styled.h1
          color="Grayscale/Black"
          fontSize="Headline/H3"
          fontWeight="semibold"
        >
          Жеребьёвка завершена!
        </styled.h1>
        <styled.p color="Grayscale/HintText">
          Теперь вы — личный Дед Мороз для этого человека! Придумайте
          персональный и творческий подарок в рамках нашего бюджета (от 700 до{" "}
          {budget} руб.), который его искренне обрадует. Отправьте его любым
          удобным способом.
        </styled.p>
        <styled.h2
          color="Grayscale/Black"
          fontSize="Headline/H4"
          fontWeight="semibold"
        >
          {fullNameLong(receiver)}
        </styled.h2>
        <styled.p color="Grayscale/HintText">
          <strong>Пожелание: </strong>«{wishes}»
        </styled.p>
        <styled.p color="Grayscale/HintText">
          <strong>Адрес: </strong>
          {address}, индекс {zipCode}
        </styled.p>
        <styled.p color="Grayscale/HintText">
          <strong>Телефон: </strong>
          {phone}
        </styled.p>
        <styled.h2
          color="Grayscale/Black"
          fontSize="Headline/H4"
          fontWeight="semibold"
        >
          Готовы творить праздник? Удачи в поисках идеального подарка! 🎁✨
        </styled.h2>
      </Stack>
    </Banner>
  );
};

export const WaitingBanner = () => {
  const dispatch = useAppDispatch();

  const deadline = useFormattedDeadline();

  return (
    <Banner
      img={letter}
      bg="linear-gradient(97deg, #FFF 62.86%, #D4D5FF 167.56%)"
    >
      <Stack gap={4}>
        <styled.h1
          color="Grayscale/Black"
          fontSize="Headline/H3"
          fontWeight="semibold"
        >
          Мороз-центр получил все ваши письма!
        </styled.h1>
        <styled.p color="Grayscale/HintText">
          В ближайшее время {deadline} мы проведём саму жеребьёвку с помощью
          случайного генератора честных чисел.
          <br />
          Как только каждый получит имя своего Тайного Подопечного — мы сразу же
          вам сообщим на этой же странице!
        </styled.p>
        <styled.h2
          color="Grayscale/Black"
          fontSize="Headline/H4"
          fontWeight="semibold"
        >
          Сохраняйте интригу и наберитесь терпения. <br />
          Скоро начнётся самое интересное — этап тайных приготовлений!
        </styled.h2>
        <HStack gap={4}>
          <Button onClick={() => dispatch(actions.opened())}>
            Редактировать пожелание
          </Button>
          <Prompt.Root>
            <Prompt.Trigger variant="text">Удалить заявку</Prompt.Trigger>
            <Prompt.Modal
              heading="Удаление заявки"
              message="Вы уверены, что хотите удалить заявку на участие в Тайном Дед Морозе?"
              cover={<Prompt.CoverDelete />}
            >
              <Prompt.Action variant="secondary">Отменить</Prompt.Action>
              <Prompt.Action
                onClick={async () => dispatch(deleteSecretSanta())}
              >
                Удалить
              </Prompt.Action>
            </Prompt.Modal>
          </Prompt.Root>
        </HStack>
      </Stack>
    </Banner>
  );
};

export const JoinBanner = () => {
  const dispatch = useAppDispatch();

  const deadline = useFormattedDeadline();
  const budget = Math.floor(Number(useSliceSelector((s) => s.budget)));

  return (
    <Banner
      img={santa}
      bg="linear-gradient(97deg, #FFF 62.86%, #88B2EB 167.56%)"
    >
      <Stack gap={6}>
        <Stack gap={4}>
          <styled.h1
            color="Grayscale/Black"
            fontSize="Headline/H3"
            fontWeight="semibold"
          >
            Пришло время подарков!
          </styled.h1>
          <styled.p color="Grayscale/HintText">
            Дарите не просто подарки, а волшебство и сюрпризы! Участвуйте в
            нашем Тайном Дед Морозе, чтобы почувствовать дух праздника и теплоту
            нашего дружного коллектива через города.
          </styled.p>
          <styled.h2
            color="Grayscale/Black"
            fontSize="Headline/H4"
            fontWeight="semibold"
          >
            Как это работает:
          </styled.h2>
          <styled.ol
            color="Grayscale/HintText"
            listStyleType="decimal"
            listStylePosition="inside"
          >
            <styled.li>Зарегистрируйтесь до {deadline}</styled.li>
            <styled.li>Получите имя и адрес своего тайного друга </styled.li>
            <styled.li>
              Отправьте небольшой подарок (в рамках бюджета от 700 до {budget}{" "}
              руб.)
            </styled.li>
            <styled.li>Получите свой подарок по почте</styled.li>
          </styled.ol>
        </Stack>
        <Button w="fit" onClick={() => dispatch(actions.opened())}>
          Стать участником
        </Button>
      </Stack>
    </Banner>
  );
};

const Banner = ({
  img,
  children,
  ...rest
}: {
  img: string;
} & BoxProps) => {
  return (
    <styled.article
      shadow="S"
      borderRadius="12px"
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      p={6}
      position="relative"
      _hover={{ shadow: "M" }}
      {...rest}
    >
      <styled.img
        position="absolute"
        src={img}
        right="0"
        bottom="0"
        maxH="95%"
        maxW="40%"
      />
      <Box w="65%">{children}</Box>
    </styled.article>
  );
};
