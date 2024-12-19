import { applets } from '@web-applets/sdk';
import CodeFlask from 'codeflask';

const context = applets.getContext();
context.data = {};

let flask = new CodeFlask(`#codeflask`, {
  language: 'js',
  lineNumbers: true,
  defaultTheme: false,
});

type WriteProps = { contents: string; language: string };
context.setActionHandler('write', ({ contents, language }: WriteProps) => {
  if (language !== context.data.language) {
    flask = new CodeFlask('#codeflask', {
      language: language,
      lineNumbers: true,
      defaultTheme: false,
    });
  }
  flask.updateCode(contents);

  context.data = {
    contents,
    language,
  };
});

flask.onUpdate((code: string) => {
  if (code === context.data?.contents) return;
  context.data = {
    language: context.data.language,
    contents: code,
  };
});
