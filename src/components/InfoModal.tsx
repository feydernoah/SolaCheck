"use client";

import { useEffect, useCallback } from "react";
import { MdClose } from "react-icons/md";
import { QuestionInfo, EcologicalInfo } from "@/data/questionInfoData";
import { useRouter } from "next/navigation";


interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  info?: QuestionInfo | EcologicalInfo | undefined;
  title?: string;
  content?: React.ReactNode;
  sources?: string;
}

export function InfoModal({ isOpen, onClose, info, title: propTitle, content: propContent, }: InfoModalProps) {
  const router = useRouter();
  
  // Extract title and content from either info object or direct props
  const modalTitle = propTitle ?? (info && 'title' in info ? info.title : undefined);
  const modalContent = propContent ?? (info && 'content' in info ? info.content : undefined);
  
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !modalTitle || !modalContent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-xl font-bold text-white">?</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 pr-8">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-yellow-100 transition-colors"
            aria-label="Schließen"
          >
            <MdClose className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="text-gray-700 leading-relaxed">{modalContent}</div>
        </div>

        {/* Footer */}
     <div className="p-4 border-t border-gray-200 bg-gray-50">
  <button
    type="button"
    onClick={() => {
      onClose();
      router.push("/info-page");
    }}
    className="w-full mb-3 text-sm font-medium text-blue-700 hover:underline"
  >
    Für mehr Infos klicke hier.
  </button>

  <button
    onClick={onClose}
    className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold rounded-lg transition-colors"
  >
    Schließen
  </button>
</div>

      </div>
    </div>
  );
}