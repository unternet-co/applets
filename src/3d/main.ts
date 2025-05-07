import { applets } from '@web-applets/sdk';

const ctx = applets.register();

ctx.setActionHandler('generate_scene', ({ html }) => {
  ctx.data = { html };
});

ctx.ondata = () => {
  document.body.innerHTML = ctx.data.html;
};
