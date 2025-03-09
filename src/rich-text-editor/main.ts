import { applets } from '@web-applets/sdk';
import Quill from 'quill';
import QuillMarkdown from 'quilljs-markdown';
import 'quill/dist/quill.snow.css';

const self = applets.register();
self.data = {
  hint: 'Your job is to collaborate with the user to draft a document. You can respond to user commands by writing or appending something to the editor, or by engaging in clarifying communication/follow-up questions if appropriate. ONLY use HTML for actions like `append` and `write`, not conversational text responses (text messages should be plain text).',
};

const editorElement = document.getElementById('editor')!;
const editor = loadEditor(editorElement);

self.setActionHandler('write', ({ text }) => {
  self.data = { ...self.data, text, source: 'applet' };
});

self.setActionHandler('append', ({ text }) => {
  const currentContent = editor.getSemanticHTML();
  self.data = { text: currentContent + text, source: 'applet' };
});

self.ondata = () => {
  if (self.data.text && self.data.text !== editor.getSemanticHTML()) {
    /** We only want to update the editor if the change came from outside the editor */
    /** Disable the editor while pasting so that it doesn't steal focus */
    editor.disable();
    editor.clipboard.dangerouslyPasteHTML(self.data.text);
    editor.enable();
  }
};

editor.on('text-change', (_, __, source) => {
  console.log('text change');
  self.data = { text: editor.getSemanticHTML() };
});

function loadEditor(element: HTMLElement) {
  const quill = new Quill(element, {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
      ],
    },
  });

  new QuillMarkdown(quill);

  return quill;
}
