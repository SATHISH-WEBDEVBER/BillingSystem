import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateTotals } from "./utils/calculations.js";

// Components
import Navbar from "./Components/Navbar";
import BillPreview from "./Components/BillPreview";
import Dashboard from "./Components/Dashboard";
import SuccessPage from "./Components/SuccessPage";
import HomePage from "./Components/HomePage";
import BillDetail from "./Components/BillDetail";
import HistoryPage from "./Components/HistoryPage"; 
import ReportPage from "./Components/ReportPage"; 
import ReturnDashboard from "./Components/ReturnDashboard"; 
import Modal from "./Components/Modal";

// Global Styles
import "./styles/app.css"; 
import "./styles/bill.css"; 

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");       
  const [returnView, setReturnView] = useState("dashboard"); 
  
  const [recentBills, setRecentBills] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]); 
  const [recentUpdated, setRecentUpdated] = useState([]); 
  const [selectedBill, setSelectedBill] = useState(null); 
  const [editingId, setEditingId] = useState(null); 
  const [successData, setSuccessData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null, confirmText:'Confirm', cancelText:'Cancel' });

  const [billData, setBillData] = useState({ clientName: "", clientAddress: "", clientMobile: "", billNo: "", billDate: getTodayDate(), paymentMode: "Credit", shopMobile: "6385278892" });
  const [items, setItems] = useState([ { category: "", desc: "", qty: "", rate: "", unit: "Pcs" } ]);
  // ADDED: paymentMode to returnBillData
  const [returnBillData, setReturnBillData] = useState({ returnId: "", originalBillNo: "", returnDate: getTodayDate(), clientName: "", clientMobile: "", clientAddress: "", shopMobile: "6385278892", paymentMode: "Credit" });
  const [returnItems, setReturnItems] = useState([]);
  const [productCatalog, setProductCatalog] = useState([]);
  
  const fetchAllData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setProductCatalog(prodRes.data);
        
        if (!editingId) {
            const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
            setBillData(prev => ({ ...prev, billNo: billRes.data.nextBillNo }));
        }
        
        const recentRes = await axios.get('http://localhost:5000/api/bills');
        setRecentBills(recentRes.data);
        const recentRetRes = await axios.get('http://localhost:5000/api/returns');
        setRecentReturns(recentRetRes.data);
        const updRes = await axios.get('http://localhost:5000/api/updated');
        setRecentUpdated(updRes.data);
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, [refreshTrigger]);
  const triggerRefresh = () => { setRefreshTrigger(prev => prev + 1); };
  const totals = calculateTotals(items);
  const returnTotals = calculateTotals(returnItems);
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const showSuccessModal = (msg) => setModal({ isOpen: true, type: 'success', title: 'Success!', message: msg, onConfirm: null });
  const showErrorModal = (msg) => setModal({ isOpen: true, type: 'error', title: 'Error', message: msg, onConfirm: closeModal });

  const handleReturnExists = (existingReturn) => {
    setModal({
      isOpen: true, type: 'choice', title: 'Return Already Generated',
      message: `A return bill for ${existingReturn.originalBillNo} already exists.`,
      cancelText: 'Go Back', confirmText: 'View Return Bill',
      onConfirm: () => { closeModal(); handleViewBill(existingReturn); },
      onClose: closeModal
    });
  };

  const handleDataChange = (e) => setBillData({ ...billData, [e.target.name]: e.target.value });
  const addItem = () => setItems([...items, { category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const updated = [...items]; updated[index][field] = value;
    if (field === 'category') { updated[index].desc = ""; updated[index].rate = ""; updated[index].unit = ""; }
    if (field === 'desc') {
        const categoryData = productCatalog.find(cat => cat.category === updated[index].category);
        const itemData = categoryData?.items.find(i => i.name === value);
        if (itemData) { updated[index].rate = itemData.price; updated[index].unit = itemData.unit; }
    }
    setItems(updated);
  };

  const handleGenerateBill = async () => {
    try {
      const activeItems = items.filter(item => item.desc && item.desc.trim() !== "");
      if (activeItems.length === 0) return showErrorModal("Please add at least one product.");
      const invalidItems = activeItems.filter(item => !item.qty || Number(item.qty) <= 0);
      if (invalidItems.length > 0) return showErrorModal("Every product must have a quantity.");

      const currentBillNo = billData.billNo;
      const currentClient = billData.clientName || "Client";

      setItems(activeItems); 
      const finalTotals = calculateTotals(activeItems);

      const payload = { 
        billNo: billData.billNo, 
        date: billData.billDate, 
        paymentMode: billData.paymentMode, 
        client: { name: billData.clientName, mobile: billData.clientMobile, address: billData.clientAddress }, 
        items: activeItems.map(i => ({...i, amount: i.qty * i.rate})), 
        totals: finalTotals 
      };
      
      if (editingId) await axios.put(`http://localhost:5000/api/bills/update/${editingId}`, payload);
      else await axios.post('http://localhost:5000/api/bills/save', payload);
      
      await axios.put('http://localhost:5000/api/products/bulk-update', activeItems);
      setSuccessData({ billNo: currentBillNo, clientName: currentClient });
      triggerRefresh(); setView("success");
    } catch (error) { showErrorModal("Failed to save bill."); }
  };

  const handleGenerateReturn = async () => {
    try {
      if (returnItems.length === 0) return showErrorModal("No items selected for return.");
      const invalidReturnItems = returnItems.filter(item => !item.qty || Number(item.qty) <= 0);
      if (invalidReturnItems.length > 0) return showErrorModal("Every return item must have a quantity.");

      const currentReturnId = returnBillData.returnId;
      const currentClient = returnBillData.clientName || "Client";
      setReturnItems(returnItems); 
      const finalReturnTotals = calculateTotals(returnItems);

      // ADDED: paymentMode to payload
      const payload = { 
        originalBillNo: returnBillData.originalBillNo, 
        returnDate: returnBillData.returnDate, 
        paymentMode: returnBillData.paymentMode, 
        client: { name: returnBillData.clientName, mobile: returnBillData.clientMobile, address: returnBillData.clientAddress }, 
        items: returnItems.map(i => ({...i, amount: i.qty * i.rate})), 
        totals: finalReturnTotals 
      };
      
      if (editingId) await axios.put(`http://localhost:5000/api/returns/update/${editingId}`, payload);
      else await axios.post('http://localhost:5000/api/returns/save', payload);
      
      setSuccessData({ billNo: currentReturnId, clientName: currentClient });
      triggerRefresh(); setReturnView("success"); 
    } catch (error) { showErrorModal("Failed to save return bill"); }
  };

  const handleNewReturn = async () => {
    setLoading(true); setEditingId(null); setReturnItems([]);
    // Reset paymentMode to Credit or default
    setReturnBillData(prev => ({...prev, returnId: "", originalBillNo: "", clientName: "", clientMobile: "", clientAddress: "", paymentMode: "Credit"}));
    setReturnView("dashboard"); setLoading(false);
  };

  const handleNewBill = async () => {
    setLoading(true); setEditingId(null); setItems([{ category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
    const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
    setBillData({ clientName: "", clientAddress: "", clientMobile: "", billNo: billRes.data.nextBillNo, billDate: getTodayDate(), paymentMode: "Credit", shopMobile: "6385278892" });
    setView("dashboard"); navigate("/billing"); setLoading(false);
  };

  const handleViewBill = (bill) => { setSelectedBill(bill); navigate("/bill-detail"); };
  
  const handleEditBill = (bill) => {
    setEditingId(bill._id);
    if (bill.returnId) {
        // ADDED: load paymentMode for edit
        setReturnBillData({ returnId: bill.returnId, originalBillNo: bill.originalBillNo, returnDate: bill.returnDate, paymentMode: bill.paymentMode, clientName: bill.client.name, clientAddress: bill.client.address || "", clientMobile: bill.client.mobile, shopMobile: "6385278892" });
        setReturnItems(bill.items); setReturnView("dashboard"); navigate("/return");
    } else {
        setBillData({ clientName: bill.client.name, clientAddress: bill.client.address || "", clientMobile: bill.client.mobile, billNo: bill.billNo, billDate: bill.date, paymentMode: bill.paymentMode || "Credit", shopMobile: "6385278892" });
        setItems(bill.items); setView("dashboard"); navigate("/billing");
    }
  };

  const requestDeleteBill = (id) => { setModal({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: 'Are you sure?', onConfirm: () => confirmDeleteBill(id) }); };
  const confirmDeleteBill = async (id) => {
    try {
        if (selectedBill && selectedBill.returnId) await axios.delete(`http://localhost:5000/api/returns/delete/${id}`);
        else await axios.delete(`http://localhost:5000/api/bills/delete/${id}`);
        closeModal(); triggerRefresh(); 
        if (window.location.pathname === '/bill-detail') navigate('/');
    } catch (error) { closeModal(); showErrorModal("Failed to delete record"); }
  };

  // --- A4 EXPORT ---
  const exportBill = async (elementId, format, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const clone = element.cloneNode(true);
    Object.assign(clone.style, {
      position: 'fixed', top: '-10000px', left: '-10000px',
      transform: 'none', margin: '0', width: '210mm', height: '297mm',
      boxShadow: 'none', zIndex: '9999', backgroundColor: 'white'
    });

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, { scale: 3, useCORS: true, logging: false, windowWidth: 1600, width: clone.scrollWidth, height: clone.scrollHeight });
      if (format === 'pdf') { 
          const imgData = canvas.toDataURL("image/png"); 
          const pdf = new jsPDF("p", "mm", "a4"); 
          pdf.addImage(imgData, "PNG", 0, 0, 210, 297); 
          pdf.save(`${filename}.pdf`); 
      } else { 
          const link = document.createElement('a'); 
          link.download = `${filename}.png`; link.href = canvas.toDataURL("image/png"); link.click(); 
      }
    } catch (error) { console.error("Export Failed:", error); } 
    finally { document.body.removeChild(clone); }
  };

  const handleShare = async () => { const element = document.getElementById("bill-preview") || document.getElementById("detail-preview-content") || document.getElementById("return-preview"); const canvas = await html2canvas(element, { scale: 3 }); canvas.toBlob(async (blob) => { const file = new File([blob], `Bill.png`, { type: 'image/png' }); if (navigator.share) await navigator.share({ title: `Bill`, files: [file] }); else alert("Web Share not supported"); }); };

  if (loading) return <div style={{padding:"20px"}}>Loading App...</div>;

  const returnPreviewData = { ...returnBillData, billNo: returnBillData.returnId, billDate: returnBillData.returnDate };

  return (
    <div className="app-layout">
      <Navbar />
      <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onClose={closeModal} confirmText={modal.confirmText} cancelText={modal.cancelText}/>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<div className="scrollable-page"><HomePage recentBills={recentBills} recentReturns={recentReturns} recentUpdated={recentUpdated} onNavigate={(page, state) => navigate("/" + page, state)} onViewBill={handleViewBill} /></div>} />

          <Route path="/billing" element={
             <div className="fixed-page-container">
                <div className="editor-panel">
                  {view === 'dashboard' ? (
                    <Dashboard billData={billData} handleDataChange={handleDataChange} items={items} updateItem={updateItem} removeItem={removeItem} addItem={addItem} productCatalog={productCatalog} onGenerate={handleGenerateBill} />
                  ) : (
                    <SuccessPage billNo={successData?.billNo} onExport={(fmt)=>exportBill("bill-preview", fmt, `${successData?.clientName}-${successData?.billNo}`)} onShare={handleShare} onNewBill={handleNewBill} />
                  )}
                </div>
                <div className="preview-panel">
                  <BillPreview data={view === 'success' ? { ...billData, billNo: successData?.billNo, clientName: successData?.clientName } : billData} items={items} totals={totals} />
                </div>
             </div>
          } />

          <Route path="/bill-detail" element={selectedBill ? <BillDetail bill={selectedBill} onExport={(fmt, id) => { const num = selectedBill.updatedBillId || selectedBill.returnId || selectedBill.billNo; exportBill(id, fmt, `${selectedBill.client.name}-${num}`); }} onShare={handleShare} onEdit={handleEditBill} onDelete={requestDeleteBill} /> : <div style={{padding:20}}>No bill selected</div>} />
          <Route path="/history" element={<div className="scrollable-page"><HistoryPage onViewBill={handleViewBill} refreshTrigger={refreshTrigger} /></div>} />
          <Route path="/summary" element={<div className="scrollable-page"><ReportPage /></div>} />

          <Route path="/return" element={
             <div className="fixed-page-container">
                <div className="editor-panel">
                   {returnView === 'dashboard' ? (
                     <ReturnDashboard productCatalog={productCatalog} onGenerateReturn={handleGenerateReturn} onError={showErrorModal} returnData={returnBillData} setReturnData={setReturnBillData} returnItems={returnItems} setReturnItems={setReturnItems} onReturnExists={handleReturnExists} />
                   ) : (
                     <SuccessPage title="Return Saved Successfully" subtitle={`Return Bill #${successData?.billNo} saved.`} billNo={successData?.billNo} onExport={(fmt)=>exportBill("return-preview", fmt, `${successData?.clientName}-${successData?.billNo}`)} onShare={handleShare} onNewBill={handleNewReturn} />
                   )}
                </div>
                <div className="preview-panel"><div id="return-preview"><BillPreview data={returnView === 'success' ? { ...returnPreviewData, billNo: successData?.billNo, clientName: successData?.clientName } : returnPreviewData} items={returnItems} totals={returnTotals} /></div></div>
             </div>
          } />
        </Routes>
      </div>
    </div>
  );
}