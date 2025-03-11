import { applets } from '@web-applets/sdk';
import Unternet, { type WebPage } from '@unternet/sdk';

const self = applets.register();
const unternet = new Unternet({ isDev: false });

self.setActionHandler('search', search);

document.querySelector('form')!.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector(
    'input[type="text"]'
  ) as HTMLInputElement;
  const q = input.value;
  console.log(q);
  input.value = '';
  search({ q });
});

async function search({ q }) {
  const results = await unternet.lookup.query({
    q,
    webpages: { num: 6 },
  });

  self.data = { results: results.webpages };
}

self.ondata = () => {
  if (!self.data.results) return;
  const results = self.data.results.map((page: WebPage) => {
    return /*html*/ `<li>
      <h3><a href="${page.url}">${page.title}</a></h3>
      <p>${page.description}</p>
    </li>`;
  });
  document.getElementById('results')!.innerHTML = results.join('\n');
};
