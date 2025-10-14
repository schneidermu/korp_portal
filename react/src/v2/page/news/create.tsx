import { Breadcrumbs } from "@/v2/view/Breadcrumbs";
import { Stack, styled } from "@styled-system/jsx";

export default function NewsCreatePage() {
  return (
    <Stack gap={2}>
      <Breadcrumbs />
      <styled.h1 fontSize="Headline/H1">Наша жизнь</styled.h1>
    </Stack>
  );
}
