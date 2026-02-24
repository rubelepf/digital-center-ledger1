import { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
  value: string | number;
  type?: 'text' | 'number' | 'date';
  onChange: (value: string | number) => void;
  className?: string;
  placeholder?: string;
  min?: string;
  step?: string;
}

export function EditableCell({ value, type = 'text', onChange, className = '', placeholder, min, step }: EditableCellProps) {
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from parent only when value actually changes externally
  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const handleBlur = () => {
    if (type === 'number') {
      const num = localValue === '' ? 0 : Number(localValue);
      if (num !== Number(value)) {
        onChange(num);
      }
    } else {
      if (localValue !== String(value)) {
        onChange(localValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
      min={min}
      step={step}
    />
  );
}
