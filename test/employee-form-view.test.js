import { fixture, html, expect } from "@open-wc/testing";
import sinon from "sinon";
import { stubStoreWith } from "./helpers/store-mock.js";
import { stubI18n } from "./helpers/i18n-mock.js";

// import the component (adjust path)
import "../src/views/employee-form-view.js";

const existing = {
  id: "e42",
  firstName: "Ada",
  lastName: "Lovelace",
  dateOfEmployment: "05/10/2020",
  dateOfBirth: "12/10/1990",
  phone: "5555551212",
  email: "ada@example.com",
  department: "Tech",
  position: "Senior",
};

describe("<employee-form-view>", () => {
  let storeCtl, i18nCtl;

  beforeEach(() => {
    storeCtl = stubStoreWith([existing]);
    i18nCtl = stubI18n();
  });

  afterEach(() => {
    storeCtl.restore();
    i18nCtl.restore();
  });

  function q(el, selector) {
    return el.shadowRoot.querySelector(selector);
  }

  it("creates a new employee (validates, transforms date inputs)", async () => {
    const el = await fixture(html`<employee-form-view></employee-form-view>`);
    // Ensure clean create mode
    el.mode = "create";
    await el.updateComplete;

    // Fill text fields
    q(el, 'input[type="text"][placeholder="Ahmet"]').value = "Grace";
    q(el, 'input[type="text"][placeholder="Ahmet"]').dispatchEvent(
      new Event("input")
    );
    q(el, 'input[type="text"][placeholder="Sourtimes"]').value = "Hopper";
    q(el, 'input[type="text"][placeholder="Sourtimes"]').dispatchEvent(
      new Event("input")
    );

    // Dates are <input type="date"> and the component listens on change
    // Enter ISO, component converts to MM/DD/YYYY in the model
    const doe = el.shadowRoot.querySelector('input[type="date"]');
    doe.value = "2021-03-05";
    doe.dispatchEvent(new Event("change"));

    const dob = el.shadowRoot.querySelectorAll('input[type="date"]')[1];
    dob.value = "1985-12-01";
    dob.dispatchEvent(new Event("change"));

    // Phone & email
    const phone = el.shadowRoot.querySelector('input[type="tel"]');
    phone.value = "+(90) 555-555-5555";
    phone.dispatchEvent(new Event("input"));

    const email = el.shadowRoot.querySelector('input[type="email"]');
    email.value = "grace@example.com";
    email.dispatchEvent(new Event("input"));

    // Department & Position
    const dept = el.shadowRoot.querySelector("select:nth-of-type(1)");
    dept.value = "Tech";
    dept.dispatchEvent(new Event("change"));

    const pos = el.shadowRoot.querySelector("select:nth-of-type(2)");
    pos.value = "Senior";
    pos.dispatchEvent(new Event("change"));

    // Submit
    const save = Array.from(el.shadowRoot.querySelectorAll("button")).find(
      (b) =>
        b.textContent.trim() === "save" ||
        b.textContent.toLowerCase().includes("save")
    );
    save.click();

    await el.updateComplete;

    // Added with date conversion
    expect(storeCtl.stubs.add.calledOnce).to.be.true;
    const added = storeCtl.stubs.add.getCall(0).args[0];

    expect(added.firstName).to.equal("Grace");
    expect(added.lastName).to.equal("Hopper");
    expect(added.dateOfEmployment).to.equal("03/05/2021");
    expect(added.dateOfBirth).to.equal("12/01/1985");
    expect(added.email).to.equal("grace@example.com");

    // Phone saved without formatting chars (your latest list view expects digits-only)
    expect(added.phone.replace(/\D/g, "")).to.equal("5555555555");
  });

  it("edits an existing employee and confirms before update; fixedFullName stays frozen", async () => {
    const el = await fixture(html`<employee-form-view></employee-form-view>`);
    el.mode = "edit";
    el.employee = { ...existing }; // reactive input property
    await el.updateComplete;

    const originalFixed = el.fixedFullName;
    expect(originalFixed).to.equal("Ada Lovelace");

    // Change last name
    const lastNameInput = el.shadowRoot.querySelector(
      'input[type="text"][placeholder="Sourtimes"]'
    );
    lastNameInput.value = "L.";
    lastNameInput.dispatchEvent(new Event("input"));
    await el.updateComplete;

    // Confirm dialog stub -> allow update
    const dlg = el.shadowRoot.getElementById("confirm");
    sinon.stub(dlg, "show").resolves(true);

    // Click Save
    const save = Array.from(el.shadowRoot.querySelectorAll("button")).find(
      (b) => b.textContent.toLowerCase().includes("save")
    );
    save.click();
    await el.updateComplete;

    // Updated
    expect(storeCtl.stubs.update.calledOnce).to.be.true;
    const [id, patch] = storeCtl.stubs.update.getCall(0).args;
    expect(id).to.equal("e42");
    expect(patch.lastName).to.equal("L.");

    // Frozen fixedFullName
    expect(el.fixedFullName).to.equal("Ada Lovelace");
  });
});
