import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateTotals } from "./utils/calculations";

// Components
import Navbar from "./components/Navbar";
import BillPreview from "./components/BillPreview";
import Dashboard from "./Components/Dashboard";
import SuccessPage from "./components/SuccessPage";
import HomePage from "./components/HomePage";
import BillDetail from "./components/BillDetail";
import HistoryPage from "./components/HistoryPage"; 
import ReportPage from "./Components/ReportPage"; // NEW IMPORT
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
  const [recentBills, setRecentBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingId, setEditingId] = useState(null); 

  // --- MODAL STATE ---
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
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

  const [productCatalog, setProductCatalog] = useState([]);
  
  // --- LOAD DATA ---
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
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
  };

  useEffect(() => { fetchAllData(); }, []);

  const totals = calculateTotals(items);

  // --- MODAL HELPERS ---
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const showSuccessModal = (msg) => {
    setModal({ isOpen: true, type: 'success', title: 'Success!', message: msg, onConfirm: null });
  };

  // --- ACTIONS ---
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

  // --- GENERATE / UPDATE ---
  const handleGenerateBill = async () => {
    try {
      const validItems = items.filter(item => item.desc && item.desc.trim() !== "");
      if (validItems.length === 0) return alert("Add products!");

      const payload = {
        billNo: billData.billNo,
        date: billData.billDate,
        client: { name: billData.clientName, mobile: billData.clientMobile, address: billData.clientAddress },
        items: validItems.map(i => ({...i, amount: i.qty * i.rate})),
        totals
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/bills/update/${editingId}`, payload);
        showSuccessModal("Bill details have been updated successfully.");
      } else {
        await axios.post('http://localhost:5000/api/bills/save', payload);
      }

      await axios.put('http://localhost:5000/api/products/bulk-update', validItems);
      fetchAllData(); 
      setView("success");
    } catch (error) {
      alert("Failed to save.");
    }
  };

  const handleEditBill = (bill) => {
    setEditingId(bill._id);
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
  };

  const requestDeleteBill = (id) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this bill? This action cannot be undone.',
      onConfirm: () => confirmDeleteBill(id)
    });
  };

  const confirmDeleteBill = async (id) => {
    try {
        await axios.delete(`http://localhost:5000/api/bills/delete/${id}`);
        closeModal();
        const recentRes = await axios.get('http://localhost:5000/api/bills');
        setRecentBills(recentRes.data);
        if (window.location.pathname === '/bill-detail') navigate('/');
        else fetchAllData();
    } catch (error) {
        closeModal();
        alert("Failed to delete bill");
    }
  };

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
    const element = document.getElementById("bill-preview") || document.getElementById("bill-view-detail");
    const canvas = await html2canvas(element, { scale: 3 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `Bill.png`, { type: 'image/png' });
      if (navigator.share) await navigator.share({ title: `Bill`, files: [file] });
      else alert("Web Share not supported");
    });
  };

  if (loading) return <div style={{padding:"20px"}}>Loading App...</div>;

  return (
    <div className="app-layout">
      
      <Navbar />

      <Modal 
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onClose={closeModal}
      />

      <div className="main-content">
        <Routes>
          <Route path="/" element={
             <div className="scrollable-page">
                <HomePage recentBills={recentBills} onNavigate={(page) => navigate("/" + page)} onViewBill={handleViewBill} />
             </div>
          } />

          <Route path="/billing" element={
             <div className="fixed-page-container">
                <div className="editor-panel">
                  {view === 'dashboard' ? (
                    <Dashboard 
                      billData={billData} handleDataChange={handleDataChange} items={items} 
                      updateItem={updateItem} removeItem={removeItem} addItem={addItem} 
                      productCatalog={productCatalog} onGenerate={handleGenerateBill}
                    />
                  ) : (
                    <SuccessPage 
                      billNo={billData.billNo} onExport={(fmt)=>exportBill("bill-preview", fmt, "Bill")} 
                      onShare={handleShare} onNewBill={handleNewBill}
                    />
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
                  onExport={(fmt, id) => exportBill(id, fmt, `Bill-${selectedBill.billNo}`)}
                  onShare={handleShare}
                  onEdit={handleEditBill}
                  onDelete={requestDeleteBill}
               />
             ) : <div style={{padding:20}}>No bill selected</div>
          } />

          <Route path="/history" element={
             <div className="scrollable-page">
                <HistoryPage onViewBill={handleViewBill} />
             </div>
          } />

          {/* REPORT PAGE (Updated) */}
          <Route path="/summary" element={
             <div className="scrollable-page">
                <ReportPage />
             </div>
          } />

          <Route path="/return" element={<div className="scrollable-page" style={{padding:40}}><h2>↩️ Returns</h2></div>} />
        
        </Routes>
      </div>
    </div>
  );
}