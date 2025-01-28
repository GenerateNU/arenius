"use client";

import { createDashboardItem } from "@/services/dashboard";
import React, { useState } from "react";

type FormProps = {
  onSubmit: () => void;
};

export default function Form({ onSubmit }: FormProps) {
  const defaultForm = {
    description: "",
    quantity: "",
    price: "",
    currencyCode: "USD",
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

    if (isNaN(Number(formData.price))) {
      alert("Price must be a number.");
      return;
    }

    await createDashboardItem({
      description: formData.description,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      currencyCode: formData.currencyCode
    });

    setFormData(defaultForm);
    onSubmit();
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4 space-y-4">
        <div>
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border text-black rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block mb-1 font-medium">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border text-black rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-1 font-medium">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="border text-black rounded p-2 w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="currencyCode" className="block mb-1 font-medium">
            Currency Code
          </label>
          <select
            id="currencyCode"
            name="currencyCode"
            value={formData.currencyCode}
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
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      </form>
    </div>
  );
}
