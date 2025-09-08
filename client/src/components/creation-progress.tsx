import { Check, Loader2 } from "lucide-react";

interface CreationProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
  isProcessing?: boolean;
}

export default function CreationProgress({ 
  currentStep, 
  totalSteps, 
  stepNames, 
  isProcessing = false 
}: CreationProgressProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="font-semibold text-foreground mb-4 text-center">
        Creation Progress
      </h3>
      
      <div className="flex items-center justify-between">
        {stepNames.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-coral text-white' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {isCompleted ? (
                  <Check size={20} />
                ) : isCurrent && isProcessing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <span className="text-sm font-bold">{stepNumber}</span>
                )}
              </div>
              
              {/* Step Name */}
              <span className={`
                text-xs text-center transition-colors duration-300
                ${isCompleted || isCurrent 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
                }
              `}>
                {stepName}
              </span>
              
              {/* Connector Line */}
              {index < stepNames.length - 1 && (
                <div className={`
                  absolute top-5 left-1/2 w-full h-0.5 -z-10
                  ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                `} 
                style={{ 
                  width: `calc(100% / ${totalSteps - 1})`,
                  left: `calc(${(index + 1) * 100 / totalSteps}% - 50%)`
                }} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-coral to-turquoise h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
      </div>
    </div>
  );
}
