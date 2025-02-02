import { Item } from "@/types";

type ItemTableRowProps = Item;

export default function ItemTableRow({
  description,
  quantity,
  unit_amount,
  emission_factor_name,
}: ItemTableRowProps) {
  return (
    <div className="flex gap-2">
      <p className="w-3/12">{description}</p>
      <p className="w-2/12">${quantity * unit_amount}</p>
      <p className="w-5/12">{emission_factor_name}</p>
      <p className="w-2/12">{Math.floor(Math.random() * 5000)} kg</p>
    </div>
  );
}
