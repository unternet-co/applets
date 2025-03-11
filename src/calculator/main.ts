import { applets } from '@web-applets/sdk';

const self = applets.register();

self.data = {
  expr: '=',
  answer: '0',
};

self.setActionHandler('calculate', ({ expr }) => {
  self.data = { expr };
  const answer = eval(expr);
  self.data = { expr, answer };
});

self.ondata = () => {
  document.body.innerHTML = `
    <div class="expression">${self.data.expr}</div>
    <div class="answer">${self.data.answer}</div>
  `;
};
