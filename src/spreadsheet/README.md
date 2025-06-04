# Spreadsheet applet

Uses the [Handsontable](https://handsontable.com/) library.

## Actions

- `supply`, render a spreadsheet with the given [options](https://handsontable.com/docs/javascript-data-grid/api/options/). Pass in the required [`data`](https://handsontable.com/docs/javascript-data-grid/api/options/#data) option like so: `{ data: [["colA", "colB"], ["row 2"]] }`

An `insertrow` action exists but is not added to the manifest (see other json file in `public` dir for the action). Reason being that the model we've tried couldn't work with the spreadsheet properly when we enabled this. When asking to render data it called that action even though it wasn't necessary; and vice versa, when asked to insert rows it would often call `supply` as well afterwards (not needed either). Seems to work much better when just working with `supply` directly.

## Formulae

See the list of [available formulae](https://hyperformula.handsontable.com/guide/built-in-functions.html#overview). The version we use here is `v3.0`. In case the documentation has updated and you can't select the older version, you can see the older docs [here](https://github.com/handsontable/hyperformula/blob/3.0.0/docs/guide/built-in-functions.md#overview).
