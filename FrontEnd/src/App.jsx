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
import "./styles/bill.css"; 

export default function App() {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // --- APP STATE ---
  const [view, setView] = useState("dashboard"); // 'dashboard' or 'success'
  const [loading, setLoading] = useState(true);
  
  // Data State
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
  
  // --- INITIAL LOAD ---
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

  // --- HANDLERS ---
  const handleDataChange = (e) => setBillData({ ...billData, [e.target.name]: e.target.value });
  
  const addItem = () => setItems([...items, { category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
  
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    
    // Logic: Reset fields if category changes
    if (field === 'category') { 
        updated[index].desc = ""; 
        updated[index].rate = ""; 
        updated[index].unit = ""; 
    }
    
    // Logic: Auto-fill price if item selected
    if (field === 'desc') {
        const categoryData = productCatalog.find(cat => cat.category === updated[index].category);
        const itemData = categoryData?.items.find(i => i.name === value);
        if (itemData) { 
            updated[index].rate = itemData.price; 
            updated[index].unit = itemData.unit; 
        }
    }
    // Note: If field is 'rate', it updates directly here, allowing manual override
    setItems(updated);
  };

  // --- GENERATE & SAVE (With Price Update Logic) ---
  const handleGenerateBill = async () => {
    try {
      // 1. Validate: Filter out empty rows
      const validItems = items.filter(item => item.desc && item.desc.trim() !== "");
      if (validItems.length === 0) return alert("Add at least one product!");

      const payload = {
        billNo: billData.billNo,
        date: billData.billDate,
        client: {
           name: billData.clientName,
           mobile: billData.clientMobile,
           address: billData.clientAddress
        },
        items: validItems.map(i => ({...i, amount: i.qty * i.rate})),
        totals
      };

      // 2. Save the Bill
      await axios.post('http://localhost:5000/api/bills/save', payload);

      // 3. Update Prices in DB (Bulk Update)
      // This sends the items (with potential manual price changes) to update the DB
      await axios.put('http://localhost:5000/api/products/bulk-update', validItems);

      // 4. Refresh Catalog (So next bill shows the updated price)
      const prodRes = await axios.get('http://localhost:5000/api/products');
      setProductCatalog(prodRes.data);

      setView("success");

    } catch (error) {
      console.error("Save Error", error);
      alert("Failed to save bill. Check backend console.");
    }
  };

  // --- EXPORT ---
  const handleExport = async (format) => {
    const element = document.getElementById("bill-preview");
    const canvas = await html2canvas(element, { scale: 3, useCORS: true });

    if (format === 'pdf') {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 210;
        const pdfHeight = 297;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Bill-${billData.billNo}.pdf`);
    } else if (format === 'img') {
        const link = document.createElement('a');
        link.download = `Bill-${billData.billNo}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
  };

  // --- SHARE ---
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

  // --- NEW BILL ---
  const handleNewBill = async () => {
    setLoading(true);
    setItems([{ category: "", desc: "", qty: "", rate: "", unit: "Pcs" }]);
    
    // Fetch the new Next Bill Number
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
      
      {/* LEFT PANEL: DASHBOARD / SUCCESS */}
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

      {/* RIGHT PANEL: PREVIEW */}
      <div className="preview-panel">
        <BillPreview data={billData} items={items} totals={totals} />
      </div>

    </div>
  );
}