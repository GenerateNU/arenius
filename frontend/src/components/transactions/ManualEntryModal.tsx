import React from "react";
import {
  Dialog,
  DialogContent,
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
        Add Manual Upload
      </DialogTrigger>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <ItemForm />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ManualEntryModal;
