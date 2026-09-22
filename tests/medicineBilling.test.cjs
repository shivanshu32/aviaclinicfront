const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise the actual page handlers with synchronous state and mocked HTTP.
const source = fs.readFileSync(path.join(__dirname, '../src/app/(dashboard)/dashboard/billing/medicine/new/page.tsx'), 'utf8');
const definitions = source.slice(source.indexOf('const MISSING_PRICE'), source.indexOf('export default function'));
const handlers = source.slice(source.indexOf('  const addItem ='), source.indexOf('  const handleSubmit ='));
const makeHarness = new Function('medicineService', ts.transpile(`
  ${definitions}
  const medicines = [{_id: 'a', name: 'Becasule'}, {_id: 'b', name: 'Paracetamol'}, {_id: 'c', name: 'Unpriced'}];
  const nextId = {current: 0};
  let formData = {items: [emptyItem(0)], discountType: 'fixed', discountValue: 0};
  const setFormData = update => { formData = update(formData); };
  ${handlers}
  return {addItem, removeItem, updateItem, selectMedicine, calculateSubtotal, calculateDiscount, calculateTotal,
    state: () => formData,
    discount: (type, value) => { formData = {...formData, discountType: type, discountValue: value}; }};
`, { target: ts.ScriptTarget.ES2020 }));

const service = {getById: async id => ({data: {medicine: {sellingPrice: {a:20, b:15, c:null}[id]}}})};

test('stored prices drive quantities, multiple medicines, fixed and percentage discounts, removal and replacement', async () => {
  const h = makeHarness(service);
  await h.selectMedicine(0, 'a');
  assert.equal(h.calculateTotal(), 20);
  h.updateItem(0, 'quantity', 2);
  assert.equal(h.calculateTotal(), 40);
  h.addItem();
  await h.selectMedicine(h.state().items[1].rowId, 'b');
  h.updateItem(1, 'quantity', 3);
  assert.equal(h.calculateSubtotal(), 85);
  h.discount('fixed', 5);
  assert.equal(h.calculateTotal(), 80);
  h.discount('percentage', 10);
  assert.equal(h.calculateDiscount(), 8.5);
  assert.equal(h.calculateTotal(), 76.5);
  h.removeItem(1);
  assert.equal(h.calculateSubtotal(), 40);
  await h.selectMedicine(0, 'b');
  assert.equal(h.state().items[0].rate, 15);
  assert.equal(h.calculateSubtotal(), 30);
  await h.selectMedicine(0, '');
  assert.equal(h.state().items[0].rate, null);
  assert.equal(h.state().items[0].description, '');
});

test('unconfigured or failed price lookup clears the previous price and reports validation', async () => {
  const h = makeHarness(service);
  await h.selectMedicine(0, 'a');
  await h.selectMedicine(0, 'c');
  assert.equal(h.state().items[0].rate, null);
  assert.match(h.state().items[0].priceError, /Price not configured/);
  const failed = makeHarness({getById: async () => {throw Error('offline');}});
  await failed.selectMedicine(0, 'a');
  assert.equal(failed.state().items[0].rate, null);
  assert.match(failed.state().items[0].priceError, /Unable to load/);
});

test('late responses cannot overwrite a replacement or removed row', async () => {
  const pending = [];
  const h = makeHarness({getById: () => new Promise(resolve => pending.push(resolve))});
  const first = h.selectMedicine(0, 'a');
  const replacement = h.selectMedicine(0, 'b');
  pending[1]({data:{medicine:{sellingPrice:15}}});
  await replacement;
  pending[0]({data:{medicine:{sellingPrice:20}}});
  await first;
  assert.equal(h.state().items[0].rate, 15);
  const removed = h.selectMedicine(0, 'a');
  h.removeItem(0);
  h.addItem();
  pending[2]({data:{medicine:{sellingPrice:20}}});
  await removed;
  assert.equal(h.state().items.length, 1);
  assert.equal(h.state().items[0].rate, null);
  assert.equal(h.state().items[0].medicineId, '');
});
