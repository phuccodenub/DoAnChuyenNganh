import { useState } from 'react';
import { X } from 'lucide-react';

interface ChipInputProps {
    label: string;
    chips: string[];
    onChange: (chips: string[]) => void;
    placeholder?: string;
}

export function ChipInput({ label, chips, onChange, placeholder }: ChipInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addChip = (chip: string) => {
        const trimmedChip = chip.trim();
        if (trimmedChip && !chips.includes(trimmedChip)) {
            onChange([...chips, trimmedChip]);
        }
        setInputValue('');
    };

    const removeChip = (index: number) => {
        onChange(chips.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addChip(inputValue);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="space-y-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Chips */}
                {chips.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {chips.map((chip, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                            >
                                <span>{chip}</span>
                                <button
                                    onClick={() => removeChip(index)}
                                    className="hover:bg-gray-200 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}