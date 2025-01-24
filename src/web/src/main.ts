import { applets } from '@web-applets/sdk';
import Unternet from '@unternet/sdk';

const context = applets.getContext();
const unternet = new Unternet({ isDev: false });

context.setActionHandler('search', async ({ q }) => {
  const results = await unternet.lookup.query({
    q,
    webpages: { num: 6 },
  });

  context.data = { results: results.webpages };
});
