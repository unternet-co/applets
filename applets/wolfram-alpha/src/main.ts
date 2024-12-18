import { applets } from "@web-applets/sdk";
import { WolframAlphaPod } from "./types";

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
  const fragment = document.createDocumentFragment();

  // Every result from Wolfram Alpha comes with a set of pods, which represent different categories of information related to the query. Each pod has a title and a set of subpods.
  // By default, it only shows the subpods that contain images as results.

  event.data.result.queryresult.pods.forEach((pod: WolframAlphaPod) => {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.textContent = pod.title;
    section.appendChild(h2);

    pod.subpods.forEach((subpod) => {
      if (subpod.img) {
        const img = document.createElement("img");
        img.src = subpod.img.src;
        img.alt = subpod.img.alt;
        img.width = parseInt(subpod.img.width);
        img.height = parseInt(subpod.img.height);
        section.appendChild(img);
      }
    });

    fragment.appendChild(section);
  });

  // Update the document body in a single operation
  document.body.replaceChildren(fragment);
};
