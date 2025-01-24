import { appletContext } from '@web-applets/sdk';
import { html, render } from 'lit';

const applet = appletContext.connect();
applet.state = [];

applet.setActionHandler('addtodos', ({ todos }) => {
  applet.state = todos.map((x) => ({
    checked: false,
    name: x,
  }));
});

function toggle(index: number) {
  const newState = [...applet.state];
  newState[index].checked = !newState[index].checked;
  applet.state = newState;
}

function addTodo(event: Event) {
  event.preventDefault();
  const input = document.getElementById('new-todo') as HTMLInputElement;
  const newTodoName = input.value.trim();
  if (newTodoName) {
    applet.state = [...applet.state, { checked: false, name: newTodoName }];
    input.value = '';
  }
}

function deleteTodo(index: number) {
  const newState = [...applet.state];
  newState.splice(index, 1);
  applet.state = newState;
}

applet.onrender = () => {
  const template = html`
    ${applet.state.map((todo, index) => {
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
