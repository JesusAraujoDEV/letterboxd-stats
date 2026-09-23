import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OutdatedStatsBanner from "./OutdatedStatsBanner";

describe("OutdatedStatsBanner", () => {
  it("shows the warning text and the reupload button", () => {
    render(<OutdatedStatsBanner onReupload={() => undefined} />);

    expect(
      screen.getByText(
        "Tus estadísticas guardadas son de una versión anterior y no incluyen las secciones nuevas.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subir otro archivo" })).toBeInTheDocument();
  });

  it("calls onReupload once when the button is clicked", async () => {
    const onReupload = vi.fn();
    render(<OutdatedStatsBanner onReupload={onReupload} />);

    fireEvent.click(screen.getByRole("button", { name: "Subir otro archivo" }));

    expect(onReupload).toHaveBeenCalledTimes(1);
  });
});
