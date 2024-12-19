import './markdown-text';
import { appletContext } from '@web-applets/sdk';

const applet = appletContext.connect();

applet.setActionHandler('respond', ({ text }) => {
  applet.setState({ text });
});

applet.onrender = () => {
  document.body.innerHTML = `<markdown-text>${applet.state?.text}</markdown-text>`;
};
