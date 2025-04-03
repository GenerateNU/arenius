// "use client";

// import React, { useState } from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
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
// import { useContacts } from "@/context/ContactContext";
// import { createLineItem } from "@/services/lineItems";

// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../ui/select";
// import { DialogClose } from "../ui/dialog";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { useTransactionsContext } from "@/context/TransactionContext";
// import EmissionsFactorSelector from "./CategorySelector";
// import { EmissionsFactor } from "@/types";


// const formSchema = z.object({
//   description: z.string().min(2).max(50),
//   amount: z.coerce.number().min(0),
//   currency_code: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]),
//   date: z.string(),
//   contact_id: z.string().default(""),
//   emissions_category: z.string().optional(),
//   scope: z.string().optional(),
// });

// export default function TransactionForm() {
//   const { companyId } = useAuth();
//   const { data: contactResponse } = useContacts();
//   const { fetchTableData } = useTransactionsContext();
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       description: "",
//       amount: 0,
//       currency_code: "USD",
//       date: "",
//       contact_id: "",
//       emissions_category: "",
//       scope: "",
//     },
//   });

//   const [tab, setTab] = useState("general");
//   const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor | undefined>(undefined);

//   console.log("Emissions Factor:", emissionsFactor);
//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     if (companyId) {
//       await createLineItem(
//         {
//           description: values.description,
//           total_amount: values.amount,
//           currency_code: values.currency_code,
//           contact_id: values.contact_id || "",
//           emission_factor_id: values.emissions_category || "",
//           scope: values.scope || "",
//           date: new Date(values.date),
//         },
//         companyId
//       );
//       fetchTableData("unreconciled", {});
//       form.reset();
//     } else {
//       console.error("Company ID is null");
//       form.reset();
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
//         <Tabs value={tab} onValueChange={setTab} className="w-full">
//           <TabsList className="flex border-b">
//             <TabsTrigger value="general">General</TabsTrigger>
//             <TabsTrigger value="emissions">Emissions</TabsTrigger>
//           </TabsList>

//           {/* General Tab */}
//           <TabsContent value="general" className="space-y-4">
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Input placeholder="e.g. January electricity" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Amount</FormLabel>
//                   <FormControl>
//                     <Input type="number" placeholder="$400" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="date"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Date</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="contact_id"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Contact</FormLabel>
//                   <FormControl>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Search or select contact" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {contactResponse.contacts.map((contact) => (
//                           <SelectItem key={contact.id} value={contact.id}>
//                             {contact.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <DialogClose asChild>
//               <Button className="w-full" type="submit">
//                 Next
//               </Button>
//             </DialogClose>
//           </TabsContent>

//           {/* Emissions Tab */}
//           <TabsContent value="emissions" className="space-y-4">
//             {/* Scope Selection */}
//             <div className="grid grid-cols-3 gap-2">
//               {["Scope 1", "Scope 2", "Scope 3"].map((scope) => (
//                 <Button
//                   key={scope}
//                   variant={form.watch("scope") === scope ? "default" : "outline"}
//                   onClick={() => form.setValue("scope", scope)}
//                   type="button"
//                 >
//                   {scope}
//                 </Button>
//               ))}
//             </div>

//             {/* Category Selector */}
//             <FormField
//               control={form.control}
//               name="emissions_category"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Emissions Factor</FormLabel>
//                   <FormControl>
//                     <div className="space-y-2">
//                       <EmissionsFactorSelector
//                         emissionsFactor={field.value as EmissionsFactor | undefined}
//                         setEmissionsFactor={(value) => {
//                           setEmissionsFactor(value as EmissionsFactor | undefined);
//                           setEmissionsFactor(value);
//                         }}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogClose asChild>
//               <Button className="w-full" type="submit">
//                 Post Transaction
//               </Button>
//             </DialogClose>
//           </TabsContent>
//         </Tabs>
//       </form>
//     </Form>
//   );
// }



