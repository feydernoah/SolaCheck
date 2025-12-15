interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

import SolaCalculationAnimation from './SolaCalculationAnimation';

export function LoadingScreen({ isVisible, message = 'Berechne deine Empfehlung...' }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 animate-fade-in">
      <SolaCalculationAnimation frameCount={9} frameRateMs={120} width={160} height={160} />
      <p className="text-heading-3 font-semibold text-gray-800 mb-2 mt-8">
        {message}
      </p>
      <p className="text-body-sm text-gray-600">
        Das dauert nur einen Moment...
      </p>
    </div>
  );
}
