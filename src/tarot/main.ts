import { applets } from '@web-applets/sdk';

const self = applets.register();

self.setActionHandler('draw', async () => {
  const response = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
  const { cards } = await response.json();
  const card = cards[0];

  self.data = {
    name: card.name,
    id: card.name_short,
    meaning: card.meaning_up,
  };
});

self.ondata = () => {
  if (!self.data) return;
  document.body.innerHTML = /*html*/ `
    <div class="tarot-main">
      <img class="image-placeholder" src="/tarot/cards/${self.data.id}.jpeg" />
      <div>
        <h1>${self.data.name}</h1>
        <p class="meaning">${self.data.meaning}</p>
      </div>
    </div>
  `;
};
