"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { ContactLineItemTable } from "@/components/contacts/ContactLineItemTable";
import { MapPin, Mail, Phone } from "lucide-react";
import { Contact, GetLineItemResponse, LineItem } from "@/types";
import ExportContactSummaryButton from "./ExportContactSummaryButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "../ui/loading-spinner";
import Link from "next/link";
import EditContactModal from "./EditContactModal";
import { formatNumber } from "@/lib/utils";

interface ContactSummary {
  totalSpent: number;
  totalTransactions: number;
  totalOffsetTransactions: number;
  totalEmissions: number;
  totalOffset: number;
}

export interface ContactWithDetails {
  contact: Contact;
  summary: ContactSummary;
  transactions: GetLineItemResponse;
}

export default function ContactDetailsContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");
  const [contactDetails, setContactDetails] = useState<ContactWithDetails>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jwt } = useAuth();

  // New state for categorized transactions
  const [transactionItems, setTransactionItems] = useState<LineItem[]>([]);
  const [offsetItems, setOffsetItems] = useState<LineItem[]>([]);
  const [unreconciledItems, setUnreconciledItems] = useState<LineItem[]>([]);

  async function fetchContactDetails() {
    if (!contactId) return;

    try {
      const response = await apiClient.get(`/contact/${contactId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const transactionsResponse = await apiClient.get(`/line-item/`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        params: {
          contact_id: contactId,
        },
      });

      const { contact, summary } = response.data;
      const transactions = transactionsResponse.data;

      setContactDetails({
        contact,
        summary: {
          totalSpent: summary.total_spent,
          totalTransactions: summary.total_transactions,
          totalEmissions: summary.total_emissions,
          totalOffset: summary.total_offset,
          totalOffsetTransactions: summary.total_offset_transactions,
        },
        transactions: transactionsResponse.data,
      });
      // Categorize line items by scope
      if (transactions.line_items) {
        setTransactionItems(
          transactions.line_items.filter(
            (item: LineItem) => (item.scope ?? -1) > 0
          )
        );
        setOffsetItems(
          transactions.line_items.filter((item: LineItem) => item.scope === 0)
        );
        setUnreconciledItems(
          transactions.line_items.filter(
            (item: LineItem) => item.scope === null || item.scope === undefined
          )
        );
      }

      setLoading(false);
    } catch (err) {
      setError(`Failed to load contact details: ${err}`);
      setLoading(false);
    }
  }

  useEffect(() => {
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
    if (!contactDetails) return "77B257"; // Default color
    const seed = contactDetails.contact.id || contactDetails.contact.name;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorOptions = [
      "77B257",
      "1B3520",
      "2B3E1B",
      "B9E89E",
      "2D7A14",
      "145C3E",
      "48894B",
      "152D1A",
      "578240",
      "AADDAA",
      "8ACB65",
    ];
    const colorIndex = Math.abs(hash) % colorOptions.length;
    return colorOptions[colorIndex];
  }, [contactDetails]);

  if (loading)
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
        <LoadingSpinner className="mx-auto mt-20" size={60} />
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

  const formatDate = (timestamp: string | number | Date) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting last updated:", e);
      return timestamp.toString();
    }
  };

  const setContact = (contact: Contact) => {
    setContactDetails((prev) => ({
      ...prev!,
      contact,
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top navigation bar */}
      <div className="p-4 flex items-center justify-between top-0 z-10">
        <div className="flex items-center space-x-1 text-base">
          <Link href="/contacts" className="text-green-600 hover:underline">
            Contacts
          </Link>
          <span className="text-gray-600">/ {contact.name}</span>
        </div>
        <ExportContactSummaryButton contactId={contactId} />
      </div>

      <div className="p-4 mx-auto w-full max-w-7xl">
        {/* Contact Header Card with Overview and Notes - This is the white box */}
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

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center mb-1">
                    <h2 className="text-2xl font-bold">{contact.name}</h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created {formatDate(contact.created_at || "")}
                  </p>
                  {contact.updated_at && (
                    <span className="text-xs text-gray-500 mb-4">
                      Last Updated: {formatDate(contact.updated_at)}
                    </span>
                  )}
                </div>
                <EditContactModal contact={contact} setContact={setContact} />
              </div>
              <div className="w-full flex justify-between">
                {(contact.city || contact.state) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>
                      {contact.city}, {contact.state}
                    </span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Only show additional information section if either overview or notes exist */}
          {(contact.client_overview || contact.notes) && (
            <div className="border-t border-gray-100 relative">
              {/* Vertical divider that extends to the edges */}
              {contact.client_overview && contact.notes && (
                <div className="hidden md:block absolute w-px bg-gray-100 left-1/2 top-0 bottom-0"></div>
              )}

              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2">
                {/* Client Overview Section */}
                {contact.client_overview && (
                  <div className="p-3 pr-6">
                    <div className="mb-1">
                      <h3 className="text-sm font-medium text-gray-700">
                        Client Overview
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {contact.client_overview}
                    </p>
                  </div>
                )}

                {/* Notes Section */}
                {contact.notes && (
                  <div className="p-3 md:pl-6">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-700">
                        Notes
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {contact.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Transactions and Summary section - Outside the white contact details box */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Left side - Transactions */}
          <div className="md:col-span-5">
            <h2 className="text-xl font-bold ml-7 mb-4">All Transactions</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Tabs defaultValue="transactions" className="w-full">
                <div className="border-b">
                  <TabsList className="p-0 bg-transparent w-full flex rounded-none border-b">
                    <TabsTrigger
                      value="transactions"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-freshSage data-[state=active]:shadow-none rounded-none flex-1"
                    >
                      Reconciled ({transactionItems.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="offsets"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-freshSage data-[state=active]:shadow-none rounded-none flex-1"
                    >
                      Offsets ({offsetItems.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="unreconciled"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-freshSage data-[state=active]:shadow-none rounded-none flex-1"
                    >
                      Unreconciled ({unreconciledItems.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="transactions" className="p-0 m-0">
                  {transactionItems.length > 0 ? (
                    <ContactLineItemTable
                      data={transactionItems}
                      tableType="reconciled"
                      onReconcile={fetchContactDetails}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No transaction data.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="offsets" className="p-0 m-0">
                  {offsetItems.length > 0 ? (
                    <ContactLineItemTable
                      data={offsetItems}
                      tableType="offsets"
                      onReconcile={fetchContactDetails}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No offset data.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="unreconciled" className="p-0 m-0">
                  {unreconciledItems.length > 0 ? (
                    <ContactLineItemTable
                      data={unreconciledItems}
                      tableType="unreconciled"
                      onReconcile={fetchContactDetails}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No unreconciled data.
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
                <p className="font-bold">
                  ${summary?.totalSpent?.toLocaleString() || "0"}
                </p>
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
                <h3 className="font-medium ">Reconciled Emissions</h3>
                <p className="font-bold ml-4 whitespace-nowrap">
                  {formatNumber(summary.totalEmissions)} kg CO<sub>2</sub>e
                </p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-medium">Offset Emissions</h3>
                <p className="font-bold whitespace-nowrap">
                  {formatNumber(summary.totalOffset, "0")} kg CO<sub>2</sub>e
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
