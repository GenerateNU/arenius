import { useState } from "react";
import { Item } from "@/types";

type ItemTableRowProps = Item;

export default function ItemTableRow({
  description,
  quantity,
  unit_amount,
  emission_factor_name,
}: ItemTableRowProps) {
  const [factor, setFactor] = useState("Select an emissions factor");

  return (
    <div className="flex gap-2">
      <p className="w-3/12">{description}</p>
      <p className="w-2/12">${quantity * unit_amount}</p>
      <p className="w-5/12">
        {emission_factor_name ? (
          emission_factor_name
        ) : (
          <select
            id="currencyCode"
            name="currencyCode"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            className="border text-black rounded w-full"
            required
          >
            <option value="Select an emissions factor" disabled>
              Select an emissions factor
            </option>
            <option value="USD">Pickup trucks/vans and SUVs</option>
            <option value="EUR">Construction work</option>
            <option value="GBP">Electricity</option>
            <option value="JPY">Gas</option>
            <option value="AUD">Dry-cleaning and laundry</option>
          </select>
        )}
      </p>
      <p className="w-2/12">
        {emission_factor_name ? `${Math.floor(Math.random() * 5000)} kg` : ""}
      </p>
    </div>
  );
}
