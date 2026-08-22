import React, { useState, useEffect } from "react";
import { X, Download, Printer, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import jsPDF from "jspdf";
import { api } from "../services/api";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, bookingId }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !bookingId) return;

    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/payments/invoice/${bookingId}`);
        if (res.data.success) {
          setInvoice(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load invoice", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [isOpen, bookingId]);

  const handleDownloadPdf = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(12, 143, 233);
    doc.text("HomeEase India", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Hyperlocal Home Services Marketplace Pvt. Ltd.", 14, 28);
    doc.text(`GSTIN: ${invoice.gstin} | SAC Code: ${invoice.sac_code}`, 14, 34);

    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(`TAX INVOICE: ${invoice.invoice_number}`, 14, 46);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 14, 52);
    doc.text(`Booking Ref: ${invoice.booking_ref}`, 14, 58);

    doc.text(`Billed To: ${invoice.customer.name}`, 120, 46);
    doc.text(`Phone: ${invoice.customer.phone}`, 120, 52);
    doc.text(`Address: ${invoice.customer.address}`, 120, 58);

    doc.line(14, 66, 196, 66);

    // Items Header
    doc.setFont("helvetica", "bold");
    doc.text("Description", 14, 74);
    doc.text("Qty", 120, 74);
    doc.text("Amount (INR)", 160, 74);

    doc.setFont("helvetica", "normal");
    doc.text(invoice.items[0]?.description || "Home Service", 14, 82);
    doc.text("1", 120, 82);
    doc.text(`₹${invoice.subtotal}`, 160, 82);

    doc.line(14, 90, 196, 90);

    doc.text(`Subtotal: ₹${invoice.subtotal}`, 140, 98);
    if (invoice.discount > 0) {
      doc.text(`Discount: -₹${invoice.discount}`, 140, 104);
    }
    doc.text(`CGST (9%): ₹${invoice.cgst_amount}`, 140, 110);
    doc.text(`SGST (9%): ₹${invoice.sgst_amount}`, 140, 116);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Paid: ₹${invoice.total_amount}`, 140, 124);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("This is a computer-generated tax invoice and requires no physical signature.", 14, 150);

    doc.save(`HomeEase_Invoice_${invoice.invoice_number}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              GST Tax Invoice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice View */}
        <div className="p-6">
          {isLoading || !invoice ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading invoice...</div>
          ) : (
            <div className="space-y-4">
              {/* Company & Invoice meta */}
              <div className="flex items-start justify-between text-xs pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-black text-sm text-brand-600 dark:text-brand-400">
                    HomeEase India
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    GSTIN: <span className="font-mono font-bold">{invoice.gstin}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">SAC Code: {invoice.sac_code}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {invoice.invoice_number}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                    PAID (100% Verified)
                  </span>
                </div>
              </div>

              {/* Customer & Worker details */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Customer
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{invoice.customer.name}</p>
                  <p className="text-slate-500">{invoice.customer.phone}</p>
                  <p className="text-slate-500 truncate">{invoice.customer.address}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Service Professional
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{invoice.worker.name}</p>
                  <p className="text-slate-500">{invoice.worker.service}</p>
                  <p className="text-slate-500">Ref: {invoice.booking_ref}</p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                    <tr>
                      <th className="p-2.5">Service Description</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-2.5">{invoice.items[0]?.description}</td>
                      <td className="p-2.5 text-right font-semibold">₹{invoice.subtotal}</td>
                    </tr>
                    {invoice.discount > 0 && (
                      <tr className="text-emerald-600 font-semibold">
                        <td className="p-2.5">Promo Discount Applied</td>
                        <td className="p-2.5 text-right">-₹{invoice.discount}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="p-2.5 text-slate-500">CGST (9%)</td>
                      <td className="p-2.5 text-right text-slate-500">₹{invoice.cgst_amount}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-500">SGST (9%)</td>
                      <td className="p-2.5 text-right text-slate-500">₹{invoice.sgst_amount}</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 font-black text-slate-900 dark:text-white">
                      <td className="p-2.5">Total Paid</td>
                      <td className="p-2.5 text-right text-brand-600 dark:text-brand-400 text-sm">
                        ₹{invoice.total_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download / Print CTA */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex-1 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
