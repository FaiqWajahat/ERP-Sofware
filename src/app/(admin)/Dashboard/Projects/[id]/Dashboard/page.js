'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios'; 
import { 
  ArrowLeft, Plus, Trash2, TrendingUp, 
  LayoutGrid, Wallet, Receipt,
  X, AlertTriangle, MapPin, Calendar, User, PieChart,
  Loader2, BarChart3, FileText, Tag, Banknote
} from 'lucide-react';
import DashboardPageHeader from '@/Components/DashboardPageHeader';
import { errorToast, successToast } from '@/lib/toast';
import CustomLoader from '@/Components/CustomLoader';

// --- COMPONENT: SKELETON LOADER ---
const ProjectSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-48 bg-base-200 rounded-lg w-full"></div>
    <div className="flex gap-4 overflow-hidden">
      <div className="h-10 bg-base-200 rounded-full w-32"></div>
      <div className="h-10 bg-base-200 rounded-full w-32"></div>
      <div className="h-10 bg-base-200 rounded-full w-32"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-64 bg-base-200 rounded-lg w-full lg:col-span-2"></div>
      <div className="h-64 bg-base-200 rounded-lg w-full"></div>
    </div>
  </div>
);

export default function ProjectDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const projectId = params?.id;
  const currentViewParam = searchParams.get('view') || 'overview';
  
  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });

  // Processing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Forms
  const initialFormState = { date: new Date().toISOString().split('T')[0], description: '', amount: '' };
  const [expenseForm, setExpenseForm] = useState(initialFormState);
  const [incomeForm, setIncomeForm] = useState(initialFormState);

  // Quick Tags
  const expenseTags = ["Material Purchase", "Labor Cost", "Transportation", "Food", "Fuel", "Site Equipment"];
  const incomeTags = ["Client Payment", "Advance", "Refund", "Adjustment"];

  // Styles
  const primaryBg = { backgroundColor: 'var(--primary-color)' };
  const primaryText = { color: 'var(--primary-color)' };

  // --- API CALLS ---
  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    if(!project) setLoading(true); 
    try {
      const response = await axios.get(`/api/project/${projectId}/get`);
      if (response.data.success) {
        setProject(response.data.project);
      } else {
        errorToast(response.data.message);
        router.back();
      }
    } catch (error) {
      errorToast("Failed to load project data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    if(currentViewParam) {
        const formatted = currentViewParam.charAt(0).toUpperCase() + currentViewParam.slice(1);
        setActiveTab(formatted);
    }
  }, [currentViewParam]);

  // --- HANDLERS ---

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const params = new URLSearchParams(searchParams);
    params.set('view', tabName.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const appendDescription = (text, type) => {
    if (type === 'expense') {
      setExpenseForm(prev => ({ ...prev, description: text }));
    } else {
      setIncomeForm(prev => ({ ...prev, description: text }));
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return errorToast("Please enter a valid amount");
    if (!expenseForm.description.trim()) return errorToast("Description is required");
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/project/${projectId}/expenses`, {
        date: expenseForm.date,
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount)
      });
      if (response.data.success) {
        successToast("Expense added");
        setProject(response.data.data);
        setExpenseForm(initialFormState);
        setIsAddExpenseOpen(false);
      }
    } catch (error) {
      errorToast("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) return errorToast("Please enter a valid amount");
    if (!incomeForm.description.trim()) return errorToast("Description is required");

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/project/${projectId}/incomes`, {
        date: incomeForm.date,
        description: incomeForm.description.trim(),
        amount: parseFloat(incomeForm.amount)
      });
      if (response.data.success) {
        successToast("Income added");
        setProject(response.data.data);
        setIncomeForm(initialFormState);
        setIsAddIncomeOpen(false);
      }
    } catch (error) {
      errorToast("Failed to add income");
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const endpoint = deleteModal.type === 'expense' 
        ? `/api/project/${projectId}/expenses/${deleteModal.id}` 
        : `/api/project/${projectId}/incomes/${deleteModal.id}`;
      
      const response = await axios.delete(endpoint);
      if (response.data.success) {
        successToast("Record deleted");
        setProject(response.data.data);
        setDeleteModal({ isOpen: false, id: null, type: null });
      }
    } catch (error) {
      errorToast("Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- CALCULATIONS (Memoized) ---
  const totals = useMemo(() => {
    if (!project) return { totalExpenses: 0, totalIncome: 0, balance: 0 };
    const totalExpenses = project.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const totalIncome = project.income?.reduce((sum, i) => sum + i.amount, 0) || 0;
    return { totalExpenses, totalIncome, balance: totalIncome - totalExpenses };
  }, [project]);

  const filteredData = useMemo(() => {
    if (!project) return [];
    let data = activeTab === 'Expenses' ? project.expenses : project.income;
    if (!data) return [];
    return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [project, activeTab]);

  const recentActivity = useMemo(() => {
    if (!project) return [];
    const exps = (project.expenses || []).map(e => ({ ...e, type: 'expense' }));
    const incs = (project.income || []).map(i => ({ ...i, type: 'income' }));
    return [...exps, ...incs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  }, [project]);

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Projects", href: "/Dashboard/Projects" },
    { name: project?.name || "Loading...", href: "#" },
  ];

  if (loading) return <CustomLoader text="Loading project details..." />;
  
  if (!project) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <AlertCircle size={48} className="text-base-content/30 mb-4" />
      <h2 className="text-xl font-bold text-base-content">Project Not Found</h2>
      <button onClick={() => router.back()} className="btn btn-sm mt-4">Go Back</button>
    </div>
  );

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={project.name} />

      {/* --- 1. HEADER CARD --- */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col justify-center md:justify-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-ghost badge-sm text-xs font-mono opacity-70">Started: {new Date(project.startDate).toLocaleDateString()}</span>
              <span className={`badge badge-sm text-xs text-white ${totals.balance >= 0 ? 'badge-success' : 'badge-warning'}`}>
                {totals.balance >= 0 ? 'Profitable' : 'Deficit'}
              </span>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-base-content uppercase leading-tight">{project.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs md:text-sm text-base-content/70">
               <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md"><User size={14}/> {project.clientName}</span>
               <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md"><MapPin size={14}/> {project.location || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-200 text-center">
               <p className="text-[10px] uppercase font-bold text-base-content/50">Budget</p>
               <p className="text-sm md:text-lg font-bold text-base-content truncate">{project.estimatedBudget?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-200 text-center">
               <p className="text-[10px] uppercase font-bold text-base-content/50">Income</p>
               <p className="text-sm md:text-lg font-bold text-success truncate">+{totals.totalIncome.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-base-200/50 rounded-lg border border-base-200 text-center">
               <p className="text-[10px] uppercase font-bold text-base-content/50">Expense</p>
               <p className="text-sm md:text-lg font-bold text-error truncate">-{totals.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg border text-center" style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 8%, transparent)', borderColor: 'var(--primary-color)' }}>
               <p className="text-[10px] uppercase font-bold" style={primaryText}>Net</p>
               <p className="text-sm md:text-lg font-bold truncate" style={primaryText}>{totals.balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-xs mb-1 opacity-70">
            <span>Budget Utilization</span>
            <span>{project.estimatedBudget ? ((totals.totalExpenses / project.estimatedBudget) * 100).toFixed(1) : 0}%</span>
          </div>
          <progress className="progress w-full h-2" value={totals.totalExpenses} max={project.estimatedBudget || 100} style={{ color: 'var(--primary-color)' }}></progress>
        </div>
      </div>

      {/* --- 2. TABS & CONTROLS --- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto overflow-x-auto pb-1 hide-scrollbar">
            <div className="tabs tabs-boxed bg-base-100 p-1 border border-base-200 w-max md:w-fit flex-nowrap">
              {['Overview', 'Expenses', 'Income'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => handleTabChange(tab)} 
                  className={`tab h-10 px-4 md:px-6 text-sm ${activeTab === tab ? 'tab-active font-bold text-white' : 'text-base-content/70'}`} 
                  style={activeTab === tab ? primaryBg : {}}
                >
                  {tab === 'Overview' && <LayoutGrid size={16} className="mr-2"/>}
                  {tab === 'Expenses' && <Receipt size={16} className="mr-2"/>}
                  {tab === 'Income' && <Wallet size={16} className="mr-2"/>}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
             <Link href={`/Dashboard/Projects/${projectId}/Summary`}>
                <button className="btn btn-sm text-white border-none shadow-md" style={primaryBg}><BarChart3 size={16}/> Report</button>
             </Link>
          </div>
        </div>

        {/* --- 3. TAB CONTENT --- */}
        
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="lg:col-span-2 bg-base-100 border border-base-200 rounded-lg overflow-hidden shadow-sm">
               <div className="p-4 border-b border-base-200 bg-base-200/30"><h3 className="font-bold text-base-content flex items-center gap-2"><TrendingUp size={18}/> Recent Activity</h3></div>
               <div className="overflow-x-auto">
                 <table className="table w-full min-w-[500px]">
                   <thead className="bg-base-200/50 text-xs uppercase text-base-content/60"><tr><th>Date</th><th>Description</th><th>Type</th><th className="text-right">Amount</th></tr></thead>
                   <tbody>
                     {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                       <tr key={idx} className="hover border-base-200 text-sm">
                         <td className="opacity-70">{new Date(item.date).toLocaleDateString()}</td>
                         <td className="font-medium">{item.description}</td>
                         <td><span className={`badge badge-sm badge-outline ${item.type === 'expense' ? 'badge-error' : 'badge-success'}`}>{item.type}</span></td>
                         <td className={`text-right font-bold font-mono ${item.type === 'expense' ? 'text-error' : 'text-success'}`}>{item.type === 'expense' ? '-' : '+'} {item.amount.toLocaleString()}</td>
                       </tr>
                     )) : <tr><td colSpan={4} className="text-center py-10 opacity-50">No activity yet</td></tr>}
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
               <div className="bg-base-100 p-5 rounded-lg border border-base-200 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart size={18}/> Financial Health</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center p-2 bg-base-200/50 rounded"><span className="opacity-70">Expense Ratio</span><span className="font-bold">{project.estimatedBudget ? ((totals.totalExpenses / project.estimatedBudget) * 100).toFixed(1) : 0}%</span></div>
                    <div className="flex justify-between items-center p-2 bg-base-200/50 rounded"><span className="opacity-70">Remaining Budget</span><span className="font-bold">{(project.estimatedBudget - totals.totalExpenses).toLocaleString()}</span></div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* EXPENSES / INCOME TABS */}
        {(activeTab === 'Expenses' || activeTab === 'Income') && (
          <div className="bg-base-100 border border-base-200 rounded-lg overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
             <div className="p-4 border-b border-base-200 bg-base-200/30 flex justify-between items-center">
               <h3 className="font-bold text-base-content flex items-center gap-2 text-sm md:text-base">
                 {activeTab === 'Expenses' ? <><Receipt size={18}/> Project Expenses</> : <><Wallet size={18}/> Project Income</>}
               </h3>
               {/* --- MOVED BUTTONS HERE --- */}
               {activeTab === 'Expenses' && (
                 <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-sm btn-error text-white shadow-md text-xs md:text-sm">
                   <Plus size={16}/> Add Expense
                 </button>
               )}
               {activeTab === 'Income' && (
                 <button onClick={() => setIsAddIncomeOpen(true)} className="btn btn-sm btn-success text-white shadow-md text-xs md:text-sm">
                   <Plus size={16}/> Add Income
                 </button>
               )}
             </div>

             <div className="overflow-x-auto w-full max-h-[600px] overflow-y-auto">
               <table className="table w-full min-w-[700px] table-pin-rows">
                 <thead className="bg-base-200/90 backdrop-blur text-xs uppercase z-10">
                   <tr><th>Date</th><th>Description</th><th className="text-right">Amount (SAR)</th><th className="text-center w-16">Action</th></tr>
                 </thead>
                 <tbody>
                   {filteredData.length > 0 ? filteredData.map((item, idx) => (
                     <tr key={item._id || idx} className="hover border-base-200 text-sm group">
                       <td className="w-32 font-mono text-xs opacity-70">{new Date(item.date).toLocaleDateString()}</td>
                       <td className="font-medium">{item.description}</td>
                       <td className={`text-right font-bold font-mono ${activeTab === 'Expenses' ? 'text-error' : 'text-success'}`}>{activeTab === 'Expenses' ? '-' : '+'} {item.amount.toLocaleString()}</td>
                       <td className="text-center"><button onClick={() => setDeleteModal({ isOpen: true, id: item._id, type: activeTab === 'Expenses' ? 'expense' : 'income' })} className="btn btn-ghost btn-xs text-error opacity-50 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button></td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={4} className="text-center py-16">
                         <div className="flex flex-col items-center opacity-40">
                           <FileText size={48} className="mb-2"/>
                           <p>No records found</p>
                         </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD EXPENSE --- */}
      <dialog className={`modal modal-bottom sm:modal-middle ${isAddExpenseOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 w-full sm:w-11/12 max-w-md shadow-2xl flex flex-col max-h-[90vh]">
          <div className="bg-base-200/50 p-5 border-b border-base-200 flex justify-between items-center flex-none">
            <div><h3 className="font-bold text-lg text-base-content flex items-center gap-2"><div className="p-2 bg-error/10 rounded-full text-error"><Receipt size={20}/></div> New Expense</h3><p className="text-xs text-base-content/60 mt-1 pl-11">Record a new project cost</p></div>
            <button onClick={() => setIsAddExpenseOpen(false)} className="btn btn-sm btn-circle btn-ghost hover:bg-base-300"><X size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleAddExpense} className="p-6 space-y-5">
              <div className="form-control"><label className="label text-xs font-bold text-base-content/70 pb-1">AMOUNT</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-base-content/40 font-bold text-sm">SAR</span></div><input type="number" step="0.01" min="0" className="input input-bordered w-full pl-12 focus:outline-none focus:border-error text-lg font-mono font-bold text-error bg-base-100" placeholder="0.00" required value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} /></div></div>
              <div className="form-control"><label className="label text-xs font-bold text-base-content/70 pb-1">DATE</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40"><Calendar size={16}/></div><input type="date" className="input input-bordered w-full pl-10 focus:outline-none focus:border-error bg-base-100 text-sm" required value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} /></div></div>
              <div className="form-control"><label className="label text-xs font-bold text-base-content/70 pb-1">DESCRIPTION</label><div className="relative"><div className="absolute top-3 left-3 pointer-events-none text-base-content/40"><FileText size={16}/></div><textarea className="textarea textarea-bordered w-full pl-10 h-24 focus:outline-none focus:border-error bg-base-100 text-sm leading-relaxed" placeholder="What was this expense for?" required value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}></textarea></div><div className="flex flex-wrap gap-2 mt-3">{expenseTags.map(tag => (<button key={tag} type="button" onClick={() => appendDescription(tag, 'expense')} className="badge badge-ghost badge-sm hover:bg-base-300 cursor-pointer border-base-300 text-xs py-2 h-auto">{tag}</button>))}</div></div>
              <div className="pt-2 pb-2"><button type="submit" disabled={isSubmitting} className="btn btn-error w-full text-white shadow-lg shadow-error/20">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Expense Record'}</button></div>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button onClick={() => setIsAddExpenseOpen(false)}>close</button></form>
      </dialog>

      {/* --- MODAL 2: ADD INCOME --- */}
      <dialog className={`modal modal-bottom sm:modal-middle ${isAddIncomeOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 w-full sm:w-11/12 max-w-md shadow-2xl flex flex-col max-h-[90vh]">
          <div className="bg-base-200/50 p-5 border-b border-base-200 flex justify-between items-center flex-none">
            <div><h3 className="font-bold text-lg text-base-content flex items-center gap-2"><div className="p-2 bg-success/10 rounded-full text-success"><Banknote size={20}/></div> New Income</h3><p className="text-xs text-base-content/60 mt-1 pl-11">Record a payment received</p></div>
            <button onClick={() => setIsAddIncomeOpen(false)} className="btn btn-sm btn-circle btn-ghost hover:bg-base-300"><X size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleAddIncome} className="p-6 space-y-5">
              <div className="form-control"><label className="label text-xs font-bold text-base-content/70 pb-1">AMOUNT</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-base-content/40 font-bold text-sm">SAR</span></div><input type="number" step="0.01" min="0" className="input input-bordered w-full pl-12 focus:outline-none focus:border-success text-lg font-mono font-bold text-success bg-base-100" placeholder="0.00" required value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} /></div></div>
              <div className="form-control"><label className="label text-xs font-bold text-base-content/70 pb-1">DATE</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40"><Calendar size={16}/></div><input type="date" className="input input-bordered w-full pl-10 focus:outline-none focus:border-success bg-base-100 text-sm" required value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} /></div></div>
              <div className="form-control"><label className="label text-xs font-bold text-base-content/70 pb-1">DESCRIPTION</label><div className="relative"><div className="absolute top-3 left-3 pointer-events-none text-base-content/40"><Tag size={16}/></div><textarea className="textarea textarea-bordered w-full pl-10 h-24 focus:outline-none focus:border-success bg-base-100 text-sm leading-relaxed" placeholder="Source of funds..." required value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})}></textarea></div><div className="flex flex-wrap gap-2 mt-3">{incomeTags.map(tag => (<button key={tag} type="button" onClick={() => appendDescription(tag, 'income')} className="badge badge-ghost badge-sm hover:bg-base-300 cursor-pointer border-base-300 text-xs py-2 h-auto">{tag}</button>))}</div></div>
              <div className="pt-2 pb-2"><button type="submit" disabled={isSubmitting} className="btn btn-success w-full text-white shadow-lg shadow-success/20">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Income Record'}</button></div>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button onClick={() => setIsAddIncomeOpen(false)}>close</button></form>
      </dialog>

      {/* --- MODAL 3: DELETE CONFIRMATION --- */}
      <dialog className={`modal modal-bottom sm:modal-middle ${deleteModal.isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-base-100 p-0 overflow-hidden w-full sm:w-11/12 max-w-sm">
          <div className="p-6 md:p-8 text-center bg-base-100">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><AlertTriangle size={32} /></div>
            <h3 className="text-lg md:text-xl font-bold text-base-content">Delete Record?</h3>
            <p className="text-sm text-base-content/70 mt-3 leading-relaxed">This will remove the transaction permanently. This cannot be undone.</p>
          </div>
          <div className="flex p-4 gap-3 bg-base-200/50 border-t border-base-200">
            <button className="btn btn-ghost text-base-content/70 flex-1 h-11 rounded-md" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>Cancel</button>
            <button className="btn btn-error text-white flex-1 h-11 shadow-lg rounded-md" disabled={isDeleting} onClick={executeDelete}>{isDeleting ? <Loader2 className="animate-spin"/> : 'Yes, Delete'}</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}>close</button></form>
      </dialog>
    </>
  );
}