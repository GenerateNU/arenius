import { Item } from "@/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Item[]> {
  return [
    {
      id: "728ed52f",
      description: "Air Travel",
      quantity: 1,
      unit_amount: 100,
      currency_code: "USD",
      emission_factor_name: "air_travel",
    },
    {
      id: "728ed52f",
      description: "Car Travel",
      quantity: 1,
      unit_amount: 200,
      currency_code: "USD",
      emission_factor_name: "air_travel",
    },
    {
      id: "728ed52f",
      description: "Bus Travel",
      quantity: 1,
      unit_amount: 300,
      currency_code: "USD",
      emission_factor_name: "air_travel",
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
