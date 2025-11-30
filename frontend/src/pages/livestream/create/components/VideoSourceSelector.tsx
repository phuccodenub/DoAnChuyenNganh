import { Camera, Monitor } from 'lucide-react';

type VideoSource = 'webcam' | 'software';

interface VideoSourceSelectorProps {
  value: VideoSource;
  onChange: (value: VideoSource) => void;
}

const options = [
  { id: 'webcam' as const, label: 'Webcam', description: 'Dùng camera & micro trên máy', icon: Camera },
  { id: 'software' as const, label: 'Phần mềm streaming', description: 'Dùng OBS/Streamlabs với stream key', icon: Monitor },
];

export function VideoSourceSelector({ value, onChange }: VideoSourceSelectorProps) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Nguồn video</h2>
        <p className="text-sm text-gray-500">Chọn cách bạn muốn phát trực tiếp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              value === option.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  value === option.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <option.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
              </div>
              <input
                type="radio"
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="hidden"
              />
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

