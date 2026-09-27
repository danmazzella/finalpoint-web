import React from 'react';

export const MAX_POSITION = 22;

interface PositionPickerProps {
  selected: number[];
  maxSelections: number;
  onToggle: (position: number) => void;
}

export default function PositionPicker({ selected, maxSelections, onToggle }: PositionPickerProps) {
  const atLimit = selected.length >= maxSelections;
  const sorted = [...selected].sort((a, b) => a - b);

  return (
    <div>
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
        {Array.from({ length: MAX_POSITION }, (_, i) => i + 1).map((position) => {
          const isSelected = selected.includes(position);
          const disabled = atLimit && !isSelected;
          return (
            <button
              key={position}
              type="button"
              onClick={() => onToggle(position)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`h-9 text-xs font-semibold rounded-lg border-2 transition-all ${isSelected
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : disabled
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              P{position}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          Selected: {sorted.length > 0 ? sorted.map(p => `P${p}`).join(', ') : 'none'}
        </span>
        <span className={atLimit ? 'font-semibold text-blue-600' : ''}>
          {selected.length}/{maxSelections}
        </span>
      </div>
    </div>
  );
}
