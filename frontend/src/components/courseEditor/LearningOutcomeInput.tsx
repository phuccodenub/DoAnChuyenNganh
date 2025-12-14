import { useState } from 'react';
import { X } from 'lucide-react';

interface LearningOutcomeInputProps {
    outcomes: string[];
    onChange: (outcomes: string[]) => void;
    suggestions?: string[];
}

export function LearningOutcomeInput({ outcomes, onChange, suggestions = [] }: LearningOutcomeInputProps) {
    const [inputValue, setInputValue] = useState('');

    const addOutcome = (outcome: string) => {
        if (outcome.trim() && !outcomes.includes(outcome.trim())) {
            onChange([...outcomes, outcome.trim()]);
        }
        setInputValue('');
    };

    const removeOutcome = (index: number) => {
        onChange(outcomes.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addOutcome(inputValue);
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Học viên sẽ học được gì trong khóa học này?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Suggestion Chips */}
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => addOutcome(suggestion)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Current Outcomes */}
            {outcomes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {outcomes.map((outcome, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                            <span>{outcome}</span>
                            <button
                                onClick={() => removeOutcome(index)}
                                className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}