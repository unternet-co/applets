const face = './assets/clock-face.svg';
const hours = './assets/clock-hours.svg';
const minutes = './assets/clock-minutes.svg';
const seconds = './assets/clock-seconds.svg';
const pin = './assets/clock-pin.svg';

class ClockWidget extends HTMLElement {
  size = '190px';
  time = Date.now();
  internalTime = Date.now();
  ticking = false;
  interval = -1;

  static observedAttributes = ['size', 'time', 'ticking'];

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'ticking') {
      // if (typeof newValue === 'string')
      //   this.interval = window.setInterval(() => {
      //     this.internalTime += 100;
      //     this.render();
      //   }, 100);
    } else {
      window.clearInterval(this.interval);
    }

    if (name === 'time') {
      this.time = this.internalTime = parseInt(newValue);
      this.render();
    }
  }

  getSeconds() {
    return (
      new Date(this.internalTime).getSeconds() +
      new Date(this.internalTime).getMilliseconds() / 1000
    );
  }

  getMinutes() {
    return new Date(this.internalTime).getMinutes();
  }

  getHours() {
    return new Date(this.internalTime).getHours();
  }

  render() {
    this.innerHTML = /* html*/ `
      <style>
        clock-widget {
          --size: ${this.size};
          position: relative;
          height: var(--size);
          width: var(--size);
          display: block;
        }

        .clock-element {
          position: absolute;
          height: var(--size);
          width: var(--size);
          top: 0;
          left: 0;
          transform: rotate(0deg);
          transition: transform 1s linear;
        }
      </style>
      
      <img src="${face}" class="clock-element" />
      <img src="${seconds}" class="clock-element" style="transform: rotate(${
      (360 * this.getSeconds()) / 60
    }deg)" />
      <img src="${minutes}" class="clock-element" style="transform: rotate(${
      (360 * this.getMinutes()) / 60
    }deg)" />
      <img src="${hours}" class="clock-element" style="transform: rotate(${
      (360 * this.getHours()) / 12
    }deg)" />
      <img src="${pin}" class="clock-element" />
    `;
  }
}

customElements.define('clock-widget', ClockWidget);
