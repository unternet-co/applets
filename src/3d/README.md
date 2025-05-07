```js
import { applets } from '@web-applets/sdk';

const ctx = applets.getContext();

ctx.setActionHandler('generate_scene', ({ html }) => {
  ctx.data = { html };
});

ctx.ondata = () => {
  document.body.innerHTML = ctx.data.html;
};
```

```json
{
  "name": "3D Generator",
  "short_name": "3D",
  "description": "Create & interact with 3D worlds using A-Frame.",
    "icons": [
    {
      "src": "/icon.png"
    }
  ]
  "actions": [
    {
      "id": "generate_scene",
      "description": "Generate a 3D scene.",
      "parameters": {
        "type": "object",
        "properties": {
          "html": {
            "type": "string",
            "description": "A string of valid A-Frame code, which describes the scene requested by the user."
          }
        },
        "required": ["html"]
      }
    }
  ]
}
```
