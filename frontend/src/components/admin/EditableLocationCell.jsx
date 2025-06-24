import { useState, useRef } from 'react';

export default function EditableLocationCell({
  value,
  onSave,
  disabled
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);

  const handleEdit = () => {
    setEditing(true);
    setInputValue(value || '');
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };

  const handleBlur = () => {
    if (inputValue !== value) {
      onSave(inputValue);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue !== value) {
        onSave(inputValue);
      }
      setEditing(false);
    } else if (e.key === 'Escape') {
      setEditing(false);
      setInputValue(value || '');
    }
  };

  return editing ? (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="border rounded px-2 py-1 text-black bg-white w-40"
        disabled={disabled}
      />
    </div>
  ) : (
    <div className="flex items-center justify-between w-full">
      <span className="truncate block w-40" title={value}>{value}</span>
      <button
        onClick={handleEdit}
        className="ml-2 text-gray-400 hover:text-amber-600"
        title="Edit Location"
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
      </button>
    </div>
  );
}
