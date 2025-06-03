import Handsontable from "handsontable";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";

import { HyperFormula } from "hyperformula";
import { applets } from "@web-applets/sdk";

// REGISTER

const scope = applets.register();

scope.data = [];

// ACTIONS

scope.setActionHandler("render", (props: Handsontable.GridSettings) => {
  scope.data = props.data;
  render(props);
});

// UI

let hot: Handsontable | undefined;

const hyperformulaInstance = HyperFormula.buildEmpty({
  licenseKey: "internal-use-in-handsontable",
});

// Render empty grid
render({ data: [[""]] });

function render(props: Handsontable.GridSettings) {
  const container = document.getElementById("root");
  if (!container) return;
  if (hot) hot.destroy();

  hot = new Handsontable(container, {
    formulas: { engine: hyperformulaInstance },
    height: "auto",
    licenseKey: "non-commercial-and-evaluation",

    allowInsertColumn: true,
    allowInsertRow: true,
    colHeaders: true,
    contextMenu: true,
    customBorders: true,
    dropdownMenu: true,
    filters: true,
    multiColumnSorting: true,
    manualRowMove: true,
    minSpareCols: 3,
    minSpareRows: 3,
    rowHeaders: true,

    ...props,
  });
}
