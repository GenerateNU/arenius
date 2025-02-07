import React from "react";

type TextInputProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
  required?: boolean;
  error?: string;
};

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  placeholder = "Enter text",
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-black">{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`border rounded-lg p-2 focus:outline-none focus:ring-2 text-black ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        } disabled:bg-gray-100`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default TextInput;
