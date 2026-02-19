import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RichTextEditor from "@/components/rich-text-editor";

const { configureMock, useEditorMock } = vi.hoisted(() => ({
  configureMock: vi.fn(),
  useEditorMock: vi.fn()
}));

vi.mock("@tiptap/extension-placeholder", () => ({
  default: {
    configure: configureMock
  }
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {}
}));

vi.mock("@tiptap/react", () => ({
  useEditor: useEditorMock,
  EditorContent: () => <div data-testid="editor-content" />
}));

function createEditorMock(options?: { html?: string }) {
  const runMock = vi.fn();
  const toggleBoldMock = vi.fn();
  const toggleItalicMock = vi.fn();
  const toggleHeadingMock = vi.fn();
  const toggleBulletListMock = vi.fn();
  const focusMock = vi.fn();
  const setContentMock = vi.fn();
  const getHTMLMock = vi.fn().mockReturnValue(options?.html ?? "<p>same</p>");

  const chain = {
    focus: focusMock,
    toggleBold: toggleBoldMock,
    toggleItalic: toggleItalicMock,
    toggleHeading: toggleHeadingMock,
    toggleBulletList: toggleBulletListMock,
    run: runMock
  };

  focusMock.mockReturnValue(chain);
  toggleBoldMock.mockReturnValue(chain);
  toggleItalicMock.mockReturnValue(chain);
  toggleHeadingMock.mockReturnValue(chain);
  toggleBulletListMock.mockReturnValue(chain);

  return {
    chain: vi.fn(() => chain),
    commands: {
      setContent: setContentMock
    },
    getHTML: getHTMLMock,
    _mocks: {
      toggleBoldMock,
      toggleItalicMock,
      toggleHeadingMock,
      toggleBulletListMock,
      runMock,
      setContentMock
    }
  };
}

describe("RichTextEditor", () => {
  beforeEach(() => {
    configureMock.mockReset();
    useEditorMock.mockReset();
  });

  it("returns null while editor is unavailable", () => {
    useEditorMock.mockReturnValue(null);
    const { container } = render(<RichTextEditor value="<p>test</p>" onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders toolbar and runs formatting commands", () => {
    const editor = createEditorMock({ html: "<p>same</p>" });
    useEditorMock.mockReturnValue(editor);

    render(<RichTextEditor value="<p>same</p>" onChange={vi.fn()} />);

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    fireEvent.click(screen.getByRole("button", { name: "H2" }));
    fireEvent.click(screen.getByRole("button", { name: "Bullets" }));

    expect(editor._mocks.toggleBoldMock).toHaveBeenCalledTimes(1);
    expect(editor._mocks.toggleItalicMock).toHaveBeenCalledTimes(1);
    expect(editor._mocks.toggleHeadingMock).toHaveBeenCalledWith({ level: 2 });
    expect(editor._mocks.toggleBulletListMock).toHaveBeenCalledTimes(1);
    expect(editor._mocks.runMock).toHaveBeenCalledTimes(4);
  });

  it("synchronizes external value into editor content", () => {
    const editor = createEditorMock({ html: "<p>old</p>" });
    useEditorMock.mockReturnValue(editor);

    render(<RichTextEditor value="<p>new</p>" onChange={vi.fn()} />);

    expect(editor._mocks.setContentMock).toHaveBeenCalledWith("<p>new</p>", false);
  });

  it("does not set content when editor HTML already matches value", () => {
    const editor = createEditorMock({ html: "<p>same</p>" });
    useEditorMock.mockReturnValue(editor);

    render(<RichTextEditor value="<p>same</p>" onChange={vi.fn()} />);

    expect(editor._mocks.setContentMock).not.toHaveBeenCalled();
  });
});
