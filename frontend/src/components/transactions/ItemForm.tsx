"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createLineItem } from "@/services/lineItems";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "../ui/form";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "@/context/AuthContext";
import { useTransactionsContext } from "@/context/TransactionContext";
import { useContacts } from "@/context/ContactContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { DialogClose } from "../ui/dialog";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"];

const formSchema = z.object({
  description: z.string().min(2).max(50),
  price: z.coerce.number().min(0),
  currency_code: z.enum([...CURRENCIES] as [string, ...string[]]),
  contact_id: z.string(),
});

export default function ItemForm() {
  const { fetchTableData } = useTransactionsContext();
  const { companyId } = useAuth();
  const { data: contactResponse } = useContacts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      price: 0,
      currency_code: "USD",
      contact_id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (companyId) {
      await createLineItem(
        {
          description: values.description,
          total_amount: values.price,
          currency_code: values.currency_code,
          contact_id: values.contact_id,
        },
        companyId
      );
      fetchTableData("unreconciled", {});
      form.reset();
    } else {
      console.error("Company ID is null");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="January electricity" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormMessage />
              <FormControl className="">
                <Input type="number" placeholder="100" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactResponse.contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogClose asChild>
          <Button className="mt-4" type="submit">
            Submit
          </Button>
        </DialogClose>
      </form>
    </Form>
  );
}
