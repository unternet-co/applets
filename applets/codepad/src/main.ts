import { applets } from '@web-applets/sdk';
import CodeFlask from 'codeflask';

const context = applets.getContext();
context.data = {
  language: 'js',
  contents: '',
};

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

context.ondata = () => {
  // TODO: Need to have an option to silently update data
  if (context.data?.contents === flask.getCode()) return;
  flask.updateCode(context.data.context);
};

flask.onUpdate((code: string) => {
  if (code === context.data?.contents) return;
  context.data = {
    language: context.data?.language,
    contents: code,
  };
});
