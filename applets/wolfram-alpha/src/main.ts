import { applets, AppletDataEvent } from "@web-applets/sdk";
import { WolframAlphaPod } from "./types";

const context = applets.getContext();
const appIds = {
  simple: import.meta.env.VITE_WOLFRAM_SIMPLE_KEY,
  short_answers: import.meta.env.VITE_WOLFRAM_SHORT_ANSWER_KEY
};

const baseUrl = "http://api.wolframalpha.com/v1";

context.setActionHandler("get_knowledge", async ({ query }) => {
  // Wolfram Alpha short answer API (provides text)
  // https://products.wolframalpha.com/short-answers-api/documentation
  const textResponse = await fetch(
    `https://corsproxy.io/?${baseUrl}/result?appid=${appIds.short_answers}&i=${encodeURIComponent(query)}`
  );
  const text = await textResponse.text();

  // Wolfram Alpha simple answer API (provides an image of the result)
  // https://products.wolframalpha.com/simple-api/documentation
  const simpleResponse = await fetch(
    `https://corsproxy.io/?${baseUrl}/simple?appid=${appIds.simple}&i=${encodeURIComponent(query)}`
  );
  const imageData = await simpleResponse.arrayBuffer();

  const imageHtml = gifDataToHtmlString(imageData);

  // Final data for the context
  context.data = { text, imageHtml };
});

function gifDataToHtmlString(buffer: ArrayBuffer) {
  // Convert binary data to base64
  const base64String = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

  // Create the image source URL
  const gifUrl = `data:image/gif;base64,${base64String}`;

  // Return HTML string
  return `<img src="${gifUrl}">`;
}

context.ondata = () => {
  document.body.innerHTML = context.data.imageHtml ?? "";
};
