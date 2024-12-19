import { getTime } from '../utils';

class TimeDisplay extends HTMLElement {
  static observedAttributes = ['time', 'timezone'];
  internalTime = Date.now();
  timezone = '';
  interval = -1;

  connectedCallback() {
    this.render();
    this.interval = window.setInterval(() => {
      this.internalTime += 100;
      this.render();
    }, 100);
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'timezone') {
      this.timezone = newValue;
      this.internalTime = getTime(this.timezone);
      this.render();
    }
  }

  disconnectedCallback() {
    window.clearInterval(this.interval);
  }

  timeToString() {
    function toLocale(num: number) {
      return num.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      });
    }
    return `${toLocale(new Date(this.internalTime).getHours())}:${toLocale(
      new Date(this.internalTime).getMinutes()
    )}:${toLocale(new Date(this.internalTime).getSeconds())}`;
  }

  render() {
    this.innerHTML = /* html */ `
            <style>
          time-display {
            width: 100%;
            height: 100%;
          }
          time-display > div {
            display: flex;
            flex-grow: 1;
            gap: 30px;
            padding: 0 20px;
            align-items: center;
            justify-content: center;
            width: 100%;
          }
          time-display p {
            font-size: 18px;
            flex-grow: 1;
          }
          strong {
            font-family: monospace;
          }
        </style>
      <div>
        <clock-widget time=${this.internalTime}></clock-widget>
        <p>The current time in ${
          this.timezone
        } is <strong>${this.timeToString()}</strong>.</p>
      </div>
    `;
  }
}

customElements.define('time-display', TimeDisplay);
