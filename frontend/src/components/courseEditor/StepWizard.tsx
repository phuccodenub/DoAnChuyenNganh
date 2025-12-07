import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface Step {
    id: string;
    title: string;
    description: string;
    route?: string;
}

interface StepWizardProps {
    currentStep: number;
    steps: Step[];
}

export function StepWizard({ currentStep, steps }: StepWizardProps) {
    const navigate = useNavigate();

    return (
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isClickable = step.route && stepNumber <= currentStep;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <button
                                    onClick={() => isClickable && navigate(step.route!)}
                                    disabled={!isClickable}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                        isCompleted
                                            ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                            : isCurrent
                                                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-gray-300 text-gray-400 bg-white'
                                    } ${isClickable ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : 'cursor-not-allowed'}`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{stepNumber}</span>
                                    )}
                                </button>
                                <div className="mt-3 text-center">
                                    <div className={`text-sm font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-500'}`}>
                                        {step.title}
                                    </div>
                                    <div className={`text-xs mt-1 max-w-28 ${isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                                        stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}