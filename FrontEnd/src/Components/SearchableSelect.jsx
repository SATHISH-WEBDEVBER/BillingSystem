import { useState, useEffect, useRef } from "react";

export default function SearchableSelect({ value, options, onChange, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  // Sync internal query with external value (e.g. when editing an existing bill)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset query to last valid value if user clicked away without selecting
        // (Optional: remove this line if you want to allow free text)
        setQuery(value || ""); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value]);

  // Filter options based on query
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (option) => {
    setQuery(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="searchable-select-container">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        className={disabled ? "input-readonly" : ""}
      />
      
      {isOpen && !disabled && (
        <ul className="searchable-dropdown-list">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li key={index} onClick={() => handleSelect(option)}>
                {option}
              </li>
            ))
          ) : (
            <li className="no-results">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}