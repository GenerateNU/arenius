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
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


// const formSchema = z.object({
//   transactionType: z.enum(["transaction", "offset"], {
//     required_error: "Transaction type is required",
//   }),
//   description: z.string().min(2, { message: "Description is required (min 2 characters)" }).max(50),
//   amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0" }),
//   currency_code: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]),
//   date: z.string().min(1, { message: "Date is required" }),
//   contact_id: z.string().min(1, { message: "Contact is required" }),
//   emissions_category: z.string().optional(),
//   scope: z.coerce.number().optional(),
//   carbon_amount: z.coerce.number().optional().refine(
//     (val) => !val || val > 0,
//     { message: "Carbon amount must be greater than 0" }
//   ),
// });

// export default function TransactionForm() {
//   const { companyId } = useAuth();
//   const { data: contactResponse } = useContacts();
//   const { fetchTableData } = useTransactionsContext();
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       transactionType: "transaction",
//       description: "",
//       amount: 0,
//       currency_code: "USD",
//       date: "",
//       contact_id: "",
//       emissions_category: "",
//       scope: undefined,
//       carbon_amount: undefined,
//     },
//   });

//   const transactionType = form.watch("transactionType");
//   const [tab, setTab] = useState("general");
//   const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor | undefined>(undefined);

//   console.log("Emissions Factor:", emissionsFactor);
//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     // Final validation check before submitting
//     const requiredFields: Array<"description" | "amount" | "date" | "contact_id" | "carbon_amount"> = ["description", "amount", "date", "contact_id"];
    
//     // Add carbon_amount validation for offsets
//     if (values.transactionType === "offset") {
//       requiredFields.push("carbon_amount");
//     }
    
//     const isValid = await form.trigger(requiredFields);
    
//     if (!isValid) {
//       // If there are validation errors in required fields, switch to the appropriate tab
//       if (form.formState.errors.carbon_amount) {
//         setTab("emissions");
//       } else {
//         setTab("general");
//       }
//       return;
//     }
    
//     if (companyId) {
//       console.log("Submitting form with values:", values);
//       await createLineItem(
//         {
//           description: values.description,
//           total_amount: values.amount,
//           currency_code: values.currency_code,
//           contact_id: values.contact_id,
//           emission_factor_id: values.transactionType === "transaction" ? (emissionsFactor?.activity_id || "") : "",
//           scope: values.transactionType === "transaction" ? (values.scope || undefined) : undefined,
//           date: new Date(values.date),
//           transaction_type: values.transactionType,
//           co2: values.transactionType === "offset" ? values.carbon_amount : undefined,
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
//     // Validate required fields in the first tab before proceeding
//     const descriptionValid = form.trigger("description");
//     const amountValid = form.trigger("amount");
//     const dateValid = form.trigger("date");
//     const contactValid = form.trigger("contact_id");
    
//     Promise.all([descriptionValid, amountValid, dateValid, contactValid]).then(
//       (results) => {
//         const allValid = results.every(Boolean);
//         if (allValid) {
//           setTab("emissions");
//         }
//       }
//     );
//   };

//   const handleBackClick = () => {
//     setTab("general");
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
//         <div className="mb-4">
//           <h2 className="text-2xl font-bold">Add a new transaction</h2>
//           <p className="text-gray-500">Manually enter transaction details below</p>
//         </div>

//         <FormField
//           control={form.control}
//           name="transactionType"
//           render={({ field }) => (
//             <FormItem className="space-y-3">
//               <FormControl>
//                 <RadioGroup
//                   onValueChange={(value) => {
//                     field.onChange(value);
//                     // Reset emissions related fields when changing transaction type
//                     if (value === "offset") {
//                       form.setValue("scope", undefined);
//                       form.setValue("emissions_category", "");
//                       setEmissionsFactor(undefined);
//                     } else {
//                       form.setValue("carbon_amount", undefined);
//                     }
//                   }}
//                   defaultValue={field.value}
//                   className="flex flex-row space-x-4"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="transaction" id="transaction" />
//                     <label htmlFor="transaction" className="text-sm font-medium">
//                       Standard Transaction
//                     </label>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="offset" id="offset" />
//                     <label htmlFor="offset" className="text-sm font-medium">
//                       Carbon Offset
//                     </label>
//                   </div>
//                 </RadioGroup>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
        
//         <Tabs value={tab} onValueChange={setTab} className="w-full">
//           <TabsList className="flex border-b">
//             <TabsTrigger value="general" className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-500">General</TabsTrigger>
//             <TabsTrigger value="emissions" className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:text-green-500">Emissions</TabsTrigger>
//           </TabsList>

//           {/* General Tab */}
//           <TabsContent value="general" className="space-y-6 pt-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
//                     <FormControl>
//                       <Input placeholder="e.g. January electricity" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="amount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Amount <span className="text-red-500">*</span></FormLabel>
//                     <FormControl>
//                       <Input 
//                         type="number" 
//                         placeholder="$400" 
//                         {...field} 
//                         onChange={(e) => {
//                           field.onChange(e.target.valueAsNumber || 0);
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
//                     <FormControl>
//                       <Input type="date" placeholder="4/13/25" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
            
//             <FormField
//               control={form.control}
//               name="contact_id"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Contact <span className="text-red-500">*</span></FormLabel>
//                   <FormControl>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <SelectTrigger className="w-full">
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
            
//             <div className="flex justify-end">
//               <Button 
//                 className="bg-green-700 hover:bg-green-800 text-white" 
//                 type="button" 
//                 onClick={handleNextClick}
//               >
//                 Next
//               </Button>
//             </div>
//           </TabsContent>

