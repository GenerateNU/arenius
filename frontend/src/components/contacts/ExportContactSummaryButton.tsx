import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import apiClient from '@/services/apiClient';
import { LineItem } from '@/types';

interface ExportContactSummaryButtonProps {
    contactId: string;
}

export default function ExportContactSummaryButton({contactId} : ExportContactSummaryButtonProps) {
  const { jwt } = useAuth();

  const exportToXLSX = async () => {
    try {
        const response = await apiClient.get(`/contact/${contactId}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
        // TODO: what type is returned?
  
        const trasactionsResponse = await apiClient.get(`/line-item/`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            params: {
                contact_id: contactId,
                unpaginated: true,
            },
        });
  
        const { contact, summary } = response.data;

        console.log(summary)

        // First sheet to be the summary data
        const summaryData = [
            { Metric: "Contact:", Value: contact.name },
            { Metric: "Total Spend", Value: summary.total_spent },
            { Metric: "Total Transactions", Value: summary.total_transactions },
            { Metric: "Total Emissions", Value: summary.total_emissions },
            { Metric: "Export Timestamp", Value: new Date().toISOString()}
        ];

        // Second sheet will have transactions data
        const transactionsData = trasactionsResponse.data.line_items.map((line_item: LineItem) => ({
            Description: line_item.description,
            "Total Amount": line_item.total_amount,
            "Currency Code": line_item.currency_code,
            "Emissions Factor": line_item.emission_factor_name,
            Scope: line_item.scope,
            Contact: line_item.contact_name, // I know this is a bit redundant, but might as well
            CO2: line_item.co2,
            Date: new Date(line_item.date).toISOString(),
        }));

        const workbook = XLSX.utils.book_new();

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

        const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
        XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");
        
        const filename = "arenius_contact_" + contact.name + "_summary_"  + new Date().toISOString().split("T")[0] + ".xlsx";
        XLSX.writeFile(workbook, filename);
    } catch (error) {
        console.error("Error exporting XLSX:", error);
    }
  };


  return (
    <Button variant="outline" className="flex items-center gap-2" onClick={exportToXLSX}>
        Export
    </Button>
  );
}
