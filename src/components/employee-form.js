import { LitElement, html, css } from "lit";
import { store } from "../state.store.js";
import { t, onLangChange } from "../utils/i18n.js";
import {
  isRequired,
  isEmail,
  isPhone,
  isDate,
  notFuture,
  before,
} from "../utils/validators.js";
import "./confirm-dialog.js";

export class EmployeeFormView extends LitElement {
  static properties = {
    employeeId: { type: String },
    mode: { type: String }, // 'create' | 'edit'
    model: { state: true },
    errors: { state: true },
    employee: { type: Object, attribute: false },
    fixedFullName: { state: true },
  };

  static styles = css`
    :host {
      --page-bg: #f6f7f9;
      --card-bg: #ffffff;
      --ink: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --primary: #ff6b00;
      --primary-700: #e35f00;
      --accent: #595adf;
      display: block;
      color: var(--ink);
    }
    .wrap {
      background: var(--page-bg);
      padding: 24px;
      min-height: calc(100vh - 64px);
    }
    .inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .breadcrumbs {
      color: var(--muted);
      font-size: 14px;
      margin-bottom: 36px;
      margin-top: 0;
    }
    .page-title {
      font-size: 24px;
      font-weight: 400;
      color: var(--primary);
      margin: 0 0 36px 0;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: 0 10px 24px rgba(16, 24, 40, 0.06);
      padding: 28px 32px 36px;
    }

    .form-grid {
      --field-width: 300px;
      display: grid;
      grid-template-columns: repeat(3, var(--field-width));
      justify-content: center;
      gap: 28px 56px;
    }
    .form-grid > * {
      min-width: 0;
    }
    input,
    select {
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 1100px) {
      .form-grid {
        grid-template-columns: repeat(2, var(--field-width));
      }
    }
    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: min(100%, var(--field-width));
        justify-content: center;
        gap: 20px;
      }
    }

    label {
      display: block;
    }
    label > div {
      font-size: 13px;
      color: var(--muted);
      margin: 0 0 6px;
    }

    input,
    select {
      height: 40px;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0 12px;
      font: inherit;
      color: var(--ink);
      background: #fff;
      outline: none;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    input:focus,
    select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(89, 90, 223, 0.15);
    }

    input[type="date"] {
      padding-right: 36px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>');
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 18px 18px;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
      opacity: 0;
      cursor: pointer;
    }

    select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      padding-right: 36px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>');
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 16px 16px;
    }

    .form-error {
      color: #b91c1c;
      font-size: 12px;
      margin-top: 6px;
    }

    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 10px;
    }
    .btn {
      height: 36px;
      padding: 0 28px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: 0;
      width: 200px;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--primary-700);
    }
    .btn-outline {
      background: #fff;
      color: var(--accent);
      border: 1.5px solid var(--accent);
    }
    .btn-outline:hover {
      box-shadow: 0 0 0 3px rgba(89, 90, 223, 0.12);
    }
  `;

  constructor() {
    super();
    this.employeeId = null;
    this.mode = "create";
    this.model = this.blank();
    this.errors = {};
    this.employee = null;
    this._unsub = onLangChange(() => this.requestUpdate());
    this.fixedFullName = "";
  }
  _setFixedFullNameFrom(m) {
    const f = (m.firstName || "").trim();
    const l = (m.lastName || "").trim();
    this.fixedFullName = [f, l].filter(Boolean).join(" ");
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsub && this._unsub();
  }

  connectedCallback() {
    super.connectedCallback();
    this._applyRouteFromLocation();
  }
  _applyRouteFromLocation() {
    const path = window.location.pathname;
    const m = path.match(/^\/employees\/([^/]+)\/edit\/?$/);
    if (m) {
      this.mode = "edit";
      this.employeeId = decodeURIComponent(m[1]);
    } else if (path.endsWith("/employees/new")) {
      this.mode = "create";
      this.employeeId = null;
    } else if (history.state?.mode === "edit") {
      this.mode = "edit";
      if (history.state.id) this.employeeId = history.state.id;
    }
  }

