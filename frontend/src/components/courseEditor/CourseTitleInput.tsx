interface CourseTitleInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function CourseTitleInput({ value, onChange, placeholder }: CourseTitleInputProps) {
    return (
        <div className="mb-6">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'Enter course title...'}
                className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-300 focus:ring-0 p-0"
                style={{ fontSize: '2rem', lineHeight: '1.2' }}
            />
        </div>
    );
}