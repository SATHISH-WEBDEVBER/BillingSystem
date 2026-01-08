export const calculateTotals = (items) => {
  const subTotal = items.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );

  const netAmount = Math.round(subTotal);
  const roundOff = netAmount - subTotal;

  return {
    subTotal: subTotal.toFixed(2),
    roundOff: roundOff.toFixed(2),
    netAmount: netAmount.toFixed(2),
  };
};
