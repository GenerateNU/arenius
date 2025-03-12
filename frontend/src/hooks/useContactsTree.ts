// hooks/useContactsTree.ts

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { useContacts } from "@/context/ContactsContext";

const useContactsTree = () => {
  const { data: contacts } = useContacts(); // Retrieve contacts from context
  const [data, setData] = useState<{ x: string; y: number }[]>([]);

  const contactId = contacts?.[0]?.id || null; // Get first contact ID or handle dynamically

  useEffect(() => {
    if (!contactId) return;

    const fetchEmissions = async () => {
      try {
        let response;
        try {
          response = await apiClient.get("/contact/emissions", {
            params: contactId,
          });
        } catch (error) {
          console.error("Error fetching dashboard items", error);
          return [];
        }
        const result = await response.data.json();
        setData([{ x: result.contact, y: result.carbon }]); // Transform response
      } catch (error) {
        console.error("Error fetching emissions:", error);
      }
    };

    fetchEmissions();
  }, [contactId]);

  return data;
};

export default useContactsTree;
