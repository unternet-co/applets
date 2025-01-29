import { applets } from "@web-applets/sdk";
import Quill from "quill";
import QuillMarkdown from "quilljs-markdown";
import "quill/dist/quill.snow.css";

let editor: Quill | null = null;

const context = applets.getContext();

context.setActionHandler("write", ({ text }) => {
  context.data = { text };
});

context.setActionHandler("append", ({ text }) => {
  if (!editor) return;

  const delta = editor.getContents();
  const content = editor.getText();
  const html = editor.root.innerHTML;
  console.log("delta", JSON.stringify(delta));
  console.log("content", content);
  console.log("html", html);
});

context.ondata = () => {
  if (!editor) {
    throw new Error("No editor found");
  }

  if (context?.data?.text) {
    editor.clipboard.dangerouslyPasteHTML(context.data.text);
  }
};

context.onload = () => {
  const editorElement = document.getElementById("editor");
  if (!editorElement) {
    throw new Error("No element found for editor");
  }
  loadEditor(editorElement);
};

function loadEditor(element: HTMLElement) {
  editor = new Quill(element, {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        [{ script: "sub" }, { script: "super" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
  });

  new QuillMarkdown(editor);
}
