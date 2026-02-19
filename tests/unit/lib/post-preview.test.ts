import { describe, expect, it } from "vitest";
import { toPreviewText } from "@/lib/post-preview";

describe("post preview text", () => {
  it("strips tags and normalizes whitespace", () => {
    expect(toPreviewText("<p>Hello   <strong>world</strong></p>\n<p>Again</p>")).toBe("Hello world Again");
  });

  it("truncates and appends ellipsis when content exceeds max length", () => {
    const html = "<p>abcdefghijklmnopqrstuvwxyz</p>";
    expect(toPreviewText(html, 10)).toBe("abcdefghij...");
  });
});
