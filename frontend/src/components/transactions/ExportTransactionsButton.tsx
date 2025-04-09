import * as XLSX from "xlsx";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/authApiClient";
import { LineItem } from "@/types";
import { Button } from "../ui/button";

export default function ExportTransactionsButton() {
  const { jwt, user } = useAuth();

  const exportToXLSX = async () => {
    try {
      const reconciledResponse = await apiClient.get(`/line-item/`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        params: {
          unpaginated: true,
          reconciliation_status: "reconciled",
          carbon_offset: false,
          company_id: user?.company_id,
        },
      });

      const unreconciledResponse = await apiClient.get(`/line-item/`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        params: {
          unpaginated: true,
          reconciliation_status: "unreconciled",
          company_id: user?.company_id,
        },
      });

      const offsetResponse = await apiClient.get(`/line-item/`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        params: {
          unpaginated: true,
          carbon_offset: true,
          company_id: user?.company_id,
        },
      });

      // page 1: all reconciled transactions:
      const reconciledData = reconciledResponse.data.line_items.map(
        (line_item: LineItem) => ({
          Description: line_item.description,
          "Total Amount": line_item.total_amount,
          "Currency Code": line_item.currency_code,
          "Emissions Factor": line_item.emission_factor_name,
          Scope: line_item.scope,
          Contact: line_item.contact_name,
          CO2e: line_item.co2,
          Date: new Date(line_item.date).toISOString(),
        })
      );

      // page 2: all unreconciled transactions:
      const unreconciledData = unreconciledResponse.data.line_items.map(
        (line_item: LineItem) => ({
          Description: line_item.description,
          "Total Amount": line_item.total_amount,
          "Currency Code": line_item.currency_code,
          Contact: line_item.contact_name,
          Date: new Date(line_item.date).toISOString(),
        })
      );

      // page 3: all carbon offsets
      const offsetData = offsetResponse.data.line_items.map(
        (line_item: LineItem) => ({
          Description: line_item.description,
          "Total Amount": line_item.total_amount,
          "Currency Code": line_item.currency_code,
          "Emissions Factor": line_item.emission_factor_name,
          Contact: line_item.contact_name,
          CO2e: line_item.co2,
          Date: new Date(line_item.date).toISOString(),
        })
      );

      const workbook = XLSX.utils.book_new();

      const reconciledSheet = XLSX.utils.json_to_sheet(reconciledData);
      XLSX.utils.book_append_sheet(
        workbook,
        reconciledSheet,
        "Reconciled Transactions"
      );

      const unreconciledSheet = XLSX.utils.json_to_sheet(unreconciledData);
      XLSX.utils.book_append_sheet(
        workbook,
        unreconciledSheet,
        "Unreconciled Transactions"
      );

      const offsetSheet = XLSX.utils.json_to_sheet(offsetData);
      XLSX.utils.book_append_sheet(workbook, offsetSheet, "Carbon Offsets");

      const filename =
        "arenius_transactions_" +
        new Date().toISOString().split("T")[0] +
        ".xlsx";
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error exporting XLSX:", error);
    }
  };

  return (
    <Button
      size="lg"
      className="font-semibold space-x-2"
      onClick={exportToXLSX}
    >
      <Image
        src="/download.svg"
        alt=""
        width={15}
        height={15}
        className="mr-1"
      />
      <span>Export</span>
    </Button>
  );
}
