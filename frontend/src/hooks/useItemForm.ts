import { createLineItem } from "@/services/lineItems";
import { useState } from "react";

interface FormData {
  description: string;
  total_amount: string;
  currency_code: string;
}

interface FormErrors {
  description?: string;
  total_amount?: string;
  currency_code?: string;
}

const useItemForm = (onSubmit: () => void) => {
  const defaultForm: FormData = {
    description: "",
    total_amount: "",
    currency_code: "USD",
  };

  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.description) {
      newErrors.description = "Description is required";
    }
    if (!formData.total_amount || Number(formData.total_amount) <= 0) {
      newErrors.total_amount = "Price must be positive";
    }
    if (!formData.currency_code) {
      newErrors.currency_code = "Currency code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await createLineItem({
      description: formData.description,
      total_amount: Number(formData.total_amount),
      currency_code: formData.currency_code,
    });

    setFormData(defaultForm);
    onSubmit();
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
};

export default useItemForm;
