import { applets } from "@web-applets/sdk";

const context = applets.getContext();

context.setActionHandler("get_knowledge", async ({ query }) => {
  // Wolfram Alpha short answer API (provides text)
  // https://products.wolframalpha.com/short-answers-api/documentation
  const response = await fetch(`https://api.unternet.co/lookup/v1/query`, {
    method: "POST",
    body: JSON.stringify({
      q: query,
      wolfram: true
    })
  });

  const { wolfram } = await response.json();

  // Final data for the context
  context.data = { answer: wolfram.answer };
});
