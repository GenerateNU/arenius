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
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

const ManualEntryModal = () => {
  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: "default" }))}>
        Manual entry
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
