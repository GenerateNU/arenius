import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog";
import EditContactForm from "./EditContactForm";
import { DialogTitle } from "@radix-ui/react-dialog";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

const EditContactModal = ({ contactId }: { contactId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        className={cn(buttonVariants({ variant: "default" }))}
        onClick={openModal} 
      >
        Edit Contact
      </DialogTrigger>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <EditContactForm contactId={contactId} closeModal={closeModal} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactModal;
