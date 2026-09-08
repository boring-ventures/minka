import assert from "node:assert/strict";
import test from "node:test";

import { parseBcbOfficialUsdToBobExchangeRate } from "./platform-settings";

test("reads the official USD quotation and publication date from the BCB table", () => {
  const result = parseBcbOfficialUsdToBobExchangeRate(`
    <div>TABLA DE COTIZACIONES DEL 8 DE SEPTIEMBRE DE 2026&nbsp;</div>
    <div>Cotizaci&oacute;n Oficial del Boliviano respecto al D&oacute;lar (BCB)</div>
    <table><tr><td>ESTADOS UNIDOS</td><td>D&Oacute;LAR</td><td>USD</td><td>12.60</td></tr></table>
  `);

  assert.deepEqual(result, {
    rate: 12.6,
    publishedOn: "8 DE SEPTIEMBRE DE 2026",
  });
});

test("rejects a BCB response without a valid USD official quotation", () => {
  assert.throws(() => parseBcbOfficialUsdToBobExchangeRate("<html></html>"));
});
