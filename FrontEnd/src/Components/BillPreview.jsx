import React from "react";
// Import utility function to convert numeric currency to English words (e.g., 100 -> "One Hundred")
import { numberToWords } from "../utils/numToWords";

// Component to render the visual layout of the bill/invoice for printing or previewing
export default function BillPreview({ data, items, totals }) {
  // 1. FILTER: Only show items that have a description
  // Removes empty rows from the input data to prevent blank lines in the middle of the bill
  const validItems = items.filter(item => item.desc && item.desc.trim() !== "");

  const minRows = 20; 
  // 2. Use validItems.length to calculate empty rows
  // Ensures the bill always has a minimum height by adding blank rows if the list is short
  const emptyRows = Array.from({ length: Math.max(0, minRows - validItems.length) });

  // Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if(!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div id="bill-preview" className="bill-container">
      <div className="bill-border">
        
        {/* HEADER: Displays Shop Name, Address, and Contact Info */}
        <div className="bill-header">
            <div style={{ textAlign: "right", fontSize: "10px" }}>CELL: 9842545324, 9842723032</div>
            <h1 className="shop-name">MAKKAL SANDHAI</h1>
            <p style={{margin:"2px 0", fontSize:"12px"}}>38 F4, NAINAMPATTI ROAD STREET, OPP GOVT HOSPITAL</p>
            <p style={{margin:"2px 0", fontSize:"12px"}}>EDAPPADI - 637105</p>
            <h3 style={{textDecoration:"underline", margin:"5px 0", fontSize:"16px"}}>ESTIMATE CR</h3>
        </div>

        {/* INFO GRID: Displays Client Details (Left) and Bill Meta Data (Right) */}
        <div className="bill-details">
          <div className="left">
            <div>To. <strong>{data.clientName}</strong></div>
            <div style={{marginLeft:"35px", fontSize:"13px"}}>{data.clientAddress}</div>
            <div style={{marginLeft:"35px", fontSize:"13px"}}>{data.clientCity}</div>
            <br />
            <div>Cell No: <strong>{data.clientMobile}</strong></div>
          </div>
          <div className="right">
            <div className="detail-row"><span>Terms :</span> <span>{data.paymentMode}</span></div>
            <div className="detail-row"><span>Bill No :</span> <span>{data.billNo}</span></div>
            <div className="detail-row"><span>Date :</span> <span>{formatDate(data.billDate)}</span></div>
            <div className="detail-row"><span>Shop Cell :</span> <span>{data.shopMobile}</span></div>
          </div>
        </div>

        {/* TABLE SECTION: The main list of products */}
        <div className="table-wrapper">
            
            {/* VERTICAL LINES OVERLAY: CSS trick to draw continuous vertical lines down the whole table */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: "45px", borderLeft: "1px solid black" }}></div>
            <div style={{ position: "absolute", top: 0, bottom: 0, right: "260px", borderLeft: "1px solid black" }}></div>
            <div style={{ position: "absolute", top: 0, bottom: 0, right: "170px", borderLeft: "1px solid black" }}></div>
            <div style={{ position: "absolute", top: 0, bottom: 0, right: "90px", borderLeft: "1px solid black" }}></div>

            <table className="items-table">
            <thead>
                <tr>
                <th style={{width:"45px"}}>S.No</th>
                <th style={{textAlign:"left", paddingLeft:"10px"}}>Description</th>
                <th style={{width:"90px"}}>Qty</th>
                <th style={{width:"80px", textAlign:"right"}}>Rate</th>
                <th style={{width:"90px", textAlign:"right"}}>Value</th>
                </tr>
            </thead>
            <tbody>
                {/* 3. MAP OVER validItems INSTEAD OF items */}
                {/* Loop through actual products and render them */}
                {validItems.map((item, index) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const val = qty * rate;

                    return (
                        <tr key={index}>
                            <td style={{textAlign:"center"}}>{index + 1}</td>
                            <td style={{paddingLeft:"10px"}}>{item.desc}</td>
                            <td style={{textAlign:"center"}}>
                                {qty > 0 ? `${qty} ${item.unit}` : ""}
                            </td>
                            <td style={{textAlign:"right"}}>
                                {rate > 0 ? rate.toFixed(2) : ""}
                            </td>
                            <td style={{textAlign:"right"}}>
                                {val > 0 ? val.toFixed(2) : ""}
                            </td>
                        </tr>
                    );
                })}
                
                {/* Loop to render the calculated empty rows to fill the paper space */}
                {emptyRows.map((_, index) => (
                <tr key={`empty-${index}`} className="empty-row">
                    <td></td><td></td><td></td><td></td><td></td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* FOOTER: Totals, Round off, Net Amount, and Words */}
        <div className="bill-footer">
            <div className="totals-row">
                <div className="label">Total</div>
                {/* Displays the sum of all quantities */}
                <div className="value" style={{borderLeft:"1px solid black", width:"90px", textAlign:"center", borderRight:"1px solid black", marginRight:"170px"}}>
                   {/* Calculate total Qty based on valid items only */}
                   {validItems.reduce((acc, i) => acc + (Number(i.qty) || 0), 0).toFixed(2)}
                </div>
                <div className="value" style={{width:"90px"}}>{totals.subTotal}</div>
            </div>
            <div className="totals-row">
                <div className="label">Rounded Off</div>
                <div className="value" style={{width:"90px"}}>{totals.roundOff}</div>
            </div>
            <div className="totals-row">
                <div className="label" style={{fontWeight:"bold"}}>Net Amount</div>
                <div className="value" style={{fontWeight:"bold", fontSize:"16px", width:"90px"}}>{totals.netAmount}</div>
            </div>
            {/* Converts the final amount into text (e.g., "Rupees Five Hundred Only") */}
            <div className="amount-words">
                Rupees {numberToWords(totals.netAmount)} Only
            </div>
            <div style={{padding:"5px", fontSize:"11px"}}>E & O.E</div>
        </div>

      </div>
    </div>
  );
}