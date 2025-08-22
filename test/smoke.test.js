import { expect, fixture, html } from "@open-wc/testing";
import "../src/components/nav-menu.js";

describe("smoke", () => {
  it("mounts a component", async () => {
    const el = await fixture(html`<nav-menu></nav-menu>`);
    expect(el).to.exist;
  });
});
