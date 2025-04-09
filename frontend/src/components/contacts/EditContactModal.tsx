import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import EditContactForm from "./EditContactForm";
import { DialogTitle } from "@radix-ui/react-dialog";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { Contact } from "@/types";

export type EditContactModalProps = {
  contact: Contact;
  setContact: (contact: Contact) => void;
};

const EditContactModal = ({ contact, setContact }: EditContactModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "default" }))}>
        Edit Contact
      </DialogTrigger>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <EditContactForm
            contact={contact}
            setContact={setContact}
            closeModal={closeModal}
          />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactModal;
