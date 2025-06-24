import { useState, useRef } from 'react';

const STATUS_OPTIONS = [
  'Pending',
  'Processing',
  'In Transit',
  'Out for Delivery',
  'Delivered',
];

export default function EditableStatusCell({ value, onSave, disabled }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const selectRef = useRef(null);

  const handleEdit = () => {
    setEditing(true);
    setInputValue(value);
    setTimeout(() => selectRef.current && selectRef.current.focus(), 0);
  };

  const handleBlur = () => {
    if (inputValue !== value) {
      onSave(inputValue);
    }
    setEditing(false);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onSave(e.target.value);
    setEditing(false);
  };

  return editing ? (
    <div className="flex items-center gap-2">
      <select
        ref={selectRef}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border border-black rounded px-2 py-1 text-black bg-white"
        disabled={disabled}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  ) : (
    <div className="flex items-center justify-between w-full">
      <span className="block w-40 truncate text-black" title={value}>{value}</span>
      <button
        onClick={handleEdit}
        className="ml-2 text-gray-400 hover:text-amber-600"
        title="Edit Status"
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
      </button>
    </div>
  );
}
