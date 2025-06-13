import Handsontable from "handsontable";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";

import { HyperFormula } from "hyperformula";
import { applets } from "@web-applets/sdk";

// UI

let hot: Handsontable | undefined;

const hyperformulaInstance = HyperFormula.buildEmpty({
  licenseKey: "internal-use-in-handsontable",
});

function render(props: Handsontable.GridSettings) {
  if (typeof props !== "object" || !("data" in props)) return;

  const container = document.getElementById("root");
  if (!container) return;
  if (hot) hot.destroy();

  hot = new Handsontable(container, {
    formulas: { engine: hyperformulaInstance },
    height: "auto",
    licenseKey: "non-commercial-and-evaluation",

    allowInsertColumn: true,
    allowInsertRow: true,
    allowRemoveColumn: true,
    allowRemoveRow: true,
    colHeaders: true,
    columnSorting: true,
    contextMenu: true,
    customBorders: true,
    // dropdownMenu: true,
    filters: true,
    manualRowMove: true,
    // minSpareCols: 3,
    // minSpareRows: 3,
    rowHeaders: true,

    numericFormat: {
      pattern: "0,00",
      culture: "en-US",
    },

    ...props,
    data: props.data?.length === 0 ? [[""]] : props.data,
  });
}

// REGISTER

render({ data: [] });

const scope = applets.register<Handsontable.GridSettings>();

scope.data = {
  data: [],
};

scope.ondata = (event) => {
  render(event.data);
};

// ACTIONS

scope.setActionHandler("insertrow", ({ amount, index }: { amount?: number; index?: number }) => {
  const action = index === 0 ? "insert_row_above" : "insert_row_below";

  hot?.alter(action, index !== undefined ? Math.max(index - 1, 0) : undefined, amount || 1);
});

scope.setActionHandler("supply", (props: Handsontable.GridSettings) => {
  scope.data = { ...props };
});
