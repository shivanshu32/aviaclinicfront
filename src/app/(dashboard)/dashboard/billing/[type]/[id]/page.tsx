'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Receipt, Printer, IndianRupee, AlertTriangle } from 'lucide-react';
import { billingService, Bill } from '@/lib/services';

export default function ViewBillPage() {
  const params = useParams();
  const router = useRouter();
  const billType = params.type as string;
  const billId = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        let response;
        switch (billType) {
          case 'opd':
            response = await billingService.opd.getById(billId);
            break;
          case 'misc':
            response = await billingService.misc.getById(billId);
            break;
          case 'medicine':
            response = await billingService.medicine.getById(billId);
            break;
          default:
            throw new Error('Invalid bill type');
        }
        setBill(response.data?.bill);
      } catch (err) {
        console.error('Failed to fetch bill:', err);
        setError('Failed to load bill details');
      } finally {
        setLoading(false);
      }
    };

    if (billId && billType) {
      fetchBill();
    }
  }, [billId, billType]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-secondary-600 mb-4">{error || 'Bill not found'}</p>
        <button
          onClick={() => router.back()}
          className="text-primary-600 hover:text-primary-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const getBillTypeLabel = () => {
    switch (billType) {
      case 'opd': return 'OPD Consultation';
      case 'misc': return 'Lab/Misc Services';
      case 'medicine': return 'Pharmacy';
      default: return 'Bill';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header - Hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/billing"
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary-800 flex items-center gap-2">
              <Receipt className="w-7 h-7 text-primary-600" />
              Bill Details
            </h1>
            <p className="text-secondary-400 mt-1 font-sans">{bill.billNo}</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-medium"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Bill Content - Printable */}
      <div className="bg-white rounded-2xl shadow-sm shadow-gray-100 border border-gray-100 p-8 print:shadow-none print:border-none print:p-0">
        {/* Bill Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-2xl font-bold text-secondary-800">INVOICE</h2>
          <p className="text-secondary-500 mt-1">{getBillTypeLabel()}</p>
        </div>

        {/* Bill Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Bill To</p>
            <p className="font-semibold text-secondary-800 text-lg">{bill.patientName}</p>
            <p className="text-secondary-500">{bill.patientPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Bill Details</p>
            <p className="font-semibold text-secondary-800">{bill.billNo}</p>
            <p className="text-secondary-500">
              {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {bill.doctorName && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Consulting Doctor</p>
            <p className="font-medium text-secondary-800">{bill.doctorName}</p>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Description</th>
                <th className="text-center py-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Rate</th>
                <th className="text-right py-3 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-secondary-800">{item.description}</td>
                  <td className="py-3 text-center text-secondary-600">{item.quantity}</td>
                  <td className="py-3 text-right text-secondary-600">₹{item.rate}</td>
                  <td className="py-3 text-right font-medium text-secondary-800">₹{item.quantity * item.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal</span>
                <span>₹{bill.subtotal}</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount {bill.discountType === 'percentage' ? `(${bill.discountValue}%)` : ''}</span>
                  <span>-₹{bill.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-secondary-800 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {bill.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Payment Mode</p>
            <p className="font-medium text-secondary-800 capitalize">{bill.paymentMode}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              bill.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {bill.paymentStatus}
            </span>
          </div>
        </div>

        {bill.remarks && (
          <div className="mt-6">
            <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Remarks</p>
            <p className="text-secondary-600">{bill.remarks}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-secondary-400 text-sm">
          <p>Thank you for your visit!</p>
          <p className="mt-1">This is a computer-generated invoice.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #__next {
            visibility: visible;
          }
          #__next > * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
}