// "use client";

// import React, { useState } from "react";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
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
// import { useContacts } from "@/context/ContactContext";
// import { createLineItem } from "@/services/lineItems";

// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../ui/select";
// import { DialogClose } from "../ui/dialog";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { useTransactionsContext } from "@/context/TransactionContext";
// import EmissionsFactorSelector from "./CategorySelector";
// import { EmissionsFactor } from "@/types";


// const formSchema = z.object({
//   description: z.string().min(2).max(50),
//   amount: z.coerce.number().min(0),
//   currency_code: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]),
//   date: z.string(),
//   contact_id: z.string().default(""),
//   emissions_category: z.string().optional(),
//   scope: z.string().optional(),
// });

// export default function TransactionForm() {
//   const { companyId } = useAuth();
//   const { data: contactResponse } = useContacts();
//   const { fetchTableData } = useTransactionsContext();
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       description: "",
//       amount: 0,
//       currency_code: "USD",
//       date: "",
//       contact_id: "",
//       emissions_category: "",
//       scope: "",
//     },
//   });

//   const [tab, setTab] = useState("general");
//   const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor | undefined>(undefined);

//   console.log("Emissions Factor:", emissionsFactor);
//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     if (companyId) {
//       await createLineItem(
//         {
//           description: values.description,
//           total_amount: values.amount,
//           currency_code: values.currency_code,
//           contact_id: values.contact_id || "",
//           emission_factor_id: values.emissions_category || "",
//           scope: values.scope || "",
//           date: new Date(values.date),
//         },
//         companyId
//       );
//       fetchTableData("unreconciled", {});
//       form.reset();
//     } else {
//       console.error("Company ID is null");
//       form.reset();
//     }
//   }

//   const handleNextClick = () => {
//     setTab("emissions");
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
//         <Tabs value={tab} onValueChange={setTab} className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="general" className={tab === "general" ? "bg-primary text-primary-foreground" : ""}>General</TabsTrigger>
//             <TabsTrigger value="emissions" className={tab === "emissions" ? "bg-primary text-primary-foreground" : ""}>Emissions</TabsTrigger>
//           </TabsList>

//           {/* General Tab */}
//           <TabsContent value="general" className="space-y-4">
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Input placeholder="e.g. January electricity" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Amount</FormLabel>
//                   <FormControl>
//                     <Input type="number" placeholder="$400" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="date"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Date</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="contact_id"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Contact</FormLabel>
//                   <FormControl>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Search or select contact" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {contactResponse.contacts.map((contact) => (
//                           <SelectItem key={contact.id} value={contact.id}>
//                             {contact.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button className="w-full" type="button" onClick={handleNextClick}>
//               Next
//             </Button>
//           </TabsContent>

//           {/* Emissions Tab */}
//           <TabsContent value="emissions" className="space-y-4">
//             {/* Scope Selection */}
//             <FormField
//               control={form.control}
//               name="scope"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Scope</FormLabel>
//                   <FormControl>
//                     <Select
//                       onValueChange={field.onChange}
//                       value={field.value}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select a scope" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Scope 1">Scope 1</SelectItem>
//                         <SelectItem value="Scope 2">Scope 2</SelectItem>
//                         <SelectItem value="Scope 3">Scope 3</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Category Selector */}
//             <FormField
//               control={form.control}
//               name="emissions_category"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Emissions Factor</FormLabel>
//                   <FormControl>
//                     <div className="space-y-2">
//                       <EmissionsFactorSelector
//                         emissionsFactor={emissionsFactor}
//                         setEmissionsFactor={(value) => {
//                           setEmissionsFactor(value as EmissionsFactor | undefined);
//                           field.onChange(value?.id || "");
//                         }}
//                       />
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogClose asChild>
//               <Button className="w-full" type="submit">
//                 Post Transaction
//               </Button>
//             </DialogClose>
//           </TabsContent>
//         </Tabs>
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
import EmissionsFactorSelector from "./CategorySelector";
import { EmissionsFactor } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const formSchema = z.object({
  transactionType: z.enum(["transaction", "offset"], {
    required_error: "Transaction type is required",
  }),
  description: z.string().min(2, { message: "Description is required (min 2 characters)" }).max(50),
  amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0" }),
  currency_code: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]),
  date: z.string().min(1, { message: "Date is required" }),
  contact_id: z.string().min(1, { message: "Contact is required" }),
  emissions_category: z.string().optional(),
  scope: z.coerce.number().optional(),
});

