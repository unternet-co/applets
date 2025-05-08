import { applets } from '@web-applets/sdk';

const self = applets.register();

self.setActionHandler('generate_scene', ({ html }) => {
  self.data = { html };
});

self.ondata = () => {
  document.body.innerHTML = self.data.html;
};
