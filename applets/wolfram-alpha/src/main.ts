import { applets } from "@web-applets/sdk";

const context = applets.getContext();
const appId = import.meta.env.VITE_WOLFRAM_ALPHA_APP_ID;

context.setActionHandler("get_knowledge", async ({ query }) => {
  // Wolfram Alpha API
  const response = await fetch(`/api/wolfram/v2/query?appid=${appId}&input=${encodeURIComponent(query)}&output=json`);
  const data = await response.json();

  // Final data for the context
  context.data = { result: data };
});

context.ondata = (event) => {
  // HTML output
  document.body.innerHTML = `<p>${event.data.result.queryresult.pods[1].subpods[0].plaintext}</p>`;
};
