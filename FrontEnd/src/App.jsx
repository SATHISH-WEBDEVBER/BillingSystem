import { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { calculateTotals } from "./utils/calculations";

// Component Imports
import BillPreview from "./components/BillPreview";
import Dashboard from "./components/Dashboard";
import SuccessPage from "./components/SuccessPage";

// Global Styles
import "./styles/app.css"; 
import "./styles/bill.css"; // Ensure bill styles are loaded globally

export default function App() {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // --- STATE ---
  const [view, setView] = useState("dashboard"); 
  const [loading, setLoading] = useState(true);
  
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
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setProductCatalog(prodRes.data);
        
        const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
        setBillData(prev => ({ ...prev, billNo: billRes.data.nextBillNo }));
        
        setLoading(false);
      } catch (error) {
        console.error("Backend Error:", error);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const totals = calculateTotals(items);

  // --- ACTIONS ---
  const handleDataChange = (e) => setBillData({ ...billData, [e.target.name]: e.target.value });
  
  const addItem = () => setItems([...items, { category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
  
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    
    if (field === 'category') { 
        updated[index].desc = ""; 
        updated[index].rate = ""; 
        updated[index].unit = ""; 
    }
    
    if (field === 'desc') {
        const categoryData = productCatalog.find(cat => cat.category === updated[index].category);
        const itemData = categoryData?.items.find(i => i.name === value);
        if (itemData) { 
            updated[index].rate = itemData.price; 
            updated[index].unit = itemData.unit; 
        }
    }
    setItems(updated);
  };

  const handleGenerateBill = async () => {
    try {
      if (items.length === 0 || !items[0].desc) return alert("Add at least one product!");

      const payload = {
        billNo: billData.billNo,
        date: billData.billDate,
        client: {
           name: billData.clientName,
           mobile: billData.clientMobile,
           address: billData.clientAddress
        },
        items: items.map(i => ({...i, amount: i.qty * i.rate})),
        totals
      };

      await axios.post('http://localhost:5000/api/bills/save', payload);
      setView("success");

    } catch (error) {
      console.error("Save Error", error);
      alert("Failed to save bill. Check backend console.");
    }
  };

  const handleExport = async (format) => {
    const element = document.getElementById("bill-preview");
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });

    if (format === 'pdf') {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        pdf.save(`Bill-${billData.billNo}.pdf`);
    } else if (format === 'img') {
        const link = document.createElement('a');
        link.download = `Bill-${billData.billNo}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
  };

  const handleShare = async () => {
    const element = document.getElementById("bill-preview");
    const canvas = await html2canvas(element, { scale: 3 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `Bill-${billData.billNo}.png`, { type: 'image/png' });
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Bill ${billData.billNo}`,
            text: `Here is the bill for ${billData.clientName}`,
            files: [file],
          });
        } catch (error) { console.log("Error sharing", error); }
      } else {
        alert("Web Share not supported");
      }
    });
  };

  const handleNewBill = async () => {
    setLoading(true);
    setItems([{ category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
    const billRes = await axios.get('http://localhost:5000/api/bills/next-number');
    setBillData(prev => ({ 
        ...prev, 
        billNo: billRes.data.nextBillNo, 
        clientName: "", 
        clientMobile: "" 
    }));
    setView("dashboard");
    setLoading(false);
  };

  if (loading) return <div style={{padding:"20px"}}>Loading...</div>;

  return (
    <div className="app-layout">
      {/* LEFT PANEL */}
      <div className="editor-panel">
        {view === 'dashboard' ? (
          <Dashboard 
            billData={billData}
            handleDataChange={handleDataChange}
            items={items}
            updateItem={updateItem}
            removeItem={removeItem}
            addItem={addItem}
            productCatalog={productCatalog}
            onGenerate={handleGenerateBill}
          />
        ) : (
          <SuccessPage 
            billNo={billData.billNo}
            onExport={handleExport}
            onShare={handleShare}
            onNewBill={handleNewBill}
          />
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="preview-panel">
        <BillPreview data={billData} items={items} totals={totals} />
      </div>
    </div>
  );
}