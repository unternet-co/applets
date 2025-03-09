import { applets } from '@web-applets/sdk';
import CodeFlask from 'codeflask';

const self = applets.register();

self.data = {
  language: 'js',
  contents: '',
};

let flask = new CodeFlask(`#codeflask`, {
  language: 'js',
  lineNumbers: true,
  defaultTheme: false,
});

type WriteProps = { contents: string; language: string };
self.setActionHandler('write', ({ contents, language }: WriteProps) => {
  if (language !== self.data.language) {
    flask = new CodeFlask('#codeflask', {
      language: language,
      lineNumbers: true,
      defaultTheme: false,
    });
  }
  flask.updateCode(contents);

  self.data = {
    contents,
    language,
  };
});

self.ondata = () => {
  // TODO: Need to have an option to silently update data
  if (!self.data) return;
  if (self.data?.contents === flask.getCode()) return;
  flask.updateCode(self.data.contents);
};

flask.onUpdate((code: string) => {
  self.data = {
    language: self.data?.language,
    contents: code,
  };
});
