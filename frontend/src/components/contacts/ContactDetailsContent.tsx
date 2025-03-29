"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { ContactLineItemTable } from "@/components/contacts/ContactLineItemTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { GetLineItemResponse } from "@/types";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!contactId) return <div>Contact ID missing</div>;
  if (!contactDetails) return <div>No contact found</div>;

  const { contact, summary, transactions } = contactDetails;

  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{contact.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{contact.city}, {contact.state}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{contact.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <span>💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary?.totalSpent?.toLocaleString() || "0"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <span>📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalTransactions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
                <span>🌍</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalEmissions} CO₂</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <ContactLineItemTable data = {transactions.line_items} />

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

