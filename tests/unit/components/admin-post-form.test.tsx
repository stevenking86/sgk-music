import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminPostForm from "@/components/admin-post-form";

vi.mock("@/components/rich-text-editor", () => ({
  default: ({
    value,
    onChange
  }: {
    value: string;
    onChange: (html: string) => void;
  }) => (
    <div>
      <div data-testid="mock-editor-value">{value}</div>
      <button type="button" onClick={() => onChange("<p>updated by editor</p>")}>
        Simulate Editor Update
      </button>
    </div>
  )
}));

describe("AdminPostForm", () => {
  it("renders with default values", () => {
    render(<AdminPostForm action={vi.fn()} submitLabel="Create post" />);

    const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
    const spotifyInput = screen.getByLabelText("Spotify Playlist URL") as HTMLInputElement;
    const publishedInput = screen.getByLabelText("Publish now") as HTMLInputElement;
    const hiddenContentInput = screen.getByDisplayValue("<p></p>") as HTMLInputElement;

    expect(titleInput.value).toBe("");
    expect(spotifyInput.value).toBe("");
    expect(publishedInput.checked).toBe(false);
    expect(hiddenContentInput.name).toBe("contentHtml");
    expect(screen.getByRole("button", { name: "Create post" })).toBeInTheDocument();
  });

  it("renders with initial values", () => {
    render(
      <AdminPostForm
        action={vi.fn()}
        submitLabel="Save changes"
        initialValues={{
          title: "Test Post",
          contentHtml: "<p>Existing content</p>",
          spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk",
          isPublished: true
        }}
      />
    );

    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Test Post");
    expect((screen.getByLabelText("Spotify Playlist URL") as HTMLInputElement).value).toBe(
      "https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk"
    );
    expect((screen.getByLabelText("Publish now") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByDisplayValue("<p>Existing content</p>") as HTMLInputElement).name).toBe("contentHtml");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("updates hidden content field when editor changes", () => {
    render(<AdminPostForm action={vi.fn()} submitLabel="Create post" />);
    fireEvent.click(screen.getByText("Simulate Editor Update"));

    expect(screen.getByDisplayValue("<p>updated by editor</p>")).toBeInTheDocument();
    expect(screen.getByTestId("mock-editor-value")).toHaveTextContent("<p>updated by editor</p>");
  });
});
