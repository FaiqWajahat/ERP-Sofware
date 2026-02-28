'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { errorToast, successToast } from '@/lib/toast';
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import { 
  ArrowLeft, Wallet, FileText, Calendar, 
  TrendingUp, Plus, X, Banknote, Receipt, Trash2, AlertTriangle, MapPin, Search 
} from 'lucide-react';
import CustomLoader from '@/Components/CustomLoader';



const ForemanLedgerPage = () => {
  const { foremanId, ledgerId } = useParams();
  const router = useRouter();

  // --- States ---
  const [ledgerData, setLedgerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Modal States
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selection State
  const [recordToDelete, setRecordToDelete] = useState(null); 

  // Form Data
  const initialCashForm = { amount: '', paymentMode: 'Cash', referenceNo: '', remarks: '', date: new Date().toISOString().split('T')[0] };
  const initialInvoiceForm = { amount: '', invoiceNo: '', category: 'Material', remarks: '', date: new Date().toISOString().split('T')[0] };

  const [cashForm, setCashForm] = useState(initialCashForm);
  const [invoiceForm, setInvoiceForm] = useState(initialInvoiceForm);

  // Styles & Constants
  const primaryBg = { backgroundColor: 'var(--primary-color)' };
  const primaryText = { color: 'var(--primary-color)' };
  const CURRENCY = "SAR";
  
  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Foremans", href: "/Dashboard/Foremans" },
    { name: "Assigned", href: `/Dashboard/Foremans/${foremanId}/AssignProjects` },
    { name: "Ledger", href: `/Dashboard/Foremans/${foremanId}/Ledger/${ledgerId}` }
  ];

  const categories = ['Material', 'Labor', 'Fuel', 'Transport', 'Food', 'Other'];
  const paymentModes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];

  // --- Effects ---
  useEffect(() => {
    if (ledgerId) fetchLedgerData();
  }, [ledgerId]);

  // --- API Calls ---
  const fetchLedgerData = async () => {
    // Only show full loader on initial fetch, not refresh
    if (!ledgerData) setIsLoading(true);
    try {
      const res = await axios.get(`/api/project/foreman/ledger/${ledgerId}`);
      if (res.data.success) setLedgerData(res.data.data);
    } catch (error) {
      errorToast("Failed to load ledger data");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers ---
  const handleAddCash = async (e) => {
    e.preventDefault();
    if (!cashForm.amount || Number(cashForm.amount) <= 0) return errorToast("Invalid amount");
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(`/api/project/foreman/ledger/add-cash`, { ledgerId, ...cashForm });
      if (res.data.success) {
        successToast("Cash added successfully");
        setIsCashModalOpen(false);
        setCashForm(initialCashForm);
        fetchLedgerData();
      }
    } catch (error) {
      errorToast(error.response?.data?.message || "Failed to add cash");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.amount || Number(invoiceForm.amount) <= 0) return errorToast("Invalid amount");
    if (!invoiceForm.invoiceNo.trim()) return errorToast("Invoice No is required");

    setIsSubmitting(true);
    try {
      const res = await axios.post(`/api/project/foreman/ledger/add-invoice`, { ledgerId, ...invoiceForm });
      if (res.data.success) {
        successToast("Invoice added successfully");
        setIsInvoiceModalOpen(false);
        setInvoiceForm(initialInvoiceForm);
        fetchLedgerData();
      }
    } catch (error) {
      errorToast(error.response?.data?.message || "Failed to add invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      const endpoint = recordToDelete.type === 'sent' 
        ? '/api/project/foreman/ledger/delete-cash' 
        : '/api/project/foreman/ledger/delete-invoice';

      const res = await axios.delete(endpoint, {
        data: { ledgerId, recordId: recordToDelete._id }
      });

      if (res.data.success) {
        successToast("Record deleted");
        setIsDeleteConfirmOpen(false);
        
        // Optimistic UI Update
        setLedgerData(prev => {
          if (!prev) return null;
          const next = { ...prev };
          const amt = recordToDelete.amount;
          
          if (recordToDelete.type === 'sent') {
            next.amountSent = prev.amountSent.filter(i => i._id !== recordToDelete._id);
            next.totalSent = (prev.totalSent || 0) - amt;
            next.remainingBalance = (prev.remainingBalance || 0) - amt;
          } else {
            next.invoicesReceived = prev.invoicesReceived.filter(i => i._id !== recordToDelete._id);
            next.totalInvoiced = (prev.totalInvoiced || 0) - amt;
            next.remainingBalance = (prev.remainingBalance || 0) + amt;
          }
          return next;
        });
        setRecordToDelete(null);
      }
    } catch (error) {
      errorToast("Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Memoized Calculations ---
  const monthlySummary = useMemo(() => {
    if (!ledgerData) return [];
    const map = new Map();
    
    const process = (entry, type) => {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { month: key, sent: 0, invoiced: 0 });
      const rec = map.get(key);
      if (type === 'sent') rec.sent += entry.amount;
      else rec.invoiced += entry.amount;
    };

    ledgerData.amountSent?.forEach(e => process(e, 'sent'));
    ledgerData.invoicesReceived?.forEach(e => process(e, 'invoice'));

    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [ledgerData]);

  if (isLoading) return <CustomLoader text='loading foreman ledger'/>;
  if (!ledgerData) return <div className="p-10 text-center text-base-content/50">Record not found</div>;

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Project Ledger" />

      {/* --- 1. Info Card --- */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col justify-center md:justify-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-ghost badge-sm text-xs font-mono opacity-70">ID: {ledgerData._id.slice(-6)}</span>
              <span className={`badge badge-sm text-xs text-white ${ledgerData.remainingBalance >= 0 ? 'badge-success' : 'badge-error'}`}>
                {ledgerData.remainingBalance >= 0 ? 'Healthy' : 'Overdraft'}
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-base-content uppercase leading-tight">{ledgerData.projectName}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs md:text-sm text-base-content/70">
               <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md"><ArrowLeft size={14}/> {ledgerData.foremanName}</span>
               <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md"><MapPin size={14}/> {ledgerData.projectLocation || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3 md:p-4 bg-base-200/50 rounded-lg border border-base-200 text-center">
               <p className="text-[10px] uppercase font-bold text-base-content/50">Total Sent</p>
               <p className="text-sm md:text-xl font-bold text-base-content truncate">{ledgerData.totalSent?.toLocaleString()}</p>
            </div>
            <div className="p-3 md:p-4 bg-base-200/50 rounded-lg border border-base-200 text-center">
               <p className="text-[10px] uppercase font-bold text-base-content/50">Invoiced</p>
               <p className="text-sm md:text-xl font-bold text-base-content truncate">{ledgerData.totalInvoiced?.toLocaleString()}</p>
            </div>
            <div className="p-3 md:p-4 rounded-lg border text-center col-span-2 sm:col-span-1" style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 8%, transparent)', borderColor: 'var(--primary-color)' }}>
               <p className="text-[10px] uppercase font-bold" style={primaryText}>Balance</p>
               <p className="text-sm md:text-xl font-bold truncate" style={primaryText}>{ledgerData.remainingBalance?.toLocaleString()} <span className="text-[10px] opacity-80">{CURRENCY}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Tabs & Actions --- */}
      <div className="flex flex-col gap-6">
        <div className="w-full overflow-x-auto pb-1 hide-scrollbar">
          <div className="tabs tabs-boxed bg-base-100 p-1 border border-base-200 w-max md:w-fit flex-nowrap">
            <button onClick={() => setActiveTab('summary')} className={`tab h-10 px-4 md:px-6 text-sm ${activeTab === 'summary' ? 'tab-active font-bold text-white' : 'text-base-content/70'}`} style={activeTab === 'summary' ? primaryBg : {}}><Calendar size={16} className="mr-2"/> Summary</button>
            <button onClick={() => setActiveTab('sent')} className={`tab h-10 px-4 md:px-6 text-sm ${activeTab === 'sent' ? 'tab-active font-bold text-white' : 'text-base-content/70'}`} style={activeTab === 'sent' ? primaryBg : {}}><Wallet size={16} className="mr-2"/> Cash Sent</button>
            <button onClick={() => setActiveTab('invoices')} className={`tab h-10 px-4 md:px-6 text-sm ${activeTab === 'invoices' ? 'tab-active font-bold text-white' : 'text-base-content/70'}`} style={activeTab === 'invoices' ? primaryBg : {}}><FileText size={16} className="mr-2"/> Invoices</button>
          </div>
        </div>

        {/* --- 3. Panel Content --- */}
        <div className="bg-base-100 border border-base-200 rounded-lg overflow-hidden shadow-sm min-h-[300px]">
          
          {/* Header Bar */}
          <div className="p-4 border-b border-base-200 bg-base-200/30 flex justify-between items-center">
            <h3 className="font-bold text-base-content flex items-center gap-2 text-sm md:text-base">
              {activeTab === 'summary' ? <><TrendingUp size={18}/> Monthly Breakdown</> : 
               activeTab === 'sent' ? <><Wallet size={18}/> Cash History</> : 
               <><FileText size={18}/> Expenses Log</>}
            </h3>
            {activeTab === 'sent' && <button onClick={() => setIsCashModalOpen(true)}  className="btn btn-sm text-white border-none text-xs md:text-sm" style={primaryBg}><Plus size={16}/> Add Cash</button>}
            {activeTab === 'invoices' && <button onClick={() => setIsInvoiceModalOpen(true)} className="btn btn-sm text-white border-none text-xs md:text-sm" style={primaryBg}><Plus size={16}/> Add Invoice</button>}
          </div>

          {/* Table Container - Fixed Height for long lists with sticky header */}
          <div className="overflow-x-auto w-full max-h-[500px] overflow-y-auto">
            <table className="table w-full min-w-[700px] table-pin-rows">
              
              {/* --- SUMMARY TABLE --- */}
              {activeTab === 'summary' && (
                <>
                  <thead className="bg-base-200/80 backdrop-blur-sm text-xs uppercase text-base-content/60 z-10">
                    <tr><th>Month</th><th className="text-right">Sent</th><th className="text-right">Invoiced</th><th className="text-right">Net</th><th className="text-center">Status</th></tr>
                  </thead>
                  <tbody>
                    {monthlySummary.length > 0 ? monthlySummary.map((item, idx) => (
                      <tr key={idx} className="hover border-base-200 text-sm">
                        <td className="font-bold text-base-content">{item.month}</td>
                        <td className="text-right font-mono text-base-content">{item.sent.toLocaleString()}</td>
                        <td className="text-right font-mono text-base-content">{item.invoiced.toLocaleString()}</td>
                        <td className={`text-right font-mono font-bold ${item.sent - item.invoiced < 0 ? 'text-error' : 'text-success'}`}>{(item.sent - item.invoiced).toLocaleString()}</td>
                        <td className="text-center">{item.sent - item.invoiced < 0 ? <span className="badge badge-error badge-xs text-white">Deficit</span> : <span className="badge badge-success badge-xs text-white">Surplus</span>}</td>
                      </tr>
                    )) : <tr><td colSpan={5} className="text-center py-12"><div className="flex flex-col items-center opacity-50"><Calendar size={32} className="mb-2"/>No monthly data yet</div></td></tr>}
                  </tbody>
                </>
              )}

              {/* --- CASH SENT TABLE --- */}
              {activeTab === 'sent' && (
                <>
                  <thead className="bg-base-200/80 backdrop-blur-sm text-xs uppercase text-base-content/60 z-10">
                    <tr><th>Date</th><th>Ref No</th><th>Mode</th><th>Remarks</th><th className="text-right text-success">Amount</th><th className="text-center w-16">Action</th></tr>
                  </thead>
                  <tbody>
                    {ledgerData.amountSent?.length > 0 ? [...ledgerData.amountSent].reverse().map((r, i) => (
                      <tr key={r._id || i} className="hover border-base-200 text-sm group">
                        <td className="text-xs text-base-content">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="font-mono text-xs text-base-content/80">{r.referenceNo || '-'}</td>
                        <td><span className="badge badge-sm badge-ghost text-[10px]">{r.paymentMode}</span></td>
                        <td className="text-xs text-base-content/70 truncate max-w-[150px]">{r.remarks || '-'}</td>
                        <td className="text-right font-bold text-success font-mono">+ {r.amount.toLocaleString()}</td>
                        <td className="text-center"><button onClick={() => setRecordToDelete({ ...r, type: 'sent' }) || setIsDeleteConfirmOpen(true)} className="btn btn-ghost btn-xs text-error opacity-50 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></td>
                      </tr>
                    )) : <tr><td colSpan={6} className="text-center py-12"><div className="flex flex-col items-center opacity-50"><Wallet size={32} className="mb-2"/>No transactions recorded</div></td></tr>}
                  </tbody>
                </>
              )}

              {/* --- INVOICES TABLE --- */}
              {activeTab === 'invoices' && (
                <>
                  <thead className="bg-base-200/80 backdrop-blur-sm text-xs uppercase text-base-content/60 z-10">
                    <tr><th>Date</th><th>Inv No</th><th>Category</th><th>Remarks</th><th className="text-right text-error">Amount</th><th className="text-center w-16">Action</th></tr>
                  </thead>
                  <tbody>
                    {ledgerData.invoicesReceived?.length > 0 ? [...ledgerData.invoicesReceived].reverse().map((r, i) => (
                      <tr key={r._id || i} className="hover border-base-200 text-sm group">
                        <td className="text-xs text-base-content">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="font-mono text-xs font-bold text-base-content/80">{r.invoiceNo || 'N/A'}</td>
                        <td><span className="badge badge-sm badge-outline text-[10px] text-base-content/70">{r.category}</span></td>
                        <td className="text-xs text-base-content/70 truncate max-w-[150px]">{r.remarks || '-'}</td>
                        <td className="text-right font-bold text-error font-mono">- {r.amount.toLocaleString()}</td>
                        <td className="text-center"><button onClick={() => setRecordToDelete({ ...r, type: 'invoice' }) || setIsDeleteConfirmOpen(true)} className="btn btn-ghost btn-xs text-error opacity-50 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></td>
                      </tr>
                    )) : <tr><td colSpan={6} className="text-center py-12"><div className="flex flex-col items-center opacity-50"><FileText size={32} className="mb-2"/>No invoices added</div></td></tr>}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: ADD CASH --- */}
      <dialog className={`modal modal-bottom sm:modal-middle ${isCashModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden w-full sm:w-11/12 max-w-md">
          <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100"><h3 className="font-bold text-lg text-base-content flex items-center gap-2"><Banknote className="text-success" size={20}/> Send Cash</h3><button onClick={() => setIsCashModalOpen(false)} className="btn btn-sm btn-circle btn-ghost"><X size={20}/></button></div>
          <form onSubmit={handleAddCash} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Amount <span className="text-error">*</span></label><input type="number" step="0.01" min="0" required className="input input-bordered w-full bg-base-100" value={cashForm.amount} onChange={e => setCashForm({...cashForm, amount: e.target.value})} placeholder="0.00"/></div>
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Date <span className="text-error">*</span></label><input type="date" required className="input input-bordered w-full bg-base-100" value={cashForm.date} onChange={e => setCashForm({...cashForm, date: e.target.value})}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Mode</label><select className="select select-bordered w-full bg-base-100" value={cashForm.paymentMode} onChange={e => setCashForm({...cashForm, paymentMode: e.target.value})}>{paymentModes.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Ref No</label><input type="text" className="input input-bordered w-full bg-base-100" placeholder="UTR..." value={cashForm.referenceNo} onChange={e => setCashForm({...cashForm, referenceNo: e.target.value})}/></div>
            </div>
            <div className="form-control"><label className="label-text text-xs font-bold mb-1 block text-base-content/70">Remarks</label><textarea className="textarea textarea-bordered h-24 bg-base-100 w-full" placeholder="Details..." value={cashForm.remarks} onChange={e => setCashForm({...cashForm, remarks: e.target.value})}></textarea></div>
            <button type="submit" disabled={isSubmitting} className="btn btn-success text-white w-full">{isSubmitting ? <span className="loading loading-spinner"/> : "Confirm Transfer"}</button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button onClick={() => setIsCashModalOpen(false)}>close</button></form>
      </dialog>

      {/* --- MODAL 2: ADD INVOICE --- */}
      <dialog className={`modal modal-bottom sm:modal-middle ${isInvoiceModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden w-full sm:w-11/12 max-w-md">
          <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100"><h3 className="font-bold text-lg text-base-content flex items-center gap-2"><Receipt className="text-error" size={20}/> Add Expense</h3><button onClick={() => setIsInvoiceModalOpen(false)} className="btn btn-sm btn-circle btn-ghost"><X size={20}/></button></div>
          <form onSubmit={handleAddInvoice} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Amount <span className="text-error">*</span></label><input type="number" step="0.01" min="0" required className="input input-bordered w-full bg-base-100 border-error/50 focus:border-error" value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} placeholder="0.00"/></div>
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Date <span className="text-error">*</span></label><input type="date" required className="input input-bordered w-full bg-base-100" value={invoiceForm.date} onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Category</label><select className="select select-bordered w-full bg-base-100" value={invoiceForm.category} onChange={e => setInvoiceForm({...invoiceForm, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Inv No <span className="text-error">*</span></label><input type="text" required className="input input-bordered w-full bg-base-100" placeholder="#INV-001" value={invoiceForm.invoiceNo} onChange={e => setInvoiceForm({...invoiceForm, invoiceNo: e.target.value})}/></div>
            </div>
            <div className="form-control"><label className="label-text text-xs font-bold mb-1 text-base-content/70">Remarks</label><textarea className="textarea textarea-bordered h-24 bg-base-100 w-full" placeholder="Details..." value={invoiceForm.remarks} onChange={e => setInvoiceForm({...invoiceForm, remarks: e.target.value})}></textarea></div>
            <button type="submit" disabled={isSubmitting} className="btn btn-error text-white w-full">{isSubmitting ? <span className="loading loading-spinner"/> : "Save Invoice"}</button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop"><button onClick={() => setIsInvoiceModalOpen(false)}>close</button></form>
      </dialog>

      {/* --- MODAL 3: DELETE CONFIRMATION --- */}
      <dialog className={`modal modal-bottom sm:modal-middle ${isDeleteConfirmOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden w-full sm:w-11/12 max-w-sm">
          <div className="p-6 md:p-8 text-center bg-base-100">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><AlertTriangle size={32} /></div>
            <h3 className="text-lg md:text-xl font-bold text-base-content">Delete Record?</h3>
            <p className="text-sm text-base-content/70 mt-3 leading-relaxed">This will remove the transaction for <strong>{recordToDelete?.amount?.toLocaleString()} {CURRENCY}</strong>. This cannot be undone.</p>
          </div>
          <div className="flex p-4 gap-3 bg-base-200/50 border-t border-base-200">
            <button onClick={() => setIsDeleteConfirmOpen(false)} className="btn btn-ghost text-base-content/70 flex-1 h-11 rounded-md">Cancel</button>
            <button onClick={handleDeleteRecord} disabled={isDeleting} className="btn btn-error text-white flex-1 h-11 shadow-lg rounded-md">{isDeleting ? <span className="loading loading-spinner"/> : "Yes, Delete"}</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button onClick={() => setIsDeleteConfirmOpen(false)}>close</button></form>
      </dialog>
    </>
  );
};

export default ForemanLedgerPage;