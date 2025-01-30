import { applets } from "@web-applets/sdk";
import Quill from "quill";
import QuillMarkdown from "quilljs-markdown";
import "quill/dist/quill.snow.css";

let editor: Quill | null = null;

const context = applets.getContext();

context.setActionHandler("write", ({ text }) => {
  context.data = { text, source: "applet" };
});

context.setActionHandler("append", ({ text }) => {
  if (!editor) return;

  const currentContent = editor.getSemanticHTML();

  context.data = { text: currentContent + text, source: "applet" };
});

context.ondata = () => {
  if (!editor) {
    throw new Error("No editor found");
  }

  if (context?.data?.text && context?.data?.source === "applet") {
    /** We only want to update the editor if the change came from outside the editor */
    editor.clipboard.dangerouslyPasteHTML(context.data.text);
  }
};

context.onload = () => {
  const editorElement = document.getElementById("editor");
  if (!editorElement) {
    throw new Error("No element found for editor");
  }
  const quill = loadEditor(editorElement);

  quill.on("text-change", (_, __, source) => {
    /** If the change was made by the user, we want to sync the current text content to the applet context */
    if (source === "user") {
      /** We're ignoring the deltas and calling `getSemanticHTML`, this might cause performance problems */
      context.setData({ text: quill.getSemanticHTML(), source: "user" });
    }
  });
};

function loadEditor(element: HTMLElement) {
  editor = new Quill(element, {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        ["link"],
      ],
    },
  });

  new QuillMarkdown(editor);

  return editor;
}
