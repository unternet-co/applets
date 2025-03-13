import { applets } from '@web-applets/sdk';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const self = applets.register();
self.data = {
  hint: 'Your job is to collaborate with the user to draft a document. You can respond to user commands by writing or appending something to the editor, or by engaging in clarifying communication/follow-up questions if appropriate. ONLY use HTML for actions like `append` and `write`, not conversational text responses (text messages should be plain text). When using actions be aware that you can use rich text.',
};

const editorElement = document.getElementById('editor')!;
const editor = loadEditor(editorElement);

self.setActionHandler('write', ({ text }) => {
  self.data = { ...self.data, text, source: 'applet' };
});

self.setActionHandler('append', ({ text }) => {
  const currentContent = editor.getMarkdown();
  self.data = { text: currentContent + text, source: 'applet' };
});

self.ondata = () => {
  // If the external data is different from the current editor content,
  // update the editor.
  if (self.data.text && self.data.text !== editor.getMarkdown()) {
    editor.setMarkdown(self.data.text);
  }
};

// Listen to changes in the editor and update the applet data accordingly.
editor.on('change', () => {
  console.log('text change');
  self.data = { text: editor.getMarkdown() };
});

function loadEditor(element: HTMLElement) {
  const editor = Editor.factory({
    el: element,
    height: '100%',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
      ['scrollSync'],
    ],
  });
  return editor;
}
