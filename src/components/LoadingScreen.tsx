interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingScreen({ isVisible, message = 'Berechne deine Empfehlung...' }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 border-r-yellow-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Message */}
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
