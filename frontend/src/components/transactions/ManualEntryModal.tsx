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
import { Button } from "../ui/button";

const ManualEntryModal = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button size="lg" className="font-semibold space-x-2">
          <Image
            src="/plus_1.svg"
            alt=""
            width={13}
            height={13}
            className="mr-1"
          />
          <span>Add Manual Upload</span>
        </Button>
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
