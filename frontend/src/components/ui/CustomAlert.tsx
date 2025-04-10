import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

export type CustomAlertProps = {
  variant?: "default" | "destructive";
  title: string;
  description?: string;
  onClose?: () => void;
};

const CustomAlert = ({
  variant = "default",
  title,
  description,
  onClose,
}: CustomAlertProps) => {
  return (
    <Alert variant={variant}>
      <div className="flex items-center space-x-4">
        <AlertCircle className="h-4 w-4" />
        <div>
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-2 right-2">
            <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>
    </Alert>
  );
};

export default CustomAlert;
