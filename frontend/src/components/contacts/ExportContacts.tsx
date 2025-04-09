import { mkConfig, generateCsv, download } from "export-to-csv";
import { useContacts } from "@/context/ContactContext";
import Image from "next/image";

export default function ExportContactsButton() {
  const { data } = useContacts();

  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
  });

  const exportToCSV = async () => {
    try {
      const csvData = data.contacts.map((contact) => ({
        Name: contact.name,
        Phone: contact.phone,
        Email: contact.email,
        City: contact.city,
        State: contact.state,
        CreatedAt: new Date(contact.created_at).toISOString(),
        UpdatedAt: new Date(contact.updated_at).toISOString(),
      }));

      const filename =
        "arenius_contacts_" + new Date().toISOString().split("T")[0];
      const csv = generateCsv(csvConfig)(csvData);
      download({ ...csvConfig, filename: filename })(csv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  return (
    <button
      className="w-40 h-10 bg-moss text-white text-sm font-semibold rounded-md flex items-center space-x-2 justify-center"
      onClick={exportToCSV}
    >
      <Image
        src="/download.svg"
        alt=""
        width={15}
        height={15}
        className="mr-1"
      />
      <span>Export</span>
    </button>
  );
}
