const Bill = require('../models/Bill');
const ReturnBill = require('../models/ReturnBill');
const UpdatedBill = require('../models/UpdatedBill');

const recalculateUpdatedBill = async (billNoInput) => {
  try {
    const billNo = parseInt(billNoInput);
    if (isNaN(billNo)) return;

    // 1. Fetch Original & Return Bills
    const original = await Bill.findOne({ billNo: billNo });
    const ret = await ReturnBill.findOne({ 
      $or: [{ originalBillNo: String(billNo) }, { originalBillNo: billNo }] 
    });

    // 2. If either is missing, delete the Updated Bill (it's invalid)
    if (!original || !ret) {
      await UpdatedBill.findOneAndDelete({ originalBillNo: billNo });
      console.log(`Updated Bill for #${billNo} deleted (Parent missing).`);
      return;
    }

    // 3. Calculate Remaining Items
    const newItems = [];
    
    original.items.forEach(origItem => {
      // Find matching return item by description
      const retItem = ret.items.find(r => r.desc === origItem.desc);
      const returnQty = retItem ? retItem.qty : 0;
      const remainingQty = origItem.qty - returnQty;

      if (remainingQty > 0) {
        newItems.push({
          ...origItem.toObject(),
          qty: remainingQty,
          amount: remainingQty * origItem.rate
        });
      }
    });

    // 4. Calculate Totals
    const subTotal = newItems.reduce((acc, item) => acc + item.amount, 0);
    const netAmount = subTotal;

    // 5. Save/Update
    await UpdatedBill.findOneAndUpdate(
      { originalBillNo: billNo },
      {
        updatedBillId: `UPD-${billNo}`,
        originalBillNo: billNo,
        returnId: ret.returnId,
        date: new Date().toISOString().split('T')[0],
        client: original.client,
        items: newItems,
        totals: {
          subTotal: subTotal.toFixed(2),
          roundOff: "0.00",
          netAmount: netAmount.toFixed(2)
        }
      },
      { upsert: true, new: true }
    );
    console.log(`Updated Bill for #${billNo} generated.`);

  } catch (error) {
    console.error("Logic Error:", error);
  }
};

module.exports = { recalculateUpdatedBill };