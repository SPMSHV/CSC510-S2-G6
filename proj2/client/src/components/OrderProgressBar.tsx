import type { OrderStatusProgress } from '../types';

interface OrderProgressBarProps {
  progress: OrderStatusProgress;
}

const statusSteps = [
  { label: 'Order Created', progress: 0 },
  { label: 'Preparing Your Order', progress: 25 },
  { label: 'Ready for Pickup', progress: 50 },
  { label: 'Robot Assigned', progress: 60 },
  { label: 'On The Way', progress: 80 },
  { label: 'Delivered', progress: 100 },
];

export default function OrderProgressBar({ progress }: OrderProgressBarProps) {
  const currentStepIndex = statusSteps.findIndex(
    (step) => step.progress === progress.progress
  );

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
        <div
          className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-500 ease-out"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Status Steps */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isCancelled = progress.status === 'CANCELLED';

            return (
              <div key={step.label} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCancelled
                      ? 'bg-red-100 border-red-500'
                      : isCompleted
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCancelled ? (
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : isCompleted ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCurrent ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center max-w-[100px]">
                  <p
                    className={`text-xs font-medium ${
                      isCompleted || isCurrent
                        ? 'text-primary-600'
                        : isCancelled
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Label */}
      <div className="mt-6 text-center">
        <p className="text-lg font-semibold text-gray-900">{progress.statusLabel}</p>
        {progress.estimatedTimeToNext && progress.status !== 'DELIVERED' && progress.status !== 'CANCELLED' && (
          <p className="mt-1 text-sm text-gray-600">
            Estimated time to next step: {progress.estimatedTimeToNext} minutes
          </p>
        )}
      </div>
    </div>
  );
}

