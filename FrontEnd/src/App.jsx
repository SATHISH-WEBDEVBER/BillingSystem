import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateTotals } from "./utils/calculations";

// Components
import Navbar from "./components/Navbar";
import BillPreview from "./components/BillPreview";
import Dashboard from "./components/Dashboard";
import SuccessPage from "./components/SuccessPage";
import HomePage from "./components/HomePage";
import BillDetail from "./components/BillDetail";
import HistoryPage from "./components/HistoryPage"; 
import ReportPage from "./components/ReportPage"; 
import ReturnDashboard from "./components/ReturnDashboard"; 
import Modal from "./components/Modal";

// Global Styles
import "./styles/app.css"; 
import "./styles/bill.css"; 

export default function App() {
  return (
    // Wrap the entire app in Router to enable navigation
    <Router>
      <AppContent />
    </Router>
  );
}

// Main application logic separated to allow using 'useNavigate' hook
function AppContent() {
  const navigate = useNavigate();
  // Utility to get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(true);
  
  // View states to toggle between editing and success screens
  const [view, setView] = useState("dashboard");       
  const [returnView, setReturnView] = useState("dashboard"); 
  
  // Data states for dashboard lists
  const [recentBills, setRecentBills] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]); 
  const [recentUpdated, setRecentUpdated] = useState([]); 
  
  // State for managing selected item in detail view and editing
  const [selectedBill, setSelectedBill] = useState(null); 
  const [editingId, setEditingId] = useState(null); 
  
  const [successData, setSuccessData] = useState(null);
  // Trigger to force re-fetching data (e.g., after save/delete)
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  // Global modal state
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null, confirmText:'Confirm', cancelText:'Cancel' });

  // Form states for creating new bills
  const [billData, setBillData] = useState({ clientName: "", clientAddress: "", clientMobile: "", billNo: "", billDate: getTodayDate(), paymentMode: "Credit", shopMobile: "6385278892" });
  const [items, setItems] = useState([ { category: "", desc: "", qty: "", rate: "", unit: "Pcs" } ]);
  
  // Form states for return bills
  const [returnBillData, setReturnBillData] = useState({ returnId: "", originalBillNo: "", returnDate: getTodayDate(), clientName: "", clientMobile: "", clientAddress: "", shopMobile: "6385278892", paymentMode: "Return Note" });
  const [returnItems, setReturnItems] = useState([]);
  const [productCatalog, setProductCatalog] = useState([]);
  
  // Fetch initial data (Products, Dashboard Stats, Next Bill No)
  const fetchAllData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setProductCatalog(prodRes.data);
        
        // Only fetch next bill number if creating a new bill (not editing)
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
  
  // Real-time calculation of bill totals
  const totals = calculateTotals(items);
  const returnTotals = calculateTotals(returnItems);
  
  // Modal Helpers
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const showSuccessModal = (msg) => setModal({ isOpen: true, type: 'success', title: 'Success!', message: msg, onConfirm: null });
  const showErrorModal = (msg) => setModal({ isOpen: true, type: 'error', title: 'Error', message: msg, onConfirm: closeModal });

  // Handle case where user tries to return a bill that was already returned
  const handleReturnExists = (existingReturn) => {
    setModal({
      isOpen: true, type: 'choice', title: 'Return Already Generated',
      message: `A return bill for ${existingReturn.originalBillNo} already exists.`,
      cancelText: 'Go Back', confirmText: 'View Return Bill',
      onConfirm: () => { closeModal(); handleViewBill(existingReturn); },
      onClose: closeModal
    });
  };

  // Form Handlers
  const handleDataChange = (e) => setBillData({ ...billData, [e.target.name]: e.target.value });
  const addItem = () => setItems([...items, { category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  
  // Update item in list. If Product is selected, auto-fill price/unit.
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

  // Logic to save a bill (Create or Update)
  const handleGenerateBill = async () => {
    try {
      // Filter out empty rows
      const activeItems = items.filter(item => item.desc && item.desc.trim() !== "");
      if (activeItems.length === 0) return showErrorModal("Please add at least one product.");
      // Validate quantities
      const invalidItems = activeItems.filter(item => !item.qty || Number(item.qty) <= 0);
      if (invalidItems.length > 0) return showErrorModal("Every product must have a quantity.");

      const currentBillNo = billData.billNo;
      const currentClient = billData.clientName || "Client";

      setItems(activeItems); 
      const finalTotals = calculateTotals(activeItems);

      const payload = { billNo: billData.billNo, date: billData.billDate, client: { name: billData.clientName, mobile: billData.clientMobile, address: billData.clientAddress }, items: activeItems.map(i => ({...i, amount: i.qty * i.rate})), totals: finalTotals };
      
      // Send to backend
      if (editingId) await axios.put(`http://localhost:5000/api/bills/update/${editingId}`, payload);
      else await axios.post('http://localhost:5000/api/bills/save', payload);
      
      // Update inventory prices
      await axios.put('http://localhost:5000/api/products/bulk-update', activeItems);
      
      setSuccessData({ billNo: currentBillNo, clientName: currentClient });
      triggerRefresh(); setView("success");
    } catch (error) { showErrorModal("Failed to save bill."); }
  };

  // Logic to save a return transaction
  const handleGenerateReturn = async () => {
    try {
      if (returnItems.length === 0) return showErrorModal("No items selected for return.");
      const invalidReturnItems = returnItems.filter(item => !item.qty || Number(item.qty) <= 0);
      if (invalidReturnItems.length > 0) return showErrorModal("Every return item must have a quantity.");

      const currentReturnId = returnBillData.returnId;
      const currentClient = returnBillData.clientName || "Client";
      setReturnItems(returnItems); 
      const finalReturnTotals = calculateTotals(returnItems);

      const payload = { originalBillNo: returnBillData.originalBillNo, returnDate: returnBillData.returnDate, client: { name: returnBillData.clientName, mobile: returnBillData.clientMobile, address: returnBillData.clientAddress }, items: returnItems.map(i => ({...i, amount: i.qty * i.rate})), totals: finalReturnTotals };
      
      if (editingId) await axios.put(`http://localhost:5000/api/returns/update/${editingId}`, payload);
      else await axios.post('http://localhost:5000/api/returns/save', payload);
      
      setSuccessData({ billNo: currentReturnId, clientName: currentClient });
      triggerRefresh(); setReturnView("success"); 
    } catch (error) { showErrorModal("Failed to save return bill"); }
  };

  // Reset state for creating a new return
  const handleNewReturn = async () => {
    setLoading(true); setEditingId(null); setReturnItems([]);
    setReturnBillData(prev => ({...prev, returnId: "", originalBillNo: "", clientName: "", clientMobile: "", clientAddress: ""}));
    setReturnView("dashboard"); setLoading(false);
  };

  // Reset state for creating a new bill
  const handleNewBill = async () => {
    setLoading(true); setEditingId(null); setItems([{ category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
    const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
    setBillData({ clientName: "", clientAddress: "", clientMobile: "", billNo: billRes.data.nextBillNo, billDate: getTodayDate(), paymentMode: "Credit", shopMobile: "6385278892" });
    setView("dashboard"); navigate("/billing"); setLoading(false);
  };

  // Navigation Handlers
  const handleViewBill = (bill) => { setSelectedBill(bill); navigate("/bill-detail"); };
  
  // Populate form with existing data for editing
  const handleEditBill = (bill) => {
    setEditingId(bill._id);
    if (bill.returnId) {
        setReturnBillData({ returnId: bill.returnId, originalBillNo: bill.originalBillNo, returnDate: bill.returnDate, clientName: bill.client.name, clientAddress: bill.client.address || "", clientMobile: bill.client.mobile, shopMobile: "6385278892", paymentMode: "Return Note" });
        setReturnItems(bill.items); setReturnView("dashboard"); navigate("/return");
    } else {
        setBillData({ clientName: bill.client.name, clientAddress: bill.client.address || "", clientMobile: bill.client.mobile, billNo: bill.billNo, billDate: bill.date, paymentMode: "Credit", shopMobile: "6385278892" });
        setItems(bill.items); setView("dashboard"); navigate("/billing");
    }
  };

  // Delete Logic
  const requestDeleteBill = (id) => { setModal({ isOpen: true, type: 'confirm', title: 'Confirm Deletion', message: 'Are you sure?', onConfirm: () => confirmDeleteBill(id) }); };
  const confirmDeleteBill = async (id) => {
    try {
        if (selectedBill && selectedBill.returnId) await axios.delete(`http://localhost:5000/api/returns/delete/${id}`);
        else await axios.delete(`http://localhost:5000/api/bills/delete/${id}`);
        closeModal(); triggerRefresh(); 
        if (window.location.pathname === '/bill-detail') navigate('/');
    } catch (error) { closeModal(); showErrorModal("Failed to delete record"); }
  };

  // --- FIXED A4 EXPORT FOR MOBILE & DESKTOP ---
  // Captures the DOM element as an image/PDF regardless of screen size
  const exportBill = async (elementId, format, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // 1. Create a CLONE of the bill (invisible to user)
    const clone = element.cloneNode(true);
    
    // 2. Style the clone to be perfect A4 and invisible
    Object.assign(clone.style, {
      position: 'fixed',
      top: '-10000px',
      left: '-10000px',
      transform: 'none', // Remove any scaling
      margin: '0',
      width: '210mm',
      height: '297mm',
      boxShadow: 'none',
      zIndex: '9999',
      backgroundColor: 'white'
    });

    document.body.appendChild(clone);

    try {
      // 3. Capture the CLONE
      // FIX: 'windowWidth: 1600' forces the capture to think it's on a Desktop
      // This ensures the Mobile CSS (media queries) are IGNORED.
      const canvas = await html2canvas(clone, { 
          scale: 3, // High Resolution
          useCORS: true,
          logging: false,
          windowWidth: 1600, // Force Desktop Width
          width: clone.scrollWidth,
          height: clone.scrollHeight
      });

      if (format === 'pdf') { 
          const imgData = canvas.toDataURL("image/png"); 
          const pdf = new jsPDF("p", "mm", "a4"); 
          const pdfWidth = 210; 
          const pdfHeight = 297; 
          
          // 4. Fill the PDF perfectly
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight); 
          pdf.save(`${filename}.pdf`); 
      } else { 
          const link = document.createElement('a'); 
          link.download = `${filename}.png`; 
          link.href = canvas.toDataURL("image/png"); 
          link.click(); 
      }
    } catch (error) {
      console.error("Export Failed:", error);
    } finally {
      // 5. Cleanup
      document.body.removeChild(clone);
    }
  };

  // Share functionality using native Web Share API
  const handleShare = async () => { const element = document.getElementById("bill-preview") || document.getElementById("detail-preview-content") || document.getElementById("return-preview"); const canvas = await html2canvas(element, { scale: 3 }); canvas.toBlob(async (blob) => { const file = new File([blob], `Bill.png`, { type: 'image/png' }); if (navigator.share) await navigator.share({ title: `Bill`, files: [file] }); else alert("Web Share not supported"); }); };

  if (loading) return <div style={{padding:"20px"}}>Loading App...</div>;

  const returnPreviewData = { ...returnBillData, billNo: returnBillData.returnId, billDate: returnBillData.returnDate, paymentMode: "Return Note" };

  return (
    <div className="app-layout">
      <Navbar />
      <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onClose={closeModal} confirmText={modal.confirmText} cancelText={modal.cancelText}/>

      <div className="main-content">
        <Routes>
          {/* Route: Home Dashboard */}
          <Route path="/" element={<div className="scrollable-page"><HomePage recentBills={recentBills} recentReturns={recentReturns} recentUpdated={recentUpdated} onNavigate={(page, state) => navigate("/" + page, state)} onViewBill={handleViewBill} /></div>} />

          {/* Route: Create/Edit Bill */}
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

          {/* Route: View Bill Details */}
          <Route path="/bill-detail" element={selectedBill ? <BillDetail bill={selectedBill} onExport={(fmt, id) => { const num = selectedBill.updatedBillId || selectedBill.returnId || selectedBill.billNo; exportBill(id, fmt, `${selectedBill.client.name}-${num}`); }} onShare={handleShare} onEdit={handleEditBill} onDelete={requestDeleteBill} /> : <div style={{padding:20}}>No bill selected</div>} />
          
          {/* Route: History */}
          <Route path="/history" element={<div className="scrollable-page"><HistoryPage onViewBill={handleViewBill} refreshTrigger={refreshTrigger} /></div>} />
          
          {/* Route: Reports */}
          <Route path="/summary" element={<div className="scrollable-page"><ReportPage /></div>} />

          {/* Route: Returns */}
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