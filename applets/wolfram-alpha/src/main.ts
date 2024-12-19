import { applets } from "@web-applets/sdk";
import { WolframAlphaPod } from "./types";

const context = applets.getContext();
const appId = import.meta.env.VITE_WOLFRAM_ALPHA_APP_ID;

context.setActionHandler("get_knowledge", async ({ query }) => {
  // Wolfram Alpha API
  const response = await fetch(`/api/wolfram/v2/query?appid=${appId}&input=${encodeURIComponent(query)}&output=json`);
  const data = await response.json();

  const filteredData = filterDataWolframAlpha(data);

  // Final data for the context
  context.data = { result: filteredData };
});

context.ondata = (event) => {
  const fragment = document.createDocumentFragment();

  // Every result from Wolfram Alpha comes with a set of pods, which represent different categories of information related to the query. Each pod has a title and a set of subpods.
  // By default, it only shows the subpods that contain images as results.

  event.data.result.pods.forEach((pod: WolframAlphaPod) => {
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

/**
 * Filters the data from Wolfram Alpha API response to only include pods with subpods that have images.
 * @TODO Check if there is a package with the Wolfram Alpha API types available.
 *
 * @param data The data to filter.
 * @returns The filtered data.
 */
const filterDataWolframAlpha = (data: any) => {
  const { queryresult } = data;

  if (!queryresult?.pods) {
    return { pods: [] };
  }

  return {
    pods: queryresult.pods.map((pod: any) => ({
      title: pod.title,
      subpods: pod.subpods
        .filter((subpod: any) => subpod.img)
        .map((subpod: any) => ({
          img: {
            src: subpod.img.src,
            alt: subpod.img.alt,
            width: subpod.img.width,
            height: subpod.img.height
          }
        }))
    }))
  };
};
