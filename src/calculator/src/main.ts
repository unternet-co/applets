import { applets } from '@web-applets/sdk';

const context = applets.getContext();

context.setActionHandler('calculate', ({ expr }) => {
  context.data = { expr };
  const answer = eval(expr);
  context.data = { expr, answer };
});

context.ondata = () => {
  document.body.innerHTML = `
    <div class="expression">${context.data.expr}</div>
    <div class="answer">${context.data.answer}</div>
  `;
};
