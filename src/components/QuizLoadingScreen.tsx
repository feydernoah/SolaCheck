import React from "react";
import SolaWalkingAnimation from "../components/SolaWalkingAnimation";

const QuizLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
      <SolaWalkingAnimation frameCount={9} frameRateMs={130} width={160} height={160} fileNamePattern="Sola_walk_{index}.svg" startIndex={1} />
      <div className="mt-6 text-xl font-semibold text-yellow-600 animate-pulse">nächste Frage ...</div>
    </div>
  );
};

export default QuizLoadingScreen;
