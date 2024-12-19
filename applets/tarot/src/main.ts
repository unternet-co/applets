import { applets } from '@web-applets/sdk';

const context = applets.getContext();

context.setActionHandler('draw', async () => {
  const response = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
  const { cards } = await response.json();
  const card = cards[0];

  context.data = {
    name: card.name,
    id: card.name_short,
    meaning: card.meaning_up,
  };
});

context.ondata = () => {
  if (!context.data) return;
  document.body.innerHTML = /*html*/ `
    <div class="tarot-main">
      <img class="image-placeholder" src="/cards/${context.data.id}.jpeg" />
      <div>
        <h1>${context.data.name}</h1>
        <p class="meaning">${context.data.meaning}</p>
      </div>
    </div>
  `;
};
