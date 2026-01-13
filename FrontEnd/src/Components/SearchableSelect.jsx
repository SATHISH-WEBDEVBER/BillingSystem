import { useState, useEffect, useRef } from "react";

// Reusable component for a dropdown list that allows users to type and filter options
export default function SearchableSelect({ value, options, onChange, placeholder, disabled }) {
  // State to track if the dropdown list is currently visible
  const [isOpen, setIsOpen] = useState(false);
  // State to track what the user is currently typing in the input field
  const [query, setQuery] = useState("");
  // Ref to the wrapper div, used to detect clicks outside this component
  const wrapperRef = useRef(null);

  // Sync internal query with external value (e.g. when editing an existing bill)
  // Ensures that if the parent component updates the value, this input updates to match
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close dropdown if clicked outside
  // Adds a global event listener to detect clicks anywhere on the page
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click happened outside of this specific component
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
  // Creates a new array of options that match what the user typed (case-insensitive)
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );

  // Handler for when a user clicks a specific option from the list
  const handleSelect = (option) => {
    setQuery(option);   // Update the input display
    onChange(option);   // Notify the parent component of the change
    setIsOpen(false);   // Close the dropdown
  };

  return (
    <div ref={wrapperRef} className="searchable-select-container">
      {/* Input field for typing and searching */}
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true); // Open dropdown when user starts typing
        }}
        onFocus={() => setIsOpen(true)} // Open dropdown when input is clicked
        disabled={disabled}
        className={disabled ? "input-readonly" : ""}
      />
      
      {/* Dropdown list - only shows when open and not disabled */}
      {isOpen && !disabled && (
        <ul className="searchable-dropdown-list">
          {filteredOptions.length > 0 ? (
            // Map through the filtered options and display them
            filteredOptions.map((option, index) => (
              <li key={index} onClick={() => handleSelect(option)}>
                {option}
              </li>
            ))
          ) : (
            // Show message if no matching options found
            <li className="no-results">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}