// "use client";

// import React from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { createLineItem } from "@/services/lineItems";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
//   Form,
// } from "../ui/form";

// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { useAuth } from "@/context/AuthContext";
// import { useTransactionsContext } from "@/context/TransactionContext";
// import { useContacts } from "@/context/ContactContext";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../ui/select";
// import { DialogClose } from "../ui/dialog";

// const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"];

// const formSchema = z.object({
//   description: z.string().min(2).max(50),
//   price: z.coerce.number().min(0),
//   currency_code: z.enum([...CURRENCIES] as [string, ...string[]]),
//   contact_id: z.string(),
// });

// export default function ItemForm() {
//   const { fetchTableData } = useTransactionsContext();
//   const { companyId } = useAuth();
//   const { data: contactResponse } = useContacts();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       description: "",
//       price: 0,
//       currency_code: "USD",
//       contact_id: "",
//     },
//   });

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     if (companyId) {
//       await createLineItem(
//         {
//           description: values.description,
//           total_amount: values.price,
//           currency_code: values.currency_code,
//           contact_id: values.contact_id,
//         },
//         companyId
//       );
//       fetchTableData("unreconciled", {});
//       form.reset();
//     } else {
//       console.error("Company ID is null");
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description</FormLabel>
//               <FormMessage />
//               <FormControl>
//                 <Input placeholder="January electricity" {...field} />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Price</FormLabel>
//               <FormMessage />
//               <FormControl className="">
//                 <Input type="number" placeholder="100" {...field} />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="contact_id"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Contact</FormLabel>
//               <FormControl>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={field.value}
//                 >
//                   <SelectTrigger className="">
//                     <SelectValue placeholder="Select contact" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {contactResponse.contacts.map((contact) => (
//                       <SelectItem key={contact.id} value={contact.id}>
//                         {contact.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <DialogClose asChild>
//           <Button className="mt-4" type="submit">
//             Submit
//           </Button>
//         </DialogClose>
//       </form>
//     </Form>
//   );
// }

"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useContacts } from "@/context/ContactContext";
import { createLineItem } from "@/services/lineItems";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { DialogClose } from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTransactionsContext } from "@/context/TransactionContext";


const formSchema = z.object({
  description: z.string().min(2).max(50),
  amount: z.coerce.number().min(0),
  currency_code: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]),
  date: z.string(),
  contact_id: z.string().default(""),
  emissions_category: z.string().optional(),
  scope: z.string().optional(),
});

export default function TransactionForm() {
  const { companyId } = useAuth();
  const { data: contactResponse } = useContacts();
  const { fetchTableData } = useTransactionsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      currency_code: "USD",
      date: "",
      contact_id: "",
      emissions_category: "",
      scope: "",
    },
  });

  const [tab, setTab] = useState("general");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (companyId) {
      await createLineItem(
        {
          description: values.description,
          total_amount: values.amount,
          currency_code: values.currency_code,
          contact_id: values.contact_id || "",
          emission_factor_id: values.emissions_category || "",
          scope: values.scope || "",
          date: new Date(values.date),
        },
        companyId
      );
      fetchTableData("unreconciled", {});
      form.reset();
    } else {
      console.error("Company ID is null");
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex border-b">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="emissions">Emissions</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. January electricity" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="$400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Search or select contact" />
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
              <Button className="w-full" type="submit">
                Next
              </Button>
            </DialogClose>
          </TabsContent>

          {/* Emissions Tab */}
          <TabsContent value="emissions" className="space-y-4">
            {/* Scope Selection */}
            <div className="grid grid-cols-3 gap-2">
              {["Scope 1", "Scope 2", "Scope 3"].map((scope) => (
                <Button
                  key={scope}
                  variant={form.watch("scope") === scope ? "default" : "outline"}
                  onClick={() => form.setValue("scope", scope)}
                  type="button"
                >
                  {scope}
                </Button>
              ))}
            </div>

            {/* Category Selector */}
            {/* <FormField
              control={form.control}
              name="emissions_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emissions Category</FormLabel>
                  <FormControl>
                    {/* Pass the onChange function from the form to CategorySelector */}
                    {/* <CategorySelector
                      emissionsFactor={emissionsFactor}
                      setEmissionsFactor={setEmissionsFactor}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <DialogClose asChild>
              <Button className="w-full" type="submit">
                Post Transaction
              </Button>
            </DialogClose>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
