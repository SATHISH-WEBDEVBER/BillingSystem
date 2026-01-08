import React from "react";
import { numberToWords } from "../utils/numToWords";

export default function BillPreview({ data, items, totals }) {
  const minRows = 20; 
  // Safety: items might be empty now, but this works fine
  const emptyRows = Array.from({ length: Math.max(0, minRows - items.length) });

  const formatDate = (dateString) => {
    if(!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div id="bill-preview" className="bill-container">
      <div className="bill-border">
        
        {/* HEADER */}
        <div className="bill-header">
            <div style={{ textAlign: "right", fontSize: "10px" }}>CELL: 9842545324, 9842723032</div>
            <h1 className="shop-name">BHAKAVATHI AMMAN TRADERS</h1>
            <p style={{margin:"2px 0", fontSize:"12px"}}>38 F4, NAINAMPATTI ROAD STREET, OPP GOVT HOSPITAL</p>
            <p style={{margin:"2px 0", fontSize:"12px"}}>EDAPPADI - 637105</p>
            <h3 style={{textDecoration:"underline", margin:"5px 0", fontSize:"16px"}}>ESTIMATE CR</h3>
        </div>

        {/* INFO GRID */}
        <div className="bill-details">
          <div className="left">
            <div>To. <strong>{data.clientName}</strong></div>
            <div style={{marginLeft:"15px", fontSize:"13px"}}>{data.clientAddress}</div>
            <div style={{marginLeft:"15px", fontSize:"13px"}}>{data.clientCity}</div>
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

        {/* TABLE SECTION */}
        <div className="table-wrapper">
            
            {/* VERTICAL LINES OVERLAY */}
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
                {items.map((item, index) => {
                    // FIX: Safe Number Conversion
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
                
                {emptyRows.map((_, index) => (
                <tr key={`empty-${index}`} className="empty-row">
                    <td></td><td></td><td></td><td></td><td></td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* FOOTER */}
        <div className="bill-footer">
            <div className="totals-row">
                <div className="label">Total</div>
                <div className="value" style={{borderLeft:"1px solid black", width:"90px", textAlign:"center", borderRight:"1px solid black", marginRight:"170px"}}>
                   {items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0).toFixed(2)}
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
            <div className="amount-words">
                Rupees {numberToWords(totals.netAmount)} Only
            </div>
            <div style={{padding:"5px", fontSize:"11px"}}>E & O.E</div>
        </div>

      </div>
    </div>
  );
}