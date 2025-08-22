A fully client-side employee management SPA built with **LitElement (JS)** and **Vaadin Router**.  
No backend—data is persisted in the browser via `localStorage`.

---

## ✨ Features

- **Employees**
  - List with **search** and **pagination**
  - Toggle between **list** and **table** layouts
  - **Create** / **Edit** (with confirmation) / **Delete** (with confirmation)
- **Validation**
  - Required fields, email, phone, date rules, **unique email**
  - DOB must be before DOE; no future dates
- **Persistence**
  - Simple state store backed by `localStorage`
- **i18n**
  - English 🇬🇧 & Turkish 🇹🇷
  - Language is driven by `<html lang="…">` and can be switched from the header
- **Responsive UI**
  - Hand-rolled CSS (no Bootstrap), matches the provided ING-style pagination & dialogs
- **Testing**
  - Unit tests via **@web/test-runner** + **open-wc**, coverage target **≥ 85%**

---

## 🔧 Tech Stack

- **UI:** [LitElement](https://lit.dev/)
- **Routing:** [Vaadin Router](https://vaadin.com/router)
- **State:** custom store on top of `localStorage`
- **i18n:** tiny utility (`utils/i18n.js`) + runtime language switch
- **Build/Dev:** @web/dev-server
- **Tests:** @web/test-runner, @open-wc/testing, **c8** for coverage

---

## 🚀 Getting Started
### Run with dev server
```bash
npm i
npm run start
# Opens http://localhost:8000 (or similar) with live reload
