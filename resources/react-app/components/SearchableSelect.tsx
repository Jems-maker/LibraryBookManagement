import React, { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = (options || []).filter((opt: any) => 
    opt?.label != null && String(opt.label).toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = (options || []).find((o: any) => String(o?.value) === String(value))?.label || '';

  return (
    <div ref={wrapperRef} className="relative">
      <div 
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedLabel ? "text-gray-900" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input 
              type="text" 
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto p-1 max-h-40">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((opt: any) => (
                <div 
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer ${String(value) === String(opt.value) ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
