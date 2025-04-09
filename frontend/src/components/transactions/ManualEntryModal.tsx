import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import ItemForm from "./ItemForm";

const ManualEntryModal = () => {
  return (
    <Dialog>
      <DialogTrigger className="bg-moss text-primary-foreground shadow font-semibold hover:bg-primary/90 h-10 rounded-md px-8 flex space-x-2 items-center text-sm">
        <Image
          src="/plus_1.svg"
          alt=""
          width={13}
          height={13}
          className="mr-1"
        />
        <span>Add Manual Upload</span>
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
