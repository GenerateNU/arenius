"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { ContactLineItemTable } from "@/components/contacts/ContactLineItemTable";
import { ArrowLeft, MapPin, Mail, Phone } from "lucide-react";
import { GetLineItemResponse, LineItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ExportContactSummaryButton from "./ExportContactSummaryButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

interface ContactDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  created_at?: string;
  scope?: number;
}

interface ContactSummary {
  totalSpent: number;
  totalTransactions: number;
  totalOffsetTransactions: number;
  totalEmissions: number;
  totalOffset: number;
}

interface ContactWithDetails {
  contact: ContactDetails;
  summary: ContactSummary;
  transactions: GetLineItemResponse;
}

export default function ContactDetailsContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");
  const [contactDetails, setContactDetails] =
    useState<ContactWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jwt } = useAuth();
  const router = useRouter();

  // New state for categorized transactions
  const [transactionItems, setTransactionItems] = useState<LineItem[]>([]);
  const [offsetItems, setOffsetItems] = useState<LineItem[]>([]);
  const [unreconciledItems, setUnreconciledItems] = useState<LineItem[]>([]);

  useEffect(() => {
    async function fetchContactDetails() {
      if (!contactId) return;

      try {
        const response = await apiClient.get(`/contact/${contactId}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        const trasactionsResponse = await apiClient.get(`/line-item/`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          params: {
            contact_id: contactId,
          },
        });

        const { contact, summary } = response.data;
        const transactions = trasactionsResponse.data;

        setContactDetails({
          contact,
          summary: {
            totalSpent: summary.total_spent,
            totalTransactions: summary.total_transactions,
            totalEmissions: summary.total_emissions,
            totalOffset: summary.total_offset,
            totalOffsetTransactions: summary.total_offset_transactions,
          },
          transactions: transactions,
        });

        // Categorize line items by scope
        if (transactions.line_items) {
          setTransactionItems(transactions.line_items.filter((item: LineItem) => item.scope > 0));
          setOffsetItems(transactions.line_items.filter((item: LineItem) => item.scope === 0));
          setUnreconciledItems(transactions.line_items.filter((item: LineItem) => item.scope === null || item.scope === undefined));
        }

        setLoading(false);
      } catch (err) {
        setError(`Failed to load contact details: ${err}`);
        setLoading(false);
      }
    }

    fetchContactDetails();
  }, [contactId, jwt]);

  const initials = useMemo(() => {
    if (!contactDetails) return "";
    return contactDetails.contact.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [contactDetails]);

  const avatarBgColor = useMemo(() => {
    if (!contactDetails) return "dc2626"; // Default color
    const seed = contactDetails.contact.id || contactDetails.contact.name;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorOptions = [
      "dc2626", "ea580c", "65a30d", "16a34a", "0d9488",
      "0284c7", "4f46e5", "7c3aed", "c026d3", "db2777", "475569",
    ];
    const colorIndex = Math.abs(hash) % colorOptions.length;
    return colorOptions[colorIndex];
  }, [contactDetails]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );

  if (!contactId)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          Contact ID missing
        </div>
      </div>
    );

  if (!contactDetails)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          No contact found
        </div>
      </div>
    );

  const { contact, summary } = contactDetails;

  // Format date distance
  const getTimeAgo = () => {
    if (!contact.created_at) return "Recently added";
    try {
      return `Added ${formatDistanceToNow(new Date(contact.created_at))} ago`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Recently added";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top navigation bar */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div 
                className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: `#${avatarBgColor}` }}
              >
                {initials}
              </div>
              <span className="text-xl font-bold">{contact.name}</span>
            </div>
          </div>
        </div>
        <ExportContactSummaryButton contactId={contactId} />
      </div>

      <div className="p-4 mx-auto w-full max-w-7xl">
        {/* Contact Header Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 flex flex-col md:flex-row md:items-center">
            {/* Logo */}
            <div className="mr-6 mb-4 md:mb-0">
              <div 
                className="h-24 w-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border border-gray-200"
                style={{ backgroundColor: `#${avatarBgColor}` }}
              >
                {initials}
              </div>
            </div>

            {/* Contact Details */}
            <div className="flex-1">
              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  <h2 className="text-2xl font-bold">{contact.name}</h2>
                  {contact.scope && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Scope {contact.scope}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">{getTimeAgo()}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {contact.city || "Boston"}, {contact.state || "MA"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{contact.phone || "999-999-9999"}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button 
                variant="ghost" 
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={() => console.log("Edit Contact")}
              >
                Edit Contact
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Left side - Transactions */}
          <div className="md:col-span-5">
            <h2 className="text-xl font-bold mb-4">All Transactions</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Tabs defaultValue="transactions" className="w-full">
                <div className="border-b">
                  <TabsList className="p-0 bg-transparent w-full flex rounded-none border-b">
                    <TabsTrigger 
                      value="transactions" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none flex-1"
                    >
                      Reconciled ({transactionItems.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="offsets" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none flex-1"
                    >
                      Offsets ({offsetItems.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="unreconciled" 
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none flex-1"
                    >
                      Unreconciled ({unreconciledItems.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="transactions" className="p-0 m-0">
                  {transactionItems.length > 0 ? (
                    <ContactLineItemTable data={transactionItems} tableType="reconciled" />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No transaction data available.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="offsets" className="p-0 m-0">
                  {offsetItems.length > 0 ? (
                    <ContactLineItemTable data={offsetItems} tableType="offsets" />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No offset data available.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="unreconciled" className="p-0 m-0">
                  {unreconciledItems.length > 0 ? (
                    <ContactLineItemTable data={unreconciledItems} tableType="unreconciled" />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No unreconciled data available.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right side - Summary */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y">
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Total Spent</h3>
                <p className="font-bold">${summary?.totalSpent?.toLocaleString() || "0"}</p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Total Transactions</h3>
                <p className="font-bold">{summary.totalTransactions}</p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Total Offsets</h3>
                <p className="font-bold">{summary.totalOffsetTransactions}</p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Gross Emissions</h3>
                <p className="font-bold">{summary.totalEmissions} Kg CO<sub>2</sub></p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Net Emissions</h3>
                <p className="font-bold">{summary.totalEmissions - summary.totalOffset} Kg CO<sub>2</sub></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}