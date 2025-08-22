import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import sinon from "sinon";

// import the component (adjust path)
import "../src/components/nav-menu.js";

describe("<nav-menu>", () => {
  it("navigates to /employees/new when clicking Add New", async () => {
    const push = sinon.spy(window.history, "pushState");

    const el = await fixture(html`<nav-menu></nav-menu>`);
    const btn = el.shadowRoot.querySelector(".add-button");
    expect(btn).to.exist;

    // Listen for the router popstate dispatch
    const popStateP = oneEvent(window, "popstate");
    btn.click();
    await popStateP;

    expect(push.called).to.be.true;
    const [, , url] = push.getCall(push.callCount - 1).args;
    expect(url).to.equal("/employees/new");

    push.restore();
  });

  it("renders Employees link pointing to /employees", async () => {
    const el = await fixture(html`<nav-menu></nav-menu>`);
    const a = el.shadowRoot.querySelector(".employees-anchor");
    expect(a.getAttribute("href")).to.equal("/employees");
  });
});
