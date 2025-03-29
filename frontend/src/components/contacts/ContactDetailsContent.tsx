"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { ContactLineItemTable } from "@/components/contacts/ContactLineItemTable";
import { ArrowLeft, MapPin, Mail, Phone } from "lucide-react";
import { GetLineItemResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ContactDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

interface ContactSummary {
  totalSpent: number;
  totalTransactions: number;
  totalEmissions: number;
}

interface ContactWithDetails {
  contact: ContactDetails;
  summary: ContactSummary;
  transactions: GetLineItemResponse;
}

export default function ContactDetailsContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");
  const [contactDetails, setContactDetails] = useState<ContactWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jwt } = useAuth();
  const router = useRouter();

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
        console.log(transactions);
        
        setContactDetails({
          contact,
          summary: {
            totalSpent: summary.total_spent,
            totalTransactions: summary.total_transactions,
            totalEmissions: summary.total_emissions,
          },
          transactions: transactions,
        });

        setLoading(false);
      } catch (err) {
        setError(`Failed to load contact details: ${err}`);
        setLoading(false);
      }
    }

    fetchContactDetails();
  }, [contactId, jwt]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-red-500">
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!contactId) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">Contact ID missing</div>
    </div>
  );
  
  if (!contactDetails) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">No contact found</div>
    </div>
  );

  const { contact, summary, transactions } = contactDetails;
  const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1">
      {/* Top navigation bar */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-red-600 rounded-full h-8 w-8 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <span className="text-xl font-bold">{contact.name}</span>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          Export
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Main content area */}
        <div className="grid grid-cols-1 gap-6">
          {/* Contact card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start">
              {/* Logo */}
              <div className="mr-6">
                <div className="bg-red-600 rounded-full h-20 w-20 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">{contact.name}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{contact.city}, {contact.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Spend</h3>
              </div>
              <p className="text-2xl font-bold">
                ${summary?.totalSpent?.toLocaleString() || "0"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
              </div>
              <p className="text-2xl font-bold">{summary.totalTransactions} Transactions</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Emissions</h3>
              </div>
              <p className="text-2xl font-bold">{summary.totalEmissions} Tn CO₂</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">All Transactions</h3>
            </div>
            <div className="p-4">
              <ContactLineItemTable data={transactions.line_items} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}