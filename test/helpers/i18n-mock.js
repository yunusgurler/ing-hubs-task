import sinon from "sinon";
import * as i18n from "../src/utils/i18n.js"; // <-- adjust

export function stubI18n() {
  // Simple pass-through: t('key') => 'key' for stable assertions
  if (!/^\[native code]/.test(String(i18n.t))) {
    // no-op if already stubbed
  }
  const tStub = sinon.stub(i18n, "t").callsFake((k) => k);
  const onLangChangeStub = sinon
    .stub(i18n, "onLangChange")
    .callsFake(() => () => {});
  return {
    restore: () => {
      tStub.restore();
      onLangChangeStub.restore();
    },
  };
}
