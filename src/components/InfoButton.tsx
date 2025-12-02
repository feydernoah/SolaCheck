"use client";

import { MdHelpOutline } from "react-icons/md";

interface InfoButtonProps {
  onClick: () => void;
}

export function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-14 xl:h-14 rounded-full bg-yellow-400 hover:bg-yellow-500 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
      aria-label="Mehr Informationen"
      title="Mehr Informationen zu dieser Frage"
    >
      <MdHelpOutline className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-6 sm:h-7 md:h-7 lg:h-8 xl:h-8 text-white" />
    </button>
  );
}
