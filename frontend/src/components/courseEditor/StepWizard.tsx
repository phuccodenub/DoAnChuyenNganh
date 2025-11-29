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
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;
                    const isClickable = step.route && stepNumber <= currentStep;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => isClickable && navigate(step.route!)}
                                    disabled={!isClickable}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${isCompleted
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : isCurrent
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-gray-300 text-gray-400'
                                        } ${isClickable ? 'cursor-pointer hover:border-blue-400' : 'cursor-not-allowed'}`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-medium">{stepNumber}</span>
                                    )}
                                </button>
                                <div className="mt-2 text-center">
                                    <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 max-w-24">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-4 ${stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-300'
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