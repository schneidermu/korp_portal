import { render, screen } from "@testing-library/react";

import { CalendarWidget } from "./CalendarWidget";

describe("App", () => {
  it("renders headline", () => {
    render(<CalendarWidget />);

    screen.debug();

    // check if App components renders headline
  });
});
