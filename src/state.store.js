// Simple state store with localStorage persistence
const KEY = "employees";

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2);
}

class Store {
  constructor() {
    const saved = localStorage.getItem(KEY);
    this.state = { employees: saved ? JSON.parse(saved) : [] };
    this.listeners = new Set();
  }
  subscribe(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  notify() {
    this.listeners.forEach((cb) => cb(this.state));
  }
  persist() {
    localStorage.setItem(KEY, JSON.stringify(this.state.employees));
  }

  list() {
    return [...this.state.employees];
  }
  getById(id) {
    return this.state.employees.find((e) => e.id === id);
  }

  isEmailUnique(email, excludeId) {
    const e = this.state.employees.find(
      (x) => x.email.toLowerCase() == email.toLowerCase()
    );
    if (!e) return true;
    return e.id === excludeId;
  }

  add(employee) {
    const rec = { id: uid(), ...employee };
    this.state.employees.unshift(rec);
    this.persist();
    this.notify();
    return rec;
  }

  update(id, patch) {
    const idx = this.state.employees.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Not found");
    this.state.employees[idx] = { ...this.state.employees[idx], ...patch };
    this.persist();
    this.notify();
    return this.state.employees[idx];
  }

  remove(id) {
    const sizeBefore = this.state.employees.length;
    this.state.employees = this.state.employees.filter((e) => e.id !== id);
    if (this.state.employees.length !== sizeBefore) {
      this.persist();
      this.notify();
    }
  }
}

export const store = new Store();

// Seed 50 dummy employees once
if (store.list().length === 0) {
  const firstNames = [
    "Ada",
    "Grace",
    "Alan",
    "Linus",
    "Margaret",
    "Edsger",
    "Donald",
    "Barbara",
    "Ken",
    "Dennis",
    "Guido",
    "Bjarne",
    "Brenda",
    "James",
    "John",
    "Leslie",
    "Tim",
    "Radia",
    "Hedy",
    "Katherine",
  ];
  const lastNames = [
    "Lovelace",
    "Hopper",
    "Turing",
    "Torvalds",
    "Hamilton",
    "Dijkstra",
    "Knuth",
    "Liskov",
    "Thompson",
    "Ritchie",
    "vanRossum",
    "Stroustrup",
    "Rome",
    "Gosling",
    "McCarthy",
    "Lamport",
    "Berners-Lee",
    "Perlman",
    "Lamarr",
    "Johnson",
  ];
  const departments = ["Analytics", "Tech"];
  const positions = ["Junior", "Medior", "Senior"];

  const pad = (n) => String(n).padStart(2, "0");
  const toDMY = (y, m, d) => `${pad(y)}-${pad(m)}-${d}`;

  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];

    const dobYear = 1982 + (i % 20);
    const dobMonth = (i % 12) + 1;
    const dobDay = ((i * 7) % 28) + 1;
    const dateOfBirth = toDMY(dobYear, dobMonth, dobDay);

    const baseDoeYear = 2015 + (i % 10); 
    const doeYear = Math.max(baseDoeYear, dobYear + 18);
    const doeMonth = ((i * 5) % 12) + 1;
    const doeDay = ((i * 11) % 28) + 1;
    const dateOfEmployment = toDMY(doeYear, doeMonth, doeDay);

    const phone = String(5000000000 + i).slice(-10);

    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;

    store.add({
      firstName: fn,
      lastName: ln,
      dateOfEmployment,
      dateOfBirth,
      phone,
      email,
      department: departments[i % departments.length],
      position: positions[i % positions.length],
    });
  }
}
