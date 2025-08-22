import { LitElement, html, css } from "lit";
import { store } from "../state.store.js";
import { t, onLangChange } from "../utils/i18n.js";
import "./confirm-dialog.js";

function paginate(totalPages, current) {
  const range = [];
  const add = (x) => range.push(x);
  const window = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= current - window && p <= current + window)
    )
      add(p);
    else if (range[range.length - 1] !== "…") add("…");
  }
  return range;
}

function paginateMobile(totalPages, current) {
  if (totalPages <= 1) return [1];
  const out = [];
  if (current - 1 >= 1) out.push(current - 1);
  out.push(current);
  if (current + 1 <= totalPages) out.push(current + 1);
  return out;
}

export class EmployeeListView extends LitElement {
  static properties = {
    q: { type: String },
    page: { type: Number },
    perPage: { type: Number },
    mode: { type: String }, // 'table' | 'list'
    data: { state: true },
    _forceTable: { state: true },
    selectedIds: { state: true },
    _isMobile: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .headerContainer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 36px;
    }
    @media (max-width: 640px) {
      .headerContainer {
        margin: 16px;
      }
    }

    .page-title {
      font-size: 1.2em;
      font-weight: 600;
      color: var(--primary);
    }

    .segment {
      display: inline-flex;
      gap: 8px;
    }
    .seg-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: 0;
      cursor: pointer;
    }
    .seg-btn img {
      width: 20px;
      height: 20px;
      display: block;
    }
    .seg-btn:not(.active) img {
      opacity: 0.65;
      filter: grayscale(1) brightness(0.9);
    }
    .seg-btn[disabled] {
      opacity: 0.35;
      cursor: not-allowed;
      pointer-events: none;
    }
    .seg-btn[data-tip]::after {
      content: attr(data-tip);
      position: absolute;
      top: -80%;
      left: 50%;
      transform: translateX(-50%);
      background: #111827;
      color: #fff;
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s, transform 0.15s;
    }
    .seg-btn:hover::after,
    .seg-btn:focus-visible::after {
      opacity: 1;
      transform: translateX(-50%) translateY(2px);
    }
    .tableGrid {
      margin: 24px 36px;
      display: grid;
      grid-template-columns: repeat(2, minmax(420px, 1fr));
      gap: 36px 48px;
    }
    @media (max-width: 1100px) {
      .tableGrid {
        grid-template-columns: 1fr;
        margin: 16px;
      }
    }

    .emp-card {
      background: #fff;
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 6px;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.04);
      padding: 22px 24px 18px;
      width: 80%;
      max-width: 475px;
      margin: auto;
    }

    .kv-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 48px;
      row-gap: 18px;
    }
    @media (max-width: 520px) {
      .kv-grid {
        grid-template-columns: 1fr;
        row-gap: 14px;
      }
    }

    .kv .k {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 6px;
    }
    .kv .v {
      font-size: 18px;
      color: #111827;
    }
    .kv .v.muted {
      color: #111827;
    }
    .kv .v.small {
      font-size: 16px;
    }

    .card-actions {
      margin-top: 18px;
      display: flex;
      gap: 14px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 8px;
      border: 0;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.06);
    }
    .btn img {
      width: 14px;
      height: 14px;
      display: block;
      filter: invert(1) brightness(30);
    }
    .btn-edit {
      background: #5b57d4;
    }
    .btn-del {
      background: #f97316;
    }
    .btn:hover {
      opacity: 0.92;
    }
    .listContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 36px;
    }
    .listTable {
      width: 100%;
      background: #fff;
      border: none;
      border-radius: 4px;
      overflow: hidden;
    }
    :host {
      --grid-cols: 44px 160px 160px 160px 160px minmax(150px, 220px)
        minmax(160px, 280px) 140px 120px 84px;
    }
    .listHeader,
    .listRow {
      display: grid;
      grid-template-columns: var(--grid-cols);
      align-items: center;
      column-gap: 16px;
      padding: 18px 24px;
    }
    .listHeader {
      background: #fff;
      border-bottom: 1px solid var(--border);
      color: var(--primary);
      font-weight: 600;
    }
    .listRow {
      border-bottom: 1px solid var(--border);
    }
    .listRow:last-child {
      border-bottom: none;
    }
    .listRow:hover {
      background: #f9fafb;
    }
    .listRow.selected {
      background: #fff7ed;
    }
    .cell {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      font-weight: 400;
    }
    .cell.email {
      color: #6b7280;
      max-width: clamp(16ch, 20vw, 28ch);
    }
    .cell.col-actions {
      display: flex;
      justify-content: flex-end;
      gap: 14px;
    }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--primary);
    }
    .icon-btn {
      background: none;
      border: 0;
      padding: 0;
      margin: 0 0 0 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .icon-btn img {
      width: 18px;
      height: 18px;
      display: block;
    }
    .icon-btn:hover img {
      opacity: 0.8;
    }

    @media (max-width: 1200px) {
      .col-dob {
        display: none;
      }
      :host {
        --grid-cols: 44px 160px 160px 160px minmax(140px, 200px)
          minmax(160px, 260px) 140px 120px 84px;
      }
    }
    @media (max-width: 1024px) {
      .col-phone {
        display: none;
      }
      :host {
        --grid-cols: 44px 160px 160px 160px minmax(160px, 260px) 140px 120px
          84px;
      }
    }
    @media (max-width: 900px) {
      .col-dept {
        display: none;
      }
      :host {
        --grid-cols: 44px 160px 160px 160px minmax(160px, 240px) 120px 84px;
      }
    }
    @media (max-width: 780px) {
      .col-pos {
        display: none;
      }
      :host {
        --grid-cols: 44px 1fr 1fr 140px minmax(160px, 220px) 84px;
      }
    }
    @media (max-width: 640px) {
      .listHeader {
        display: none;
      }
      .listTable {
        border-radius: 8px;
      }
      .listRow {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 16px;
        row-gap: 12px;
        padding: 14px 16px;
      }
      .listRow .cell {
        display: flex;
        flex-direction: column;
        white-space: normal;
        overflow: visible;
        text-overflow: unset;
      }
      .listRow .cell::before {
        content: attr(data-label);
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
      }
      .col-check {
        grid-column: 1 / span 1;
        align-items: center;
        display: flex;
      }
      .col-actions {
        grid-column: 1 / -1;
        justify-content: flex-end;
      }
    }

    .ing-pager-wrap {
      width: 100%;
      display: flex;
      justify-content: center;
      padding: 24px 0 28px;
    }
    .ing-pager {
      display: flex;
      align-items: center;
      gap: 22px;
      line-height: 1;
    }
    @media (max-width: 640px) {
      .ing-pager {
        gap: 12px;
      }
    }

    .ing-pg-arrow {
      border: 0;
      background: transparent;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: var(--primary);
      cursor: pointer;
    }
    .ing-pg-arrow[disabled] {
      color: #cbd5e1;
      cursor: default;
    }

    .ing-pg-num {
      border: 0;
      background: transparent;
      min-width: 28px;
      height: 28px;
      padding: 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      cursor: pointer;
    }
    .ing-pg-num:hover {
      color: #000;
    }
    .ing-pg-num.active {
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      border-radius: 9999px;
    }
    .ing-pg-ellipsis {
      color: #6b7280;
      font-size: 16px;
      padding: 0 2px;
    }

    .search {
      height: 32px;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0 10px;
      font: inherit;
      width: 100%;
      max-width: 400px;
      background: #fff;
    }
    .search:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(89, 90, 223, 0.12);
    }
  `;

  constructor() {
    super();
    this.q = "";
    this.page = 1;
    this.perPage = 5;
    this.mode = "list";
    this.data = store.list();
    this.selectedIds = new Set();
    this._forceTable = false;
    this._mql = null;
    this._mqlMobile = null; 
    this._onMediaChange = null;
    this._onMobileChange = null; 
    this._isMobile =
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 640px)").matches
        : false;

    this._unsubStore = store.subscribe(() => {
      this.data = store.list();
      const ids = new Set(this.data.map((e) => e.id));
      [...this.selectedIds].forEach((id) => {
        if (!ids.has(id)) this.selectedIds.delete(id);
      });
      this.requestUpdate();
    });
    this._unsubLang = onLangChange(() => this.requestUpdate());
  }

  connectedCallback() {
    super.connectedCallback();
    this._mql = window.matchMedia("(max-width: 1579px)");
    this._onMediaChange = (e) => {
      this._forceTable = e.matches;
      this.requestUpdate();
    };
    this._forceTable = this._mql?.matches;
    if (this._mql.addEventListener)
      this._mql.addEventListener("change", this._onMediaChange);
    else this._mql.addListener(this._onMediaChange);

    this._mqlMobile = window.matchMedia("(max-width: 640px)");
    this._onMobileChange = (e) => {
      this._isMobile = e.matches;
      this.requestUpdate();
    };
    if (this._mqlMobile.addEventListener)
      this._mqlMobile.addEventListener("change", this._onMobileChange);
    else this._mqlMobile.addListener(this._onMobileChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubStore && this._unsubStore();
    this._unsubLang && this._unsubLang();
    if (this._mql) {
      if (this._mql.removeEventListener)
        this._mql.removeEventListener("change", this._onMediaChange);
      else this._mql.removeListener(this._onMediaChange);
    }
    if (this._mqlMobile) {
      if (this._mqlMobile.removeEventListener)
        this._mqlMobile.removeEventListener("change", this._onMobileChange);
      else this._mqlMobile.removeListener(this._onMobileChange);
    }
  }

  _toggleOne(id, checked) {
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
    this.requestUpdate();
  }
  _toggleAllFiltered(checked) {
    if (checked) this.filtered.forEach((e) => this.selectedIds.add(e.id));
    else this.selectedIds.clear();
    this.requestUpdate();
  }

  get filtered() {
    const q = (this.q || "").toLowerCase();
    const all = this.data;
    return q
      ? all.filter((e) => {
          const hay = [
            e.firstName,
            e.lastName,
            e.email,
            e.department,
            e.position,
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : all;
  }
  get paged() {
    const start = (this.page - 1) * this.perPage;
    return this.filtered.slice(start, start + this.perPage);
  }
  get pageCount() {
    return Math.max(1, Math.ceil(this.filtered.length / this.perPage));
  }
  setPage(p) {
    this.page = Math.min(this.pageCount, Math.max(1, p));
  }

  navigateToEdit(id) {
    const employee = store.getById(id);
    window.history.pushState(
      { mode: "edit", id, employee },
      "",
      `/employees/${id}/edit`
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  navigateToCreate() {
    window.history.pushState({}, "", `/employees/new`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  async delete(id) {
    const e = store.getById(id);
    const dlg = this.shadowRoot.getElementById("confirm");
    const ok = await dlg.show({
      title: t("areYouSure"),
      message: `${t("selectedEmployeeRecordOf")} <b>${e.firstName} ${
        e.lastName
      }</b> ${t("willBeDeleted")}`,
      confirmText: t("proceed"),
      cancelText: t("cancel"),
    });
    if (ok) {
      store.remove(id);
      this.selectedIds.delete(id);
      if (this.page > this.pageCount) this.page = this.pageCount;
    }
  }

  renderHeader() {
    const viewMode = this._forceTable ? "table" : this.mode;
    return html`
      <div class="headerContainer">
        <h1 class="page-title">${t("employeeList")}</h1>
        <div class="segment" role="tablist" aria-label="View mode">
          <button
            class="seg-btn ${viewMode === "list" ? "active" : ""}"
            @click=${() => {
              if (!this._forceTable) this.mode = "list";
            }}
            data-tip=${t("listView")}
            aria-label=${t("listView")}
            ?disabled=${this._forceTable}
          >
            <img
              style="width:30px;height:30px"
              src="./assets/list.png"
              alt=""
            />
          </button>
          <button
            class="seg-btn ${viewMode === "table" ? "active" : ""}"
            @click=${() => (this.mode = "table")}
            data-tip=${t("tableView")}
            aria-label=${t("tableView")}
          >
            <img src="./assets/table.png" alt="" />
          </button>
        </div>
      </div>
    `;
  }

  renderTable() {
    return html`
      <div class="tableGrid">
        ${this.paged.map(
          (e) => html`
            <div class="emp-card">
              <div class="kv-grid">
                <div class="kv">
                  <div class="k">${t("firstName")}:</div>
                  <div class="v">${e.firstName}</div>
                </div>
                <div class="kv">
                  <div class="k">${t("lastName")}:</div>
                  <div class="v">${e.lastName}</div>
                </div>

                <div class="kv">
                  <div class="k">${t("dateOfEmployment")}:</div>
                  <div class="v small">${e.dateOfEmployment}</div>
                </div>
                <div class="kv">
                  <div class="k">${t("dateOfBirth")}:</div>
                  <div class="v small">${e.dateOfBirth}</div>
                </div>

                <div class="kv">
                  <div class="k">${t("phoneNumber")}:</div>
                  <div class="v small">${e.phone}</div>
                </div>
                <div class="kv">
                  <div class="k">${t("emailAddress")}:</div>
                  <div class="v small muted">${e.email}</div>
                </div>

                <div class="kv">
                  <div class="k">${t("department")}:</div>
                  <div class="v">${e.department}</div>
                </div>
                <div class="kv">
                  <div class="k">${t("position")}:</div>
                  <div class="v">${e.position}</div>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="btn btn-edit"
                  @click=${() => this.navigateToEdit(e.id)}
                >
                  <img src="./assets/edit.png" alt="" /> ${t("edit")}
                </button>
                <button class="btn btn-del" @click=${() => this.delete(e.id)}>
                  <img src="./assets/delete.png" alt="" /> ${t("delete")}
                </button>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  renderList() {
    const filteredIds = this.filtered.map((e) => e.id);
    const totalFiltered = filteredIds.length;
    const selectedFiltered = filteredIds.filter((id) =>
      this.selectedIds.has(id)
    ).length;
    const allSelected = totalFiltered > 0 && selectedFiltered === totalFiltered;
    const someSelected =
      selectedFiltered > 0 && selectedFiltered < totalFiltered;

    this.updateComplete.then(() => {
      const sa = this.shadowRoot?.getElementById("select-all");
      if (sa) sa.indeterminate = someSelected;
    });

    return html`
      <div class="listContainer">
        <div class="listTable">
          <div class="listHeader">
            <div class="cell col-check">
              <input
                id="select-all"
                type="checkbox"
                .checked=${allSelected}
                ?disabled=${totalFiltered === 0}
                @change=${(e) => this._toggleAllFiltered(e.target.checked)}
                aria-label=${t("selectAll")}
              />
            </div>
            <div class="cell col-first title-text">${t("firstName")}</div>
            <div class="cell col-last title-text">${t("lastName")}</div>
            <div class="cell col-doe title-text">${t("dateOfEmployment")}</div>
            <div class="cell col-dob title-text">${t("dateOfBirth")}</div>
            <div class="cell col-phone title-text">${t("phoneNumber")}</div>
            <div class="cell col-email title-text">${t("emailAddress")}</div>
            <div class="cell col-dept title-text">${t("department")}</div>
            <div class="cell col-pos title-text">${t("position")}</div>
            <div class="cell col-actions title-text">${t("actions")}</div>
          </div>

          ${this.paged.map((e) => {
            const isChecked = this.selectedIds.has(e.id);
            return html`
              <div class="listRow ${isChecked ? "selected" : ""}">
                <div class="cell col-check">
                  <input
                    type="checkbox"
                    .checked=${isChecked}
                    @change=${(ev) => this._toggleOne(e.id, ev.target.checked)}
                    aria-label=${t("select")}
                  />
                </div>
                <div class="cell col-first" data-label=${t("firstName")}>
                  ${e.firstName}
                </div>
                <div class="cell col-last" data-label=${t("lastName")}>
                  ${e.lastName}
                </div>
                <div class="cell col-doe" data-label=${t("dateOfEmployment")}>
                  ${e.dateOfEmployment}
                </div>
                <div class="cell col-dob" data-label=${t("dateOfBirth")}>
                  ${e.dateOfBirth}
                </div>
                <div class="cell col-phone" data-label=${t("phoneNumber")}>
                  +(90)${e.phone}
                </div>
                <div
                  class="cell col-email"
                  data-label=${t("emailAddress")}
                  title=${e.email}
                >
                  ${e.email}
                </div>
                <div class="cell col-dept" data-label=${t("department")}>
                  ${e.department}
                </div>
                <div class="cell col-pos" data-label=${t("position")}>
                  ${e.position}
                </div>
                <div class="cell col-actions">
                  <button
                    class="icon-btn"
                    @click=${() => this.navigateToEdit(e.id)}
                  >
                    <img src="./assets/edit.png" alt="${t("edit")}" />
                  </button>
                  <button class="icon-btn" @click=${() => this.delete(e.id)}>
                    <img src="./assets/delete.png" alt="${t("delete")}" />
                  </button>
                </div>
              </div>
            `;
          })}
        </div>
        ${this.filtered.length === 0
          ? html`<p class="muted">${t("empty")}</p>`
          : ""}
      </div>
    `;
  }

  renderSearch() {
    return html`
      <div class="headerContainer">
        <input
          type="search"
          class="search"
          placeholder="${t("searchPlaceholder")}"
          .value=${this.q}
          @input=${(e) => {
            this.q = e.target.value;
            this.page = 1;
          }}
          aria-label=${t("searchPlaceholder")}
        />
      </div>
    `;
  }

  renderPagination() {
    const pages = this._isMobile
      ? paginateMobile(this.pageCount, this.page)
      : paginate(this.pageCount, this.page);

    return html`
      <div class="ing-pager-wrap">
        <div class="ing-pager" role="navigation" aria-label="Pagination">
          <button
            class="ing-pg-arrow"
            ?disabled=${this.page <= 1}
            @click=${() => this.setPage(this.page - 1)}
            aria-label="Previous page"
          >
            ‹
          </button>

          ${pages.map((p) =>
            p === "…"
              ? html`<span class="ing-pg-ellipsis">…</span>`
              : html`<button
                  class="ing-pg-num ${this.page === p ? "active" : ""}"
                  aria-current=${this.page === p && "page"}
                  @click=${() => this.setPage(p)}
                >
                  ${p}
                </button>`
          )}

          <button
            class="ing-pg-arrow"
            ?disabled=${this.page >= this.pageCount}
            @click=${() => this.setPage(this.page + 1)}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    `;
  }

  render() {
    const viewMode = this._forceTable ? "table" : this.mode;
    return html`
      ${this.renderHeader()} ${this.renderSearch()}
      ${viewMode === "table" ? this.renderTable() : this.renderList()}
      ${this.renderPagination()}
      <confirm-dialog id="confirm"></confirm-dialog>
    `;
  }
}
customElements.define("employee-list-view", EmployeeListView);