export default function TransactionForm() {
  const { companyId } = useAuth();
  const { data: contactResponse } = useContacts();
  const { fetchTableData } = useTransactionsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: "transaction",
      description: "",
      amount: 0,
      currency_code: "USD",
      date: "",
      contact_id: "",
      emissions_category: "",
      scope: undefined,
    },
  });

  const transactionType = form.watch("transactionType");
  const [tab, setTab] = useState("general");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor | undefined>(undefined);

  console.log("Emissions Factor:", emissionsFactor);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Final validation check before submitting - only checking required fields
    const isValid = await form.trigger(["description", "amount", "date", "contact_id"]);
    
    if (!isValid) {
      // If there are validation errors in required fields, switch to the general tab
      setTab("general");
      return;
    }
    
    if (companyId) {
      console.log("Submitting form with values:", values);
      console.log("emissions factor", values.emissions_category)
      await createLineItem(
        {
          description: values.description,
          total_amount: values.amount,
          currency_code: values.currency_code,
          contact_id: values.contact_id,
          emission_factor_id: emissionsFactor?.activity_id || "",
          scope: values.scope || undefined,
          date: new Date(values.date),
          transaction_type: values.transactionType,
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

  const handleNextClick = () => {
    // Validate required fields in the first tab before proceeding
    const descriptionValid = form.trigger("description");
    const amountValid = form.trigger("amount");
    const dateValid = form.trigger("date");
    const contactValid = form.trigger("contact_id");
    
    Promise.all([descriptionValid, amountValid, dateValid, contactValid]).then(
      (results) => {
        const allValid = results.every(Boolean);
        if (allValid) {
          setTab("emissions");
        }
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Add a new transaction</h2>
          <p className="text-gray-500">Manually enter transaction details below</p>
        </div>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex border-b">
            <TabsTrigger value="general" className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-500">General</TabsTrigger>
            <TabsTrigger value="emissions" className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-500">Emissions</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transaction" id="transaction" />
                        <label htmlFor="transaction" className="text-sm font-medium">
                          Standard Transaction
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offset" id="offset" />
                        <label htmlFor="offset" className="text-sm font-medium">
                          Carbon Offset
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>Amount <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="$400" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" placeholder="4/13/25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
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
            
            <div className="flex justify-end">
              <Button 
                className="bg-green-700 hover:bg-green-800 text-white" 
                type="button" 
                onClick={handleNextClick}
              >
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Emissions Tab */}
          <TabsContent value="emissions" className="space-y-6 pt-4">
            {/* Scope Selection */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                      disabled={transactionType === "offset"}
                    >
                      <SelectTrigger className={transactionType === "offset" ? "bg-gray-100" : ""}>
                        <SelectValue placeholder="Select a scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Scope 1</SelectItem>
                        <SelectItem value="2">Scope 2</SelectItem>
                        <SelectItem value="3">Scope 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selector */}
            <FormField
              control={form.control}
              name="emissions_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emissions Factor</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <EmissionsFactorSelector
                        emissionsFactor={emissionsFactor}
                        setEmissionsFactor={(value) => {
                          setEmissionsFactor(value as EmissionsFactor | undefined);
                          field.onChange(value?.id || "");
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <DialogClose asChild>
                <Button className="bg-green-700 hover:bg-green-800 text-white" type="submit">
                  Post Transaction
                </Button>
              </DialogClose>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}