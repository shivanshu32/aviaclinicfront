import type { StockBatch } from './services/medicineService';

export function availableBatches(batches: StockBatch[], now = Date.now()) {
  return batches.filter(batch => ['active', 'low'].includes(batch.status)
    && batch.currentQty > 0 && new Date(batch.expiryDate).getTime() > now)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      || a._id.localeCompare(b._id));
}

export function batchStockError(items: { batchId: string; quantity: number; availableStock: number }[], batchId: string) {
  if (!batchId) return '';
  const selected = items.filter(item => item.batchId === batchId);
  const available = Math.min(...selected.map(item => item.availableStock));
  return selected.reduce((sum, item) => sum + item.quantity, 0) > available
    ? `Only ${available} units are available in this batch.` : '';
}
