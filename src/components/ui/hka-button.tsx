import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  color?: "primary" | "secondary" | "approve";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
};

const HKAButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  color = "primary",
  size = "medium",
  disabled = false,
}) => {
  const baseStyles =
    "rounded-none font-['GT_Pressura_Mono_Bold_Bold'] focus:outline-none transition-colors cursor-pointer";

  const colorStyles = {
    primary: "bg-[#d72305] text-white hover:text-black",
    secondary: "bg-[#f7d3cd] text-black hover:bg-[#eb9182]",
    approve: "bg-[#288732] text-white hover:bg-[#d4e7d6] hover:text-black",
  };

  const sizeStyles = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${colorStyles[color]} ${sizeStyles[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};

export default HKAButton;