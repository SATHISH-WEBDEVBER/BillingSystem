export default function ProductRow({ index, item, onChange, onRemove }) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <input
          value={item.desc}
          onChange={(e) => onChange(index, "desc", e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          value={item.qty}
          onChange={(e) => onChange(index, "qty", +e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          value={item.rate}
          onChange={(e) => onChange(index, "rate", +e.target.value)}
        />
      </td>
      <td>{(item.qty * item.rate).toFixed(2)}</td>
      <td>
        <button onClick={() => onRemove(index)}>❌</button>
      </td>
    </tr>
  );
}
