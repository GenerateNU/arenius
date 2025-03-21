import { mkConfig, generateCsv, download } from 'export-to-csv';
import { GetContactsRequest } from '@/types';
import { useContacts } from '@/context/ContactsContext';
import { Button } from '../ui/button';

export default function ExportContactsButton() {
  const { data: contacts, fetchData, filters, setFilters } = useContacts();

  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
  });

  const exportToCSV = async () => {
    try {
      setFilters({
        ...filters,
        unpaginated: true
      } as GetContactsRequest); // TODO: how to handle setting the filters without reloading the page?

      await fetchData();

      setFilters({
        ...filters,
        unpaginated: false
      } as GetContactsRequest);

      const csvData = contacts.contacts.map(contact => ({
        Name: contact.name,
        Scope: 1, // TODO remove hardcode for these fields
        Title: "Industry/Title",
        Phone: contact.phone,
        Email: contact.email,
        City: contact.city,
        State: contact.state,
        CreatedAt: new Date(contact.created_at).toISOString(),
        UpdatedAt: new Date(contact.updated_at).toISOString()
      }));

      const filename = 'contacts_export_' + new Date().toISOString().split('T')[0];
      const csv = generateCsv(csvConfig)(csvData);
      download({...csvConfig, filename: filename})(csv);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  return (
    <Button onClick={exportToCSV}>Export</Button>
  );
}
