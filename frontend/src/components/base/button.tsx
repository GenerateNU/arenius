import React from "react";

type ButtonProps = {
  id?: string;
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "submit" | "button" | "reset";
  error?: string;
};

const Button: React.FC<ButtonProps> = ({
  id,
  label,
  onClick,
  type = "button",
  error,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <button
        id={id}
        type={type}
        onClick={onClick}
        className="mt-4 w-full p-2 rounded-lg transition font-medium bg-gray-200 text-black hover:bg-gray-300">
        {label}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default Button;