  updated(changed) {
    if (changed.has("employee") && this.employee) {
      this.mode = "edit";
      this.employeeId = this.employee.id ?? this.employeeId;
      this.model = { ...this.employee };
    }
    if (
      (changed.has("mode") || changed.has("employeeId")) &&
      this.mode === "edit" &&
      this.employeeId
    ) {
      this.loadIfNeeded();
    }
  }

  blank() {
    return {
      firstName: "",
      lastName: "",
      dateOfEmployment: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      department: "",
      position: "",
    };
  }

  loadIfNeeded() {
    if (this.mode === "edit" && this.employeeId && !this.employee) {
      const found = store.getById(this.employeeId);
      if (found) {
        this.model = {
          ...found,
          phone: this._normalizePhoneForStore(found.phone),
        };
        this._setFixedFullNameFrom(found);
      }
    }
  }

  updated(changed) {
    if (changed.has("employee") && this.employee) {
      this.mode = "edit";
      this.employeeId = this.employee.id ?? this.employeeId;
      this.model = {
        ...this.employee,
        phone: this._normalizePhoneForStore(this.employee.phone),
      };
      this._setFixedFullNameFrom(this.employee);
    }
    if (
      (changed.has("mode") || changed.has("employeeId")) &&
      this.mode === "edit" &&
      this.employeeId
    ) {
      this.loadIfNeeded();
    }
  }

  firstUpdated() {
    this.loadIfNeeded();
  }

  validate() {
    const m = this.model,
      e = {};
    if (!isRequired(m.firstName)) e.firstName = t("required");
    if (!isRequired(m.lastName)) e.lastName = t("required");
    if (!isDate(m.dateOfEmployment)) e.dateOfEmployment = t("invalidDate");
    if (!isDate(m.dateOfBirth)) e.dateOfBirth = t("invalidDate");
    if (isDate(m.dateOfBirth) && !notFuture(m.dateOfBirth))
      e.dateOfBirth = t("dobInFuture");
    if (isDate(m.dateOfEmployment) && !notFuture(m.dateOfEmployment))
      e.dateOfEmployment = t("doeInPast");
    if (
      isDate(m.dateOfBirth) &&
      isDate(m.dateOfEmployment) &&
      !before(m.dateOfBirth, m.dateOfEmployment)
    )
      e.dateOfBirth = t("dobBeforeDoe");
    const phone10 = this._normalizePhoneForStore(m.phone);
    if (phone10.length !== 10) e.phone = t("invalidPhone");
    if (!isEmail(m.email)) e.email = t("invalidEmail");
    if (!store.isEmailUnique(m.email, this.employeeId))
      e.email = t("emailNotUnique");
    if (!isRequired(m.department)) e.department = t("required");
    if (!isRequired(m.position)) e.position = t("required");
    this.errors = e;
    return Object.keys(e).length === 0;
  }

  updateField(field, value) {
    console.log("updateField",field, value);
    
    this.model = { ...this.model, [field]: value };
  }
  _formatPhoneDisplay(d10) {
    return d10 ? `+(90) ${d10}` : "";
  }
  _normalizePhoneForStore(val) {
    const digits = (val || "").replace(/\D+/g, "");
    if (digits.startsWith("90") && digits.length >= 12)
      return digits.slice(-10);
    if (digits.length > 10) return digits.slice(-10);
    return digits;
  }
  _handlePhoneInput = (e) => {
    const digits = this._normalizePhoneForStore(e.target.value);
    this.updateField("phone", digits);
    e.target.value = this._formatPhoneDisplay(digits);
  };

  async submit() {
    if (!this.validate()) return;
    if (this.mode === "edit") {
      const payload = {
        ...this.model,
        phone: this._normalizePhoneForStore(this.model.phone),
      };

      store.update(this.employeeId, payload);
    } else {
      store.add({ ...this.model });
    }
    window.history.pushState({}, "", "/employees");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  cancel() {
    window.history.back();
  }

  _toISO(str) {
    if (!str) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const m = str.match(/^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})$/);
    if (!m) return "";

    let a = parseInt(m[1], 10);
    let b = parseInt(m[2], 10);
    let c = parseInt(m[3], 10);

