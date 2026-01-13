// A functional component representing a single row in the product table
export default function ProductRow({ index, item, onChange, onRemove }) {
  return (
    <tr>
      {/* Display the row number (1-based index) */}
      <td>{index + 1}</td>
      
      {/* Input field for the product description */}
      <td>
        <input
          value={item.desc}
          // Updates the description field in the parent state when typed
          onChange={(e) => onChange(index, "desc", e.target.value)}
        />
      </td>
      
      {/* Input field for quantity (Number type) */}
      <td>
        <input
          type="number"
          value={item.qty}
          // Updates the quantity. The '+' converts the string value to a number.
          onChange={(e) => onChange(index, "qty", +e.target.value)}
        />
      </td>
      
      {/* Input field for rate/price (Number type) */}
      <td>
        <input
          type="number"
          value={item.rate}
          // Updates the rate. The '+' converts the string value to a number.
          onChange={(e) => onChange(index, "rate", +e.target.value)}
        />
      </td>
      
      {/* Automatically calculates and displays the total amount (qty * rate) formatted to 2 decimal places */}
      <td>{(item.qty * item.rate).toFixed(2)}</td>
      
      {/* Button to remove this specific row from the list */}
      <td>
        <button onClick={() => onRemove(index)}>❌</button>
      </td>
    </tr>
  );
}