import sinon from "sinon";
import * as realStoreModule from "../src/state.store.js"; // <-- adjust if needed

export function stubStoreWith(seed = []) {
  const { store } = realStoreModule;

  const state = {
    data: seed.map((x) => ({ ...x })),
    subs: [],
  };

  const list = sinon.stub(store, "list").callsFake(() => state.data.slice());
  const getById = sinon
    .stub(store, "getById")
    .callsFake((id) => state.data.find((e) => e.id === id));
  const add = sinon.stub(store, "add").callsFake((obj) => {
    const id = obj.id ?? `id-${Date.now()}`;
    state.data.push({ id, ...obj });
    state.subs.forEach((fn) => fn());
    return id;
  });
  const update = sinon.stub(store, "update").callsFake((id, patch) => {
    const i = state.data.findIndex((e) => e.id === id);
    if (i >= 0) {
      state.data[i] = { ...state.data[i], ...patch };
      state.subs.forEach((fn) => fn());
    }
  });
  const remove = sinon.stub(store, "remove").callsFake((id) => {
    state.data = state.data.filter((e) => e.id !== id);
    state.subs.forEach((fn) => fn());
  });
  const subscribe = sinon.stub(store, "subscribe").callsFake((fn) => {
    state.subs.push(fn);
    return () => {
      state.subs = state.subs.filter((f) => f !== fn);
    };
  });
  const isEmailUnique = sinon
    .stub(store, "isEmailUnique")
    .callsFake(
      (email, exceptId) =>
        !state.data.some((e) => e.email === email && e.id !== exceptId)
    );

  return {
    state,
    stubs: { list, getById, add, update, remove, subscribe, isEmailUnique },
    restore: () => sinon.restore(),
  };
}
