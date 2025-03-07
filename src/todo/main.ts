import { applets } from '@web-applets/sdk';
import { html, render } from 'lit';

const self = applets.register();
self.data = [];

self.setActionHandler('addtodos', ({ todos }) => {
  self.data = todos.map((x) => ({
    checked: false,
    name: x,
  }));
});

self.setActionHandler('completetodos', ({ indices }) => {
  if (!self.data) return;
  self.data = self.data.map((todo, index) => {
    if (indices.includes(index)) todo.checked = true;
    return todo;
  });
});

function toggle(index: number) {
  const newState = [...self.data];
  newState[index].checked = !newState[index].checked;
  self.data = newState;
}

function addTodo(event: Event) {
  event.preventDefault();
  const input = document.getElementById('new-todo') as HTMLInputElement;
  const newTodoName = input.value.trim();
  if (newTodoName) {
    self.data = [...self.data, { checked: false, name: newTodoName }];
    input.value = '';
  }
}

function deleteTodo(index: number) {
  const newState = [...self.data];
  newState.splice(index, 1);
  self.data = newState;
}

self.ondata = () => {
  const template = html`
    ${self.data.map((todo, index) => {
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