    if (String(a).length === 4) {
      const yyyy = a,
        mm = String(b).padStart(2, "0"),
        dd = String(c).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    const yyyy = c;
    let month, day;

    if (a > 12 && b <= 12) {
      day = a;
      month = b;
    }
    else if (b > 12 && a <= 12) {
      month = a;
      day = b;
    }
    else {
      const sepIsDash = str.includes("-");
      if (sepIsDash) {
        day = a;
        month = b;
      } else {
        month = a;
        day = b;
      }
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) return "";
    return `${yyyy}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }
  _handleInput(field, type, e) {
    const raw = e.target.value || "";
    if (type === "date") {
      if (!raw) {
        console.log("empty date");
        
        this.updateField(field, "");
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return; 
      this.updateField(field, raw);
      return;
    }
    this.updateField(field, raw);
  }

  field(labelKey, field, type = "text", opts = {}) {
    const val = this.model[field] || "";
    const err = this.errors[field];
    const displayVal = type === "date" ? this._toISO(val) : val;

    return html`
      <label class="${opts.full ? "full" : ""}">
        <div>${t(labelKey)}</div>
        <input
          type=${type}
          placeholder="${opts.placeholder || ""}"
          .value=${displayVal}
          @input=${(e) =>
            type === "date" ? null : this._handleInput(field, type, e)}
          @change=${(e) => this._handleInput(field, type, e)}
          ?required=${opts.required}
        />
        ${err ? html`<div class="form-error">${err}</div>` : ""}
      </label>
    `;
  }

  render() {
    const isEdit = this.mode === "edit";
    const heading = isEdit ? t("editEmployee") : t("addEmployee");
    const firstName = this.model.firstName || "";
    const lastName = this.model.lastName || "";
    return html`
      <div class="wrap">
        <div class="inner">
          <h1 class="page-title">${heading}</h1>
          <div class="card">
            ${isEdit && (this.model.firstName || this.model.lastName)
              ? html`
                  <p class="breadcrumbs">
                    ${t("youAreEditing")} ${this.fixedFullName}
                  </p>
                `
              : ""}
            <div class="form-grid">
              ${this.field("firstName", "firstName", "text", {
                placeholder: "Ahmet",
                required: true,
              })}
              ${this.field("lastName", "lastName", "text", {
                placeholder: "Sourtimes",
                required: true,
              })}
              ${this.field("dateOfEmployment", "dateOfEmployment", "date", {
                required: true,
              })}
              ${this.field("dateOfBirth", "dateOfBirth", "date", {
                required: true,
              })}
              ${this.field("phoneNumber", "phone", "tel", {
                placeholder: "532 123 45 67",
                required: true,
              })}
              ${this.field("emailAddress", "email", "email", {
                placeholder: "ahmet@sourtimes.org",
                required: true,
              })}

              <label>
                <div>${t("department")}</div>
                <select
                  .value=${this.model.department}
                  @change=${(e) =>
                    this.updateField("department", e.target.value)}
                  required
                >
                  <option value="">Please Select</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Tech">Tech</option>
                </select>
                ${this.errors.department
                  ? html`<div class="form-error">
                      ${this.errors.department}
                    </div>`
                  : ""}
              </label>

              <label>
                <div>${t("position")}</div>
                <select
                  .value=${this.model.position}
                  @change=${(e) => this.updateField("position", e.target.value)}
                  required
                >
                  <!-- Order per spec -->
                  <option value="">Please Select</option>
                  <option value="Junior">Junior</option>
                  <option value="Medior">Medior</option>
                  <option value="Senior">Senior</option>
                </select>
                ${this.errors.position
                  ? html`<div class="form-error">${this.errors.position}</div>`
                  : ""}
              </label>

              <div class="form-actions">
                <button class="btn btn-primary" @click=${this.submit}>
                  ${t("save")}
                </button>
                <button class="btn btn-outline" @click=${this.cancel}>
                  ${t("cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <confirm-dialog id="confirm"></confirm-dialog>
    `;
  }
}
customElements.define("employee-form-view", EmployeeFormView);
