import { SolaCalculatingAnimation } from './SolaCalculatingAnimation';

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingScreen({ isVisible, message = 'Berechne deine Empfehlung...' }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center">
        <div className="mb-12 flex justify-center">
          <SolaCalculatingAnimation />
        </div>

        <p className="text-heading-3 font-semibold text-gray-800 mb-2">
          {message}
        </p>
        <p className="text-body-sm text-gray-600">
          Das dauert nur einen Moment...
        </p>
      </div>
    </div>
  );
}
