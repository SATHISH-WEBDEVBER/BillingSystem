// Import the necessary Mongoose models
const Bill = require('../models/Bill');
const ReturnBill = require('../models/ReturnBill');
const UpdatedBill = require('../models/UpdatedBill');

// Function to automatically generate or update a final bill based on returns
const recalculateUpdatedBill = async (billNoInput) => {
  try {
    // 1. Fetch Original Bill (NBxxx)
    // Find the original sales transaction
    const original = await Bill.findOne({ billNo: billNoInput });
    
    // 2. Fetch Return Bill (RBxxx) - Derived from logic
    // Automatically determine the Return ID by swapping 'NB' with 'RB'
    const returnIdTarget = billNoInput.replace("NB", "RB");
    const ret = await ReturnBill.findOne({ returnId: returnIdTarget });

    // 3. If either missing, delete Updated Bill (UBxxx)
    // Validation: If there is no Original Bill or no Return Bill, an "Updated Bill" shouldn't exist.
    if (!original || !ret) {
      await UpdatedBill.findOneAndDelete({ originalBillNo: billNoInput });
      console.log(`Updated Bill for ${billNoInput} deleted/not created.`);
      return; // Stop execution here
    }

    // 4. Calculate Logic
    // Array to hold the items that the customer actually kept (Original - Returned)
    const newItems = [];
    
    original.items.forEach(origItem => {
      // Find if this specific item was returned
      const retItem = ret.items.find(r => r.desc === origItem.desc);
      // Get the quantity returned (defaults to 0 if not found in return bill)
      const returnQty = retItem ? retItem.qty : 0;
      // Calculate what remains with the customer
      const remainingQty = origItem.qty - returnQty;

      // Only add to the new bill if the customer kept at least 1
      if (remainingQty > 0) {
        newItems.push({
          ...origItem.toObject(), // Copy all original item properties
          qty: remainingQty,      // Update quantity
          amount: remainingQty * origItem.rate // Recalculate cost
        });
      }
    });

    // Recalculate financial totals based on the remaining items
    const subTotal = newItems.reduce((acc, item) => acc + item.amount, 0);
    const netAmount = subTotal;

    // 5. Generate UB ID (e.g. NB007 -> UB007)
    // Create the unique ID for this new Updated Bill
    const updatedId = billNoInput.replace("NB", "UB");

    // Save to database: Update existing UB record if found, otherwise create a new one (upsert: true)
    await UpdatedBill.findOneAndUpdate(
      { originalBillNo: billNoInput },
      {
        updatedBillId: updatedId,
        originalBillNo: billNoInput,
        returnId: ret.returnId,
        date: new Date().toISOString().split('T')[0], // Set current date
        client: original.client, // Keep original client details
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

// Export the function for use in routes
module.exports = { recalculateUpdatedBill };