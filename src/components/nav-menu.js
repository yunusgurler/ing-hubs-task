import { LitElement, html, css } from "lit";
import { t, setLanguage, language, onLangChange } from "../utils/i18n.js";

export class NavMenu extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    nav.header {
      width: 100%;
      background: #fff;
    }

    .header-inner {
      max-width: 100%;
      margin: 0 auto;
      padding: 10px 8px;
      display: flex;
      align-items: center;
    }

    .left.brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 400;
      color: black;
      cursor: pointer;
      padding: 4px 8px;
    }
    .left.brand .icon {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .links {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    a {
      text-decoration: none;
      color: var(--primary);
    }
    .active {
      background: rgba(255, 98, 0, 0.08);
    }
    .right button {
      white-space: nowrap;
    }
    .button-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .add-button {
      color: var(--primary);
      border: none;
      background: transparent;
      cursor: pointer;
      padding-left: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
    }
    .add-button:hover {
      background: lightgray;
      border-radius: 4px;
    }
    .lang-select {
      position: relative;
    }
    .lang-select select {
      appearance: none;
      background: #fff;
      border: none;
      padding: 8px 28px 8px 10px;
      line-height: 1;
      cursor: pointer;
    }
    .lang-select::after {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #64748b;
      font-size: 12px;
    }
    .lang-option {
      height: 333px;
      width: 333px;
    }
    .employees-anchor {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 4px 8px;
    }
    .employees-anchor:hover {
      background: lightgray;
      border-radius: 4px;
    }
  `;

  constructor() {
    super();
    this._unsubI18n = onLangChange(() => this.requestUpdate());
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n && this._unsubI18n();
  }

  navigateToCreate() {
    window.history.pushState({}, "", `/employees/new`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  navigateToHome() {
    window.history.pushState({}, "", `/employees`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  render() {
    const lang = language();
    return html`
      <nav class="header">
        <div class="header-inner">
          <div
            class="left brand"
            aria-label="ING"
            @click=${this.navigateToHome}
          >
            <img
              src="https://assets.ing.com/m/12613c640164961e/original/ING_Identifier_FC.png"
              alt="ING logo"
              width="36"
              height="36"
            />
            <span>ING</span>
          </div>
          <div class="links">
            <a class="employees-anchor" href="/employees">
              <img
                class="icon"
                src="./assets/support.png"
                alt=""
                width="16"
                height="16"
              />
              ${t("employees")}
            </a>
          </div>

          <div class="right">
            <button
              class="add-button"
              type="button"
              @click=${this.navigateToCreate}
            >
              <img
                class="icon"
                src="./assets/plus.png"
                alt=""
                width="12"
                height="12"
              />
              ${t("addNew")}
            </button>

            <label class="lang-select" aria-label="Language">
              <select
                @change=${(e) => setLanguage(e.target.value)}
                .value=${lang}
                aria-label="Language"
              >
                <option value="en">🇬🇧</option>
                <option value="tr">🇹🇷</option>
              </select>
            </label>
          </div>
        </div>
      </nav>
    `;
  }
}
customElements.define("nav-menu", NavMenu);
