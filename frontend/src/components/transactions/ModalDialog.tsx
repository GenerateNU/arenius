import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LineItem } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import EmissionsFactorSelector from "./CategorySelector";
import React, { useState } from "react";
import { EmissionsFactor, ReconcileRequest } from "@/types";
import { reconcile } from "@/services/lineItems";
import { Row } from "@tanstack/react-table";

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

  const [scope, setScope] = useState("");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();

  const date = new Date(selectedRowData.getValue("date"));
  const formattedDate = date.getFullYear() + "/" + date.getMonth() + 1 + "/" + date.getDate();

  async function reconcileItems() {
    const request: ReconcileRequest = {
      lineItemId: selectedRowData.original.id,
      scope: Number(scope),
      emissionsFactorId: emissionsFactor?.activity_id,
    };

    await reconcile(request);
    setIsDialogOpen(false);
    onReconcileSuccess(); 
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-xl max-w-4xl p-8">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-lg font-semibold text-gray-500">{formattedDate}</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-8 mt-4 w-full">
          <div className="flex-1 space-y-4">
            <p className="text-md font-medium">CVS</p>
            <p className="text-md font-medium">{selectedRowData.getValue('description')}</p>
          </div>

          <div className="flex-1 space-y-4">
            <p className="text-md font-medium">Actions</p>
            
            <div className="space-y-2">
              <p className="text-md font-small text-gray-500">Emissions Scope</p>
              <Select onValueChange={(value) => setScope(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Scope 1</SelectItem>
                  <SelectItem value="2">Scope 2</SelectItem>
                  <SelectItem value="3">Scope 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-md font-small text-gray-500">Emissions Factor</p>
              <EmissionsFactorSelector
                emissionsFactor={emissionsFactor}
                setEmissionsFactor={setEmissionsFactor}
              />
            </div>

            <div className="space-y-2">
              <p className="text-md font-small text-gray-500">User group</p>
              <p className="text-md font-small text-black-500">Contact name</p>
            </div>

            <div className="mt-4">
              <Button onClick={reconcileItems} className="w-full">
                Reconcile
              </Button>
            </div>
          </div>
        </div>


        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