//           {/* Emissions Tab */}
//           <TabsContent value="emissions" className="space-y-6 pt-4">
//             {transactionType === "transaction" ? (
//               <>
//                 {/* Scope Selection for Standard Transactions */}
//                 <FormField
//                   control={form.control}
//                   name="scope"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Scope</FormLabel>
//                       <FormControl>
//                         <Select
//                           onValueChange={(value) => field.onChange(parseInt(value))}
//                           value={field.value ? field.value.toString() : ""}
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select a scope" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="1">Scope 1</SelectItem>
//                             <SelectItem value="2">Scope 2</SelectItem>
//                             <SelectItem value="3">Scope 3</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Category Selector for Standard Transactions */}
//                 <FormField
//                   control={form.control}
//                   name="emissions_category"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Emissions Factor</FormLabel>
//                       <FormControl>
//                         <div className="space-y-2">
//                           <EmissionsFactorSelector
//                             emissionsFactor={emissionsFactor}
//                             setEmissionsFactor={(value) => {
//                               setEmissionsFactor(value as EmissionsFactor | undefined);
//                               field.onChange(value?.id || "");
//                             }}
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </>
//             ) : (
//               /* Carbon Amount for Carbon Offsets */
//               <FormField
//                 control={form.control}
//                 name="carbon_amount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>CO2 Amount (kg) <span className="text-red-500">*</span></FormLabel>
//                     <FormControl>
//                       <Input 
//                         type="number" 
//                         placeholder="1000" 
//                         {...field} 
//                         onChange={(e) => {
//                           field.onChange(e.target.valueAsNumber || undefined);
//                         }}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <div className="flex justify-between mt-8">
//               <Button 
//                 className="bg-gray-500 hover:bg-gray-600 text-white" 
//                 type="button" 
//                 onClick={handleBackClick}
//               >
//                 Back
//               </Button>
//               <DialogClose asChild>
//                 <Button className="bg-green-700 hover:bg-green-800 text-white" type="submit">
//                   Post Transaction
//                 </Button>
//               </DialogClose>
//             </div>
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
  carbon_amount: z.coerce.number().optional().refine(
    (val) => val === undefined || val === null || val > 0,
    { message: "Carbon amount must be greater than 0" }
  ),
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
      carbon_amount: 0, // Changed from undefined to 0
    },
  });

  const transactionType = form.watch("transactionType");
  const [tab, setTab] = useState("general");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor | undefined>(undefined);

  console.log("Emissions Factor:", emissionsFactor);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    const requiredFields: Array<"description" | "amount" | "date" | "contact_id" | "carbon_amount"> = ["description", "amount", "date", "contact_id"];
    
    // Add carbon_amount validation for offsets
    if (values.transactionType === "offset") {
      requiredFields.push("carbon_amount");
    }
    const isValid = await form.trigger(requiredFields);
    
    if (!isValid) {
      // If there are validation errors in required fields, switch to the appropriate tab
      if (form.formState.errors.carbon_amount) {
        setTab("emissions");
      } else {
        setTab("general");
      }
      return;
    }
    
    if (companyId) {
      console.log("Submitting form with values:", values);
      await createLineItem(
        {
          description: values.description,
          total_amount: values.amount,
          currency_code: values.currency_code,
          contact_id: values.contact_id,
          emission_factor_id: values.transactionType === "transaction" ? (emissionsFactor?.activity_id || "") : "",
          scope: values.transactionType === "transaction" ? (values.scope || undefined) : 0,
          date: new Date(values.date),
          transaction_type: values.transactionType,
          co2: values.transactionType === "offset" ? values.carbon_amount : undefined,
          co2_unit: values.transactionType === "offset" ? "kg" : undefined,
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

  const handleBackClick = () => {
    setTab("general");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Add a new transaction</h2>
          <p className="text-gray-500">Manually enter transaction details below</p>
        </div>

        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset emissions related fields when changing transaction type
                    if (value === "offset") {
                      form.setValue("scope", undefined);
                      form.setValue("emissions_category", "");
                      setEmissionsFactor(undefined);
                    } else {
                      form.setValue("carbon_amount", 0);
                    }
                  }}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem style={{ borderColor: '#225244', color: '#225244' }} value="transaction" id="transaction" />
                    <label htmlFor="transaction" className="text-sm font-medium">
                      Standard Transaction
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem style={{ borderColor: '#225244', color: '#225244' }} value="offset" id="offset" />
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
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex border-b">
            <TabsTrigger value="general" className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:#59C295">General</TabsTrigger>
            <TabsTrigger value="emissions" className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:#59C295">Emissions</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 pt-4">
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
                className="g-[#225244] hover:bg-[#1a3f35] text-white" 
                type="button" 
                onClick={handleNextClick}
              >
                Next
              </Button>
            </div>
          </TabsContent>

          {/* Emissions Tab */}
          <TabsContent value="emissions" className="space-y-6 pt-4">
            {transactionType === "transaction" ? (
              <>
                {/* Scope Selection for Standard Transactions */}
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
                        >
                          <SelectTrigger>
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

                {/* Category Selector for Standard Transactions */}
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
              </>
            ) : (
              /* Carbon Amount for Carbon Offsets */
              <FormField
                control={form.control}
                name="carbon_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CO2 Amount (kg) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1000" 
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
            )}

            <div className="flex justify-between mt-8">
              <Button 
                className="bg-gray-500 hover:bg-gray-600 text-white" 
                type="button" 
                onClick={handleBackClick}
              >
                Back
              </Button>
              <DialogClose asChild>
                <Button className="g-[#225244] hover:bg-[#1a3f35] text-white" type="submit">
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