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
      <p className="w-3/12">{description}</p> {/* 40% width */}
      <p className="w-2/12">${quantity * unit_amount}</p> {/* 20% width */}
      <p className="w-5/12">{emission_factor_name}</p> {/* 20% width */}
      <p className="w-2/12">0</p> {/* 20% width */}
    </div>
  );
}
