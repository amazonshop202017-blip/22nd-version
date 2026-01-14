import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TypeableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddNew?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TypeableCombobox = ({
  value,
  onChange,
  options,
  onAddNew,
  placeholder = 'Select...',
  className,
}: TypeableComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on input
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if typed value is new
  const isNewValue = inputValue.trim() && !options.some(
    opt => opt.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (isNewValue && onAddNew) {
      onAddNew(inputValue.trim());
      onChange(inputValue.trim());
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isNewValue && onAddNew) {
        handleAddNew();
      } else if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 bg-input border-border pr-8"
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
        >
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.length === 0 && !isNewValue ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No options found
            </div>
          ) : (
            <>
              {filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between",
                    value === opt && "bg-muted/30"
                  )}
                >
                  <span>{opt}</span>
                  {value === opt && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
              {isNewValue && onAddNew && (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-t border-border text-primary font-medium"
                >
                  {inputValue.trim()} <span className="text-muted-foreground">(NEW)</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
