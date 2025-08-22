import { fixture, html, expect, oneEvent } from "@open-wc/testing";
import sinon from "sinon";
import { stubStoreWith } from "./helpers/store-mock.js";
import { stubI18n } from "./helpers/i18n-mock.js";

// import the component (adjust path)
import "../src/views/employee-list-view.js";

const mk = (i) => ({
  id: `e${i}`,
  firstName: `John${i}`,
  lastName: `Doe${i}`,
  dateOfEmployment: "01/0" + ((i % 9) + 1) + "/2022",
  dateOfBirth: "02/0" + ((i % 9) + 1) + "/1990",
  phone: "55555555" + String(i).padStart(2, "0"),
  email: `user${i}@example.com`,
  department: i % 2 ? "Tech" : "Analytics",
  position: ["Junior", "Medior", "Senior"][i % 3],
});

describe("<employee-list-view>", () => {
  let storeCtl, i18nCtl;

  beforeEach(() => {
    storeCtl = stubStoreWith(Array.from({ length: 12 }, (_, i) => mk(i + 1)));
    i18nCtl = stubI18n();
  });

  afterEach(() => {
    storeCtl.restore();
    i18nCtl.restore();
  });

  it("renders and toggles view mode (list <-> table)", async () => {
    const el = await fixture(html`<employee-list-view></employee-list-view>`);
    // Allow switching regardless of screen by overriding the flag
    el._forceTable = false;
    await el.updateComplete;

    const [btnList, btnTable] = el.shadowRoot.querySelectorAll(".seg-btn");
    expect(btnList).to.exist;
    expect(btnTable).to.exist;

    // default mode is "list"
    expect(el.mode).to.equal("list");

    // switch to table
    btnTable.click();
    await el.updateComplete;
    expect(el.mode).to.equal("table");

    // back to list
    btnList.click();
    await el.updateComplete;
    expect(el.mode).to.equal("list");
  });

  it("filters by search input and resets to page 1", async () => {
    const el = await fixture(html`<employee-list-view></employee-list-view>`);
    el._forceTable = false;
    await el.updateComplete;

    // search bar rendered by renderSearch()
    const search = el.shadowRoot.querySelector(".search");
    expect(search).to.exist;

    // go to page 2 first to verify reset to 1
    el.perPage = 3;
    el.page = 2;
    await el.updateComplete;

    search.value = "john1"; // matches John1*
    search.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await el.updateComplete;

    expect(el.page).to.equal(1); // reset
    const rows = el.shadowRoot.querySelectorAll(".listRow");
    expect(rows.length).to.be.greaterThan(0);
    // every row contains the filter substring
    rows.forEach((r) => {
      expect(r.textContent.toLowerCase()).to.contain("john1");
    });
  });

  it("paginates (next/prev) and shows correct count", async () => {
    const el = await fixture(html`<employee-list-view></employee-list-view>`);
    el._forceTable = false;
    el.perPage = 4;
    await el.updateComplete;

    // Page 1
    let rows = el.shadowRoot.querySelectorAll(".listRow");
    expect(rows.length).to.equal(4);

    // Next page
    const [prev, next] = el.shadowRoot.querySelectorAll(".ing-pg-arrow");
    next.click();
    await el.updateComplete;

    rows = el.shadowRoot.querySelectorAll(".listRow");
    expect(el.page).to.equal(2);
    expect(rows.length).to.equal(4);

    // Prev page
    prev.click();
    await el.updateComplete;
    expect(el.page).to.equal(1);
  });

  it("deletes an employee after confirm dialog resolves true", async () => {
    const el = await fixture(html`<employee-list-view></employee-list-view>`);
    el._forceTable = false;
    await el.updateComplete;

    const firstRow = el.shadowRoot.querySelector(".listRow");
    const targetId = storeCtl.state.data[0].id;

    // stub confirm dialog to auto-confirm
    const dlg = el.shadowRoot.getElementById("confirm");
    sinon.stub(dlg, "show").resolves(true);

    // click the delete icon (last action button)
    const delBtn = firstRow.querySelector(".col-actions .icon-btn:last-child");
    delBtn.click();

    // wait one micro task for delete path
    await el.updateComplete;

    // store.remove called and item gone
    expect(storeCtl.stubs.remove.called).to.be.true;
    expect(storeCtl.stubs.remove.getCall(0).args[0]).to.equal(targetId);

    // list rerendered after subscription callback
    await el.updateComplete;
    const found = Array.from(el.shadowRoot.querySelectorAll(".listRow")).some(
      (r) => r.textContent.includes(targetId)
    );
    expect(found).to.be.false;
  });
});
