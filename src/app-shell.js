import { LitElement, html, css } from "lit";
import { Router } from "@vaadin/router";
import "./components/nav-menu.js";
import "./components/employee-list.js";
import "./components/employee-form.js";

export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    main {
      padding-top: 8px;
    }
  `;
  firstUpdated() {
    const outlet = this.renderRoot.getElementById("outlet");
    const router = new Router(outlet);
    router.setRoutes([
      { path: "/", redirect: "/employees" },
      { path: "/employees", component: "employee-list-view" },
      { path: "/employees/new", component: "employee-form-view" },
      { path: "/employees/:id/edit", component: "employee-form-view" },
      { path: "(.*)", redirect: "/employees" },
    ]);
  }
  onBeforeEnter(location) {
    const id = location.params?.id || null;
    this.mode = id ? "edit" : "create";
    this.mode = history.state?.mode || this.mode;
    this.employeeId = id;
    this.loadIfNeeded?.();
  }

  render() {
    return html`
      <nav-menu></nav-menu>
      <main id="outlet"></main>
    `;
  }
}
customElements.define("app-shell", AppShell);
