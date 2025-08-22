import { appletContext } from '@web-applets/sdk';
import './views/time-display';
import './views/clock-widget';

const applet = appletContext.connect();

applet.state = { time: 0, timezone: '', timeString: '' };

applet.setActionHandler('timeforzone', ({ timezone }: { timezone: string }) => {
  if (timezone === 'Local') {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  applet.state = { timezone };
});

applet.onrender = () => {
  document.body.innerHTML = `
  <time-display
      timezone="${applet.state.timezone}"
      style="padding: 20px;"
      >
    </time-display>
    `;
};
