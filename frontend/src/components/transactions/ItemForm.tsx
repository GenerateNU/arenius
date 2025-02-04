import React from "react";
import TextInput from "../base/textInput";
import useItemForm from "@/hooks/useItemForm";
import Dropdown from "../base/dropdown";

type FormProps = {
  onSubmit: () => void;
};

export default function Form({ onSubmit }: FormProps) {
  const { formData, errors, handleChange, handleSubmit } =
    useItemForm(onSubmit);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextInput
          id="description"
          value={formData.description}
          onChange={handleChange}
          label="Description"
          placeholder="January electricity"
          error={errors.description}
          required
        />
        <TextInput
          id="unit_amount"
          value={formData.unit_amount}
          onChange={handleChange}
          label="Price"
          placeholder="$"
          error={errors.unit_amount}
          type="number"
          required
        />

        <Dropdown
          id="currency_code"
          value={formData.currency_code}
          onChange={handleChange}
          options={["USD", "EUR", "GBP", "JPY", "AUD"]}
          label="Currency"
          error={errors.currency_code}
          required
        />

        <button type="submit" className={styles.button}>
          Add Item
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: "py-4",
  form: "mb-4 flex flex-row gap-6",
  label: "block mb-1 font-medium",
  select: "border text-black rounded p-2 w-full",
  error: "text-red-500",
  button:
    "bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-6 h-full",
};
