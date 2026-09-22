const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise the actual page handlers with synchronous state and mocked HTTP.
const source = fs.readFileSync(path.join(__dirname, '../src/app/(dashboard)/dashboard/billing/medicine/new/page.tsx'), 'utf8');
const definitions = source.slice(source.indexOf('const MISSING_PRICE'), source.indexOf('export default function'));
const handlers = source.slice(source.indexOf('  const addItem ='), source.indexOf('  const handleSubmit ='));
const batchHelpers = {};
new Function('exports', ts.transpile(fs.readFileSync(path.join(__dirname, '../src/lib/medicineBatches.ts'), 'utf8'), {module: ts.ModuleKind.CommonJS}))(batchHelpers);
const buildHarness = new Function('medicineService', 'availableBatches', 'batchStockError', ts.transpile(`
  ${definitions}
  const medicines = [{_id: 'a', name: 'Becasule'}, {_id: 'b', name: 'Paracetamol'}, {_id: 'c', name: 'Unpriced'}];
  const nextId = {current: 0};
  let formData = {items: [emptyItem(0)], discountType: 'fixed', discountValue: 0};
  const setFormData = update => { formData = update(formData); };
  let batchRowId = null, chosenBatchId = '';
  const setBatchRowId = value => { batchRowId = value; };
  const setChosenBatchId = value => { chosenBatchId = value; };
  function render() {
  ${handlers}
  return {render, confirmBatch, choose: setChosenBatchId, addItem, removeItem, updateItem, selectMedicine, calculateSubtotal, calculateDiscount, calculateTotal,
    state: () => formData,
    discount: (type, value) => { formData = {...formData, discountType: type, discountValue: value}; }};
  } return render();
`, { target: ts.ScriptTarget.ES2020 }));

const makeHarness = service => buildHarness(service, batchHelpers.availableBatches, batchHelpers.batchStockError);
const batch = (sellingPrice, overrides = {}) => ({_id: 'batch', batchNo:'B1', expiryDate:'2099-01-01', status:'active', currentQty:10, sellingPrice, ...overrides});
const service = {getById: async id => ({data: {batches: [batch({a:20, b:15, c:null}[id])]}})};

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
  pending[1]({data:{batches:[batch(15)]}});
  await replacement;
  pending[0]({data:{batches:[batch(20)]}});
  await first;
  assert.equal(h.state().items[0].rate, 15);
  const removed = h.selectMedicine(0, 'a');
  h.removeItem(0);
  h.addItem();
  pending[2]({data:{batches:[batch(20)]}});
  await removed;
  assert.equal(h.state().items.length, 1);
  assert.equal(h.state().items[0].rate, null);
  assert.equal(h.state().items[0].medicineId, '');
});

test('multiple batches require manual selection, sorted by expiry rather than price', async () => {
  const h = makeHarness({getById: async () => ({data:{batches:[
    batch(10, {_id:'cheap',expiryDate:'2099-06-01'}),
    batch(90, {_id:'early'}),
    batch(5, {_id:'expired',expiryDate:'2000-01-01'}),
    batch(5, {_id:'empty',currentQty:0}),
  ]}})});
  await h.selectMedicine(0,'a');
  assert.equal(h.state().items[0].rate,null);
  assert.deepEqual(h.state().items[0].batches.map(b=>b._id),['early','cheap']);
  h.choose('cheap');
  h.render().confirmBatch();
  assert.equal(h.state().items[0].batchId,'cheap');
  assert.equal(h.state().items[0].rate,10);
  assert.equal(h.state().items[0].availableStock,10);
  assert.equal(h.state().items[0].expiryDate,'2099-06-01');
});

test('quantity validation includes multiple lines selecting the same batch', () => {
  assert.equal(batchHelpers.batchStockError([
    {batchId:'b',quantity:6,availableStock:10},
    {batchId:'b',quantity:5,availableStock:10},
  ],'b'),'Only 10 units are available in this batch.');
  assert.equal(batchHelpers.batchStockError([{batchId:'b',quantity:10,availableStock:10}],'b'),'');
});

test('medicine without batch records selects directly using its saved price', async () => {
  const h = makeHarness({getById:async()=>({data:{medicine:{sellingPrice:25},batches:[]}})});
  await h.selectMedicine(0,'a');
  assert.equal(h.state().items[0].hasBatchRecords,false);
  assert.equal(h.state().items[0].batchId,'');
  assert.equal(h.state().items[0].rate,25);
  assert.equal(h.calculateTotal(),25);
});

test('missing batch-free price is explicit and expired batches cannot use direct pricing', async () => {
  const missing = makeHarness({getById:async()=>({data:{medicine:{},batches:[]}})});
  await missing.selectMedicine(0,'a');
  assert.match(missing.state().items[0].priceError,/Price not configured/);
  const expired = makeHarness({getById:async()=>({data:{medicine:{sellingPrice:25},batches:[batch(10,{expiryDate:'2000-01-01'})]}})});
  await expired.selectMedicine(0,'a');
  assert.equal(expired.state().items[0].hasBatchRecords,true);
  assert.equal(expired.state().items[0].rate,null);
});
