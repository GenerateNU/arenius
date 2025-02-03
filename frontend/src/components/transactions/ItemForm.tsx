"use client";

import { createLineItem } from "@/services/lineItems";
import React, { useState } from "react";
import TextInput from "../base/textInput";

type FormProps = {
  onSubmit: () => void;
};

export default function Form({ onSubmit }: FormProps) {
  const defaultForm = {
    description: "",
    quantity: "",
    unit_amount: "",
    currency_code: "USD",
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(Number(formData.quantity))) {
      alert("Quantity must be a number.");
      return;
    }

    if (
      isNaN(Number(formData.unit_amount)) ||
      Number(formData.unit_amount) < 0
    ) {
      alert("Price must be a positive number.");
      return;
    }

    await createLineItem({
      ...formData,
      quantity: Number(formData.quantity),
      unit_amount: Number(formData.unit_amount),
    });

    setFormData(defaultForm);
    onSubmit();
  };

  return (
    <div className="py-4">
      <form onSubmit={handleSubmit} className="mb-4 flex flex-row gap-6">
        <TextInput
          value={formData.description}
          onChange={handleChange}
          label="Description"
          placeholder="January electricity"
        />

        <TextInput
          id="unit_amount"
          value={formData.unit_amount}
          onChange={handleChange}
          label="Price"
          placeholder="$"
          required
        />

        <div>
          <label htmlFor="currencyCode" className="block mb-1 font-medium">
            Currency Code
          </label>
          <select
            id="currencyCode"
            name="currencyCode"
            value={formData.currency_code}
            onChange={handleChange}
            className="border text-black rounded p-2 w-full"
            required
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-7 h-full"
        >
          Add Item
        </button>
      </form>
    </div>
  );
}
