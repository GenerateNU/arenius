import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reconcile } from "@/services/lineItems";
import {
  EmissionsFactor,
  LineItem,
  ReconcileRequest,
  SimpleContact,
} from "@/types";
import { Row } from "@tanstack/react-table";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import EmissionsFactorSelector from "./CategorySelector";
import { ContactProvider } from "@/context/ContactContext";
import ContactsSelector from "./ContactsSelector";

interface ModalDialogProps {
  selectedRowData: Row<LineItem>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onReconcileSuccess: () => void;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  selectedRowData,
  isDialogOpen,
  setIsDialogOpen,
  onReconcileSuccess,
}) => {
  const [scope, setScope] = useState(
    selectedRowData.original.scope?.toString()
  );
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>({
    name: selectedRowData.original.emission_factor_name,
    activity_id: selectedRowData.original.emission_factor_id,
  } as EmissionsFactor);
  const [contact, setContact] = useState<SimpleContact>({
    name: selectedRowData.original.contact_name,
    id: selectedRowData.original.contact_id,
  } as SimpleContact);

  const date = new Date(selectedRowData.getValue("date"));
  const formattedDate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  const amount = parseFloat(selectedRowData.getValue("total_amount"));
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  async function reconcileItems() {
    const request: ReconcileRequest = {
      lineItemId: selectedRowData.original.id,
      ...(scope && { scope: Number(scope) }),
      ...(emissionsFactor?.activity_id && {
        emissionsFactorId: emissionsFactor.activity_id,
      }),
      ...(contact?.id && { contactId: contact.id }),
    };

    await reconcile(request);
    setIsDialogOpen(false);
    onReconcileSuccess();
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-xl max-w-4xl p-8">
        <DialogHeader className="flex-row justify-between items-center">
          <div className="text-lg text-gray-500">{formattedDate}</div>
          <DialogTitle className="text-lg text-gray-500">Actions</DialogTitle>
        </DialogHeader>

        <div className="flex mt-4 w-full">
          <div className="flex flex-col space-y-2 w-1/3">
            <p className="text-md font-medium">CVS</p>
            <p className="text-3xl font-bold">{formattedAmount}</p>
            <p className="text-sm font-medium text-gray-500">
              {selectedRowData.getValue("description")}
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <p className="text-md font-small text-gray-500">
                Emissions Scope
              </p>
              <Select onValueChange={(value) => setScope(value)}>
                <SelectTrigger className="w-full">
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
