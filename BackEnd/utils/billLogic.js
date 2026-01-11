const Bill = require('../models/Bill');
const ReturnBill = require('../models/ReturnBill');
const UpdatedBill = require('../models/UpdatedBill');

const recalculateUpdatedBill = async (billNoInput) => {
  try {
    // 1. Fetch Original Bill (NBxxx)
    const original = await Bill.findOne({ billNo: billNoInput });
    
    // 2. Fetch Return Bill (RBxxx) - Derived from logic
    const returnIdTarget = billNoInput.replace("NB", "RB");
    const ret = await ReturnBill.findOne({ returnId: returnIdTarget });

    // 3. If either missing, delete Updated Bill (UBxxx)
    if (!original || !ret) {
      await UpdatedBill.findOneAndDelete({ originalBillNo: billNoInput });
      console.log(`Updated Bill for ${billNoInput} deleted/not created.`);
      return;
    }

    // 4. Calculate Logic
    const newItems = [];
    
    original.items.forEach(origItem => {
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

    const subTotal = newItems.reduce((acc, item) => acc + item.amount, 0);
    const netAmount = subTotal;

    // 5. Generate UB ID (e.g. NB007 -> UB007)
    const updatedId = billNoInput.replace("NB", "UB");

    await UpdatedBill.findOneAndUpdate(
      { originalBillNo: billNoInput },
      {
        updatedBillId: updatedId,
        originalBillNo: billNoInput,
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
    console.log(`Updated Bill ${updatedId} generated.`);

  } catch (error) {
    console.error("Logic Error:", error);
  }
};

module.exports = { recalculateUpdatedBill };