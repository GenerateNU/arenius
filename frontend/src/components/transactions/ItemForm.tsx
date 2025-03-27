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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "@/context/AuthContext";
import { useTransactionsContext } from "@/context/TableContext";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"];

const formSchema = z.object({
  description: z.string().min(2).max(50),
  price: z.coerce.number().min(0),
  currency_code: z.enum([...CURRENCIES] as [string, ...string[]]),
});

export default function ItemForm() {
  const { fetchTableData } = useTransactionsContext();
  const { companyId } = useAuth(); // Get companyId from AuthContext

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      price: 0,
      currency_code: "USD",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (companyId) {
      await createLineItem(
        {
          description: values.description,
          total_amount: values.price,
          currency_code: values.currency_code,
        },
        companyId
      );
      fetchTableData("unreconciled", {});
      form.reset();
    } else {
      console.error("Company ID is null");
    }
    fetchTableData("unreconciled", {});
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-4 flex flex-row items-end space-x-8"
      >
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
              <FormControl className="w-[100px]">
                <Input type="number" placeholder="100" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency code</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
