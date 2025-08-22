import { LitElement, html, css, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { t } from "../utils/i18n.js";
export class ConfirmDialog extends LitElement {
  static properties = {
    open: { type: Boolean, state: true },
    title: { type: String, state: true },
    message: { type: String, state: true },
    confirmText: { type: String, state: true },
    cancelText: { type: String, state: true },
    _resolver: { state: false },
  };

  static styles = css`
    :host {
      --primary: #ff6b00;
      --ink: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 39, 0.45);
      backdrop-filter: blur(2px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      padding: 16px;
      padding-right: 32px
    }

    .dialog {
      width: 400px;
      max-width: 100%;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 2px;
      box-shadow: 0 18px 48px rgba(16, 24, 40, 0.18);
      overflow: hidden;
      color: var(--ink);
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 6px 16px;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      margin: 0;
    }
    .close {
      border: 0;
      background: transparent;
      cursor: pointer;
      color: var(--primary);
      font-size: 20px;
      line-height: 1;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }
    .close:hover {
      background: rgba(255, 107, 0, 0.08);
    }

    .body {
      padding: 6px 16px 14px 16px;
      color: var(--muted);
      font-size: 14px;
    }

    .actions {
      display: grid;
      gap: 10px;
      padding: 10px 16px 16px 16px;
    }
    .btn {
      height: 36px;
      border-radius: 8px;
      font-weight: 700;
      border: 0;
      cursor: pointer;
      width: 100%;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover {
      filter: brightness(0.95);
    }
    .btn-outline {
      background: #fff;
      color: #595adf;
      border: 1.5px solid #595adf;
    }
    .btn-outline:hover {
      box-shadow: 0 0 0 3px rgba(89, 90, 223, 0.12);
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.title = "Are you sure?";
    this.message = "";
    this.confirmText = t('proceed');
    this.cancelText = t("cancel");
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    window.removeEventListener("keydown", this._onKey);
    super.disconnectedCallback();
  }

  show({ title, message, confirmText, cancelText } = {}) {
    if (title) this.title = title;
    if (message) this.message = message;
    if (confirmText) this.confirmText = confirmText;
    if (cancelText) this.cancelText = cancelText;
    this.open = true;
    return new Promise((resolve) => (this._resolver = resolve));
  }

  _confirm() {
    this.open = false;
    this._resolver?.(true);
  }
  _cancel() {
    this.open = false;
    this._resolver?.(false);
  }
  _onKey(e) {
    if (this.open && e.key === "Escape") this._cancel();
  }
  _overlayClick(e) {
    if (e.target.classList.contains("backdrop")) this._cancel();
  }

  firstUpdated() {
    this.updateComplete.then(() =>
      this.renderRoot.querySelector(".btn-primary")?.focus()
    );
  }

  render() {
    if (!this.open) return nothing;
    return html`
      <div
        class="backdrop"
        role="dialog"
        aria-modal="true"
        @click=${this._overlayClick}
      >
        <div class="dialog">
          <div class="head">
            <h3 class="title">${this.title}</h3>
            <button class="close" @click=${this._cancel} aria-label="Close">
              ×
            </button>
          </div>
          <div class="body">${unsafeHTML(this.message)}</div>
          <div class="actions">
            <button class="btn btn-primary" @click=${this._confirm}>
              ${this.confirmText}
            </button>
            <button class="btn btn-outline" @click=${this._cancel}>
              ${this.cancelText}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("confirm-dialog", ConfirmDialog);
