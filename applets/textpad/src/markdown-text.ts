import { marked } from 'marked';

class MarkdownText extends HTMLElement {
  observer?: MutationObserver;
  markdown: string = '';

  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    this.observer = new MutationObserver(this.renderMarkdown.bind(this));
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    this.render();
    this.renderMarkdown();
  }

  disconnectedCallback() {
    this.observer!.disconnect();
  }

  render() {
    this.shadowRoot!.innerHTML = /*html*/ `
      <style>${this.styles}</style>
      <div class="content">${this.markdown}</div>
      <div class="slot-container"><slot></slot></div>
    `;
  }

  async renderMarkdown() {
    const slot = this.shadowRoot!.querySelector('slot');
    const slottedNodes = slot?.assignedNodes({ flatten: true });

    let content = slottedNodes
      ?.map((node) => node.textContent)
      .join('')
      .trim();

    if (!content) return;
    content = content.trim();
    content = await marked.parse(content, { gfm: true, breaks: true });
    this.markdown = content;

    this.render();
  }

  get styles() {
    return /*css*/ `
    :host {
      --color-code-background: var(--color-neutral-7);
      line-height: 1.5em;
    }
      .slot-container {
        display: none;
      }

      p:first-child {
        margin-top: 0;
        padding-top: 0;
      }

      p:last-child,
      p:only-child {
        margin-bottom: 0;
        padding-bottom: 0;
      }

    pre {
      background: var(--color-code-background);
      color: var(--color-code-text);
      padding: var(--spacing-3);
      border-radius: var(--rounded-1);
    }

    ul, ol {
      padding: 0;
      margin: 0;
      margin-left: 20px;
    }

    li {
      margin-bottom: 3px;
    }

    code,
    p > code,
    li > code {
      font-size: small;
      font-family: monospace;
      padding: 1px 3px;
      border-radius: var(--rounded-1);
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.2em;
    }

    a {
      border-radius: var(--rounded-1);
      font-weight: 500;
      text-decoration: underline;
      color: var(--color-neutral-3)
    }

    a:hover {
      color: var(--color-neutral-4)
    }
    `;
  }
}

customElements.define('markdown-text', MarkdownText);
