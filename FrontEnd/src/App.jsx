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
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");       
  const [returnView, setReturnView] = useState("dashboard"); 
  
  const [recentBills, setRecentBills] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]); 
  const [selectedBill, setSelectedBill] = useState(null); 
  const [editingId, setEditingId] = useState(null); 

  // --- MODAL STATE (Updated for custom buttons) ---
  const [modal, setModal] = useState({
    isOpen: false, type: 'success', title: '', message: '', onConfirm: null,
    confirmText: 'Confirm', cancelText: 'Cancel' 
  });

  // Billing Form State
  const [billData, setBillData] = useState({
    clientName: "MOHAN",
    clientAddress: "Kavandampatty",
    clientMobile: "99xxxxxxxxx",
    billNo: "", 
    billDate: getTodayDate(),
    paymentMode: "Credit",
    shopMobile: "6385278892"
  });
  const [items, setItems] = useState([
    { category: "", desc: "", qty: "", rate: "", unit: "Pcs" } 
  ]);

  // Return Form State
  const [returnBillData, setReturnBillData] = useState({
    returnId: "", 
    originalBillNo: "",
    returnDate: getTodayDate(),
    clientName: "",
    clientMobile: "",
    clientAddress: "",
    shopMobile: "6385278892",
    paymentMode: "Return Note"
  });
  const [returnItems, setReturnItems] = useState([]);

  const [productCatalog, setProductCatalog] = useState([]);
  
  // --- LOAD INITIAL DATA ---
  const fetchAllData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setProductCatalog(prodRes.data);
        
        if (!editingId) {
            const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
            setBillData(prev => ({ ...prev, billNo: billRes.data.nextBillNo }));
        }

        if (!editingId || (editingId && !returnBillData.returnId)) {
            const returnRes = await axios.get('http://localhost:5000/api/returns/next-number');
            setReturnBillData(prev => ({ ...prev, returnId: returnRes.data.nextReturnId }));
        }

        const recentRes = await axios.get('http://localhost:5000/api/bills');
        setRecentBills(recentRes.data);

        const recentRetRes = await axios.get('http://localhost:5000/api/returns');
        setRecentReturns(recentRetRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
  };

  useEffect(() => { fetchAllData(); }, []);

  const totals = calculateTotals(items);
  const returnTotals = calculateTotals(returnItems);

  // --- MODAL HELPERS ---
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const showSuccessModal = (msg) => setModal({ isOpen: true, type: 'success', title: 'Success!', message: msg, onConfirm: null });
  const showErrorModal = (msg) => setModal({ isOpen: true, type: 'error', title: 'Error', message: msg, onConfirm: closeModal });

  // --- HANDLE DUPLICATE RETURN (New Logic) ---
  const handleReturnExists = (existingReturn) => {
    setModal({
      isOpen: true,
      type: 'choice', // Uses the new Choice Mode
      title: 'Return Already Generated',
      message: `A return bill for Invoice #${existingReturn.originalBillNo} already exists (Return #${existingReturn.returnId}).`,
      cancelText: 'Go Back',
      confirmText: 'View Return Bill',
      onConfirm: () => {
        closeModal();
        handleViewBill(existingReturn); // Go to Detail Page
      },
      onClose: closeModal // "Go Back" just closes
    });
  };

  // --- BILLING ACTIONS ---
  const handleDataChange = (e) => setBillData({ ...billData, [e.target.name]: e.target.value });
  const addItem = () => setItems([...items, { category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
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
      const validItems = items.filter(item => item.desc && item.desc.trim() !== "");
      if (validItems.length === 0) return showErrorModal("Please add at least one product.");
      const payload = {
        billNo: billData.billNo,
        date: billData.billDate,
        client: { name: billData.clientName, mobile: billData.clientMobile, address: billData.clientAddress },
        items: validItems.map(i => ({...i, amount: i.qty * i.rate})),
        totals
      };
      if (editingId) await axios.put(`http://localhost:5000/api/bills/update/${editingId}`, payload);
      else await axios.post('http://localhost:5000/api/bills/save', payload);
      
      await axios.put('http://localhost:5000/api/products/bulk-update', validItems);
      fetchAllData(); 
      setView("success");
    } catch (error) {
      showErrorModal("Failed to save bill.");
    }
  };

  // --- RETURN ACTIONS ---
  const handleGenerateReturn = async () => {
    try {
      const payload = {
        originalBillNo: returnBillData.originalBillNo,
        returnDate: returnBillData.returnDate,
        client: {
            name: returnBillData.clientName,
            mobile: returnBillData.clientMobile,
            address: returnBillData.clientAddress
        },
        items: returnItems.map(i => ({...i, amount: i.qty * i.rate})),
        totals: returnTotals
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/returns/update/${editingId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/returns/save', payload);
      }
      
      fetchAllData();
      setReturnView("success"); 

    } catch (error) {
      showErrorModal("Failed to save return bill");
    }
  };

  const handleNewReturn = async () => {
    setLoading(true);
    setEditingId(null); 
    setReturnItems([]);
    setReturnBillData(prev => ({...prev, originalBillNo: "", clientName: "", clientMobile: "", clientAddress: ""}));
    
    const returnRes = await axios.get('http://localhost:5000/api/returns/next-number');
    setReturnBillData(prev => ({ ...prev, returnId: returnRes.data.nextReturnId }));
    
    setReturnView("dashboard");
    setLoading(false);
  };

  // --- OTHER ACTIONS ---
  const handleNewBill = async () => {
    setLoading(true);
    setEditingId(null);
    setItems([{ category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
    const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
    setBillData(prev => ({ ...prev, billNo: billRes.data.nextBillNo, clientName: "", clientMobile: "" }));
    setView("dashboard");
    navigate("/billing"); 
    setLoading(false);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    navigate("/bill-detail");
  };

  const handleEditBill = (bill) => {
    setEditingId(bill._id);

    if (bill.returnId) {
        setReturnBillData({
            returnId: bill.returnId,
            originalBillNo: bill.originalBillNo,
            returnDate: bill.returnDate,
            clientName: bill.client.name,
            clientAddress: bill.client.address || "",
            clientMobile: bill.client.mobile,
            shopMobile: "6385278892",
            paymentMode: "Return Note"
        });
        setReturnItems(bill.items);
        setReturnView("dashboard");
        navigate("/return");
    } else {
        setBillData({
            clientName: bill.client.name,
            clientAddress: bill.client.address || "",
            clientMobile: bill.client.mobile,
            billNo: bill.billNo,
            billDate: bill.date,
            paymentMode: "Credit",
            shopMobile: "6385278892"
        });
        setItems(bill.items);
        setView("dashboard");
        navigate("/billing");
    }
  };

  const requestDeleteBill = (id) => {
    setModal({
      isOpen: true, type: 'confirm', title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this record? This cannot be undone.',
      onConfirm: () => confirmDeleteBill(id)
    });
  };

  const confirmDeleteBill = async (id) => {
    try {
        if (selectedBill && selectedBill.returnId) {
            await axios.delete(`http://localhost:5000/api/returns/delete/${id}`);
        } else {
            await axios.delete(`http://localhost:5000/api/bills/delete/${id}`);
        }
        
        closeModal();
        const recentRes = await axios.get('http://localhost:5000/api/bills');
        setRecentBills(recentRes.data);
        const retRes = await axios.get('http://localhost:5000/api/returns');
        setRecentReturns(retRes.data);

        if (window.location.pathname === '/bill-detail') navigate('/');
        else fetchAllData();

    } catch (error) {
        closeModal();
        showErrorModal("Failed to delete record");
    }
  };

  // Export Logic
  const exportBill = async (elementId, format, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });
    if (format === 'pdf') {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        pdf.save(`${filename}.pdf`);
    } else {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
  };

  const handleShare = async () => {
    const element = document.getElementById("bill-preview") || document.getElementById("detail-preview-content") || document.getElementById("return-preview");
    const canvas = await html2canvas(element, { scale: 3 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `Bill.png`, { type: 'image/png' });
      if (navigator.share) await navigator.share({ title: `Bill`, files: [file] });
      else alert("Web Share not supported");
    });
  };

  if (loading) return <div style={{padding:"20px"}}>Loading App...</div>;

  const returnPreviewData = {
    ...returnBillData,
    billNo: returnBillData.returnId,
    billDate: returnBillData.returnDate,
    paymentMode: "Return Note" 
  };

  return (
    <div className="app-layout">
      <Navbar />
      {/* Pass custom text props to Modal */}
      <Modal 
        isOpen={modal.isOpen} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
        onConfirm={modal.onConfirm} 
        onClose={closeModal}
        confirmText={modal.confirmText} 
        cancelText={modal.cancelText}
      />

      <div className="main-content">
        <Routes>
          <Route path="/" element={
             <div className="scrollable-page">
                <HomePage 
                    recentBills={recentBills} 
                    recentReturns={recentReturns}
                    onNavigate={(page, state) => navigate("/" + page, state)} 
                    onViewBill={handleViewBill} 
                />
             </div>
          } />

          <Route path="/billing" element={
             <div className="fixed-page-container">
                <div className="editor-panel">
                  {view === 'dashboard' ? (
                    <Dashboard billData={billData} handleDataChange={handleDataChange} items={items} updateItem={updateItem} removeItem={removeItem} addItem={addItem} productCatalog={productCatalog} onGenerate={handleGenerateBill} />
                  ) : (
                    <SuccessPage billNo={billData.billNo} onExport={(fmt)=>exportBill("bill-preview", fmt, "Bill")} onShare={handleShare} onNewBill={handleNewBill} />
                  )}
                </div>
                <div className="preview-panel">
                  <BillPreview data={billData} items={items} totals={totals} />
                </div>
             </div>
          } />

          <Route path="/bill-detail" element={
             selectedBill ? (
               <BillDetail 
                  bill={selectedBill} 
                  onExport={(fmt, id) => {
                      const prefix = selectedBill.returnId ? "Return" : "Bill";
                      const num = selectedBill.returnId || selectedBill.billNo;
                      exportBill(id, fmt, `${prefix}-${num}`);
                  }}
                  onShare={handleShare}
                  onEdit={handleEditBill}
                  onDelete={requestDeleteBill}
               />
             ) : <div style={{padding:20}}>No bill selected</div>
          } />

          <Route path="/history" element={<div className="scrollable-page"><HistoryPage onViewBill={handleViewBill} /></div>} />
          
          <Route path="/summary" element={<div className="scrollable-page"><ReportPage /></div>} />

          <Route path="/return" element={
             <div className="fixed-page-container">
                <div className="editor-panel">
                   {returnView === 'dashboard' ? (
                     <ReturnDashboard 
                        productCatalog={productCatalog}
                        onGenerateReturn={handleGenerateReturn}
                        onError={showErrorModal} 
                        returnData={returnBillData}
                        setReturnData={setReturnBillData}
                        returnItems={returnItems}
                        setReturnItems={setReturnItems}
                        onReturnExists={handleReturnExists} // PASS THIS PROP
                     />
                   ) : (
                     <SuccessPage 
                        title="Return Saved Successfully"
                        subtitle={`Return Bill #${returnBillData.returnId} saved.`}
                        billNo={returnBillData.returnId}
                        onExport={(fmt)=>exportBill("return-preview", fmt, `Return-${returnBillData.returnId}`)}
                        onShare={handleShare}
                        onNewBill={handleNewReturn}
                     />
                   )}
                </div>
                <div className="preview-panel">
                   <div id="return-preview">
                      <BillPreview data={returnPreviewData} items={returnItems} totals={returnTotals} />
                   </div>
                </div>
             </div>
          } />
        
        </Routes>
      </div>
    </div>
  );
}