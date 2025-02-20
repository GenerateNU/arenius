import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import ItemForm from "./ItemForm";
import { Button } from "../ui/button";

const ManualEntryModal = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Manual entry</Button>
      </DialogTrigger>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a new transaction</DialogTitle>
          <DialogDescription>
            Manually enter transaction details below.
          </DialogDescription>
          <ItemForm />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ManualEntryModal;
