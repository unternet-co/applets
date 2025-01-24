import { applets } from '@web-applets/sdk';
import { html, render } from 'lit';

const applet = applets.getContext();
applet.data = [];

applet.setActionHandler('addtodos', ({ todos }) => {
  applet.data = todos.map((x) => ({
    checked: false,
    name: x,
  }));
});

function toggle(index: number) {
  const newState = [...applet.data];
  newState[index].checked = !newState[index].checked;
  applet.data = newState;
}

function addTodo(event: Event) {
  event.preventDefault();
  const input = document.getElementById('new-todo') as HTMLInputElement;
  const newTodoName = input.value.trim();
  if (newTodoName) {
    applet.data = [...applet.data, { checked: false, name: newTodoName }];
    input.value = '';
  }
}

function deleteTodo(index: number) {
  const newState = [...applet.data];
  newState.splice(index, 1);
  applet.data = newState;
}

applet.ondata = () => {
  const template = html`
    ${applet.data.map((todo, index) => {
      return html`
        <div class="todo">
          <input
            type="checkbox"
            ?checked=${todo.checked}
            @click=${() => toggle(index)}
          />
          <div class="label">${todo.name}</div>
          <button class="delete-icon" @click=${() => deleteTodo(index)}>
            🗑️
          </button>
        </div>
      `;
    })}
    <form @submit=${addTodo} autocomplete="off">
      <input id="new-todo" type="text" placeholder="+ Add a new todo" />
    </form>
  `;

  render(template, document.body);
};
