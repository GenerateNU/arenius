"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { reconcile } from "@/services/lineItems";
import {
  EmissionsFactor,
  LineItem,
  ReconcileRequest,
  SimpleContact,
} from "@/types";
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import EmissionsFactorSelector from "./CategorySelector";
import { ContactProvider } from "@/context/ContactContext";
import ContactsSelector from "./ContactsSelector";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";

interface ModalDialogProps {
  selectedRowData: LineItem;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onReconcileSuccess: () => void;
  type: "reconciled" | "unreconciled" | "offsets";
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  selectedRowData,
  isDialogOpen,
  setIsDialogOpen,
  onReconcileSuccess,
  type,
}) => {
  const router = useRouter();
  const [scope, setScope] = useState(selectedRowData.scope?.toString());
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>({
    name: selectedRowData.emission_factor_name,
    activity_id: selectedRowData.emission_factor_id,
  } as EmissionsFactor);
  const [contact, setContact] = useState<SimpleContact>({
    name: selectedRowData.contact_name,
    id: selectedRowData.contact_id,
  } as SimpleContact);
  const [carbon, setCarbon] = useState<number>(selectedRowData.co2 ?? 0);

  const date = new Date(selectedRowData.date);
  const formattedDate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  const amount = selectedRowData.total_amount;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  async function reconcileItems() {
    const request: ReconcileRequest = {
      lineItemId: selectedRowData.id,
      ...(scope && { scope: Number(scope) }),
      ...(emissionsFactor && {
        emissionsFactorId: emissionsFactor.activity_id,
      }),
      ...(contact?.id && { contactId: contact.id }),
      ...(carbon && { co2: carbon }),
      co2_unit: "kg",
    };
    console.log("Reconcile request:", request);

    await reconcile(request);
    setIsDialogOpen(false);
    onReconcileSuccess();
  }

  const handleContactNavigation = () => {
    if (contact) {
      router.push(`/contacts/details?contactId=${contact.id}`);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-xl max-w-4xl p-8">
        <DialogHeader className="flex-row justify-between items-center">
          <div className="text-lg text-gray-500">{formattedDate}</div>
          <div>{contact.name}</div>
          {contact?.id && (
            <Button
              variant="ghost"
              onClick={handleContactNavigation}
              className="flex items-center gap-2"
            >
              View contact history
            </Button>
          )}
        </DialogHeader>

        <div className="flex mt-4 w-full gap-8">
          <div className="flex flex-col space-y-2 w-1/4">
            <p className="text-xl font-bold">{formattedAmount}</p>
            <p className="text-xl font-medium text-gray-500">
              {selectedRowData.description}
            </p>
          </div>
          <div className="space-y-4 w-full">
            {type === "reconciled" && (
              <>
                <div className="space-y-2">
                  <p className="text-md font-small text-gray-500">
                    Emissions Scope
                  </p>
                  <Select onValueChange={(value) => setScope(value)}>
                    <SelectTrigger>
                      {scope ? `Scope ${scope}` : "Select scope"}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Scope 1</SelectItem>
                      <SelectItem value="2">Scope 2</SelectItem>
                      <SelectItem value="3">Scope 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-md font-small text-gray-500">
                    Emissions Factor
                  </p>
                  <EmissionsFactorSelector
                    emissionsFactor={emissionsFactor}
                    setEmissionsFactor={setEmissionsFactor}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <p className="text-md font-small text-gray-500">Contact Name</p>
              <ContactProvider>
                <ContactsSelector
                  contact={contact}
                  setContact={setContact}
                  variant="outline"
                />
              </ContactProvider>
            </div>

            {type === "offsets" && (
              <div className="flex flex-col items-center">
                <label className="text-sm font-medium w-full">
                  Carbon offset (kg)
                </label>
                <Input
                  type="number"
                  className="bg-white"
                  value={carbon ?? "0"}
                  onChange={(e) => setCarbon(parseFloat(e.target.value))}
                  placeholder="10 kg"
                  min="0"
                />
              </div>
            )}

            <div className="mt-4">
              <Button onClick={reconcileItems} className="w-full">
                Reconcile
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
