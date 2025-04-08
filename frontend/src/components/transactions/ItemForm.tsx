"use client";

import React, { useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { Calendar as CalendarIcon } from "lucide-react"; // Icon, not component
import { Calendar } from "@/components/ui/calendar"; // The actual calendar component

import { format } from "date-fns";

const formSchema = z.object({
  transactionType: z.enum(["transaction", "offset"], {
    required_error: "Transaction type is required",
  }),
  description: z
    .string()
    .min(2, { message: "Description is required (min 2 characters)" })
    .max(50),
  amount: z.coerce
    .number()
    .min(0.01, { message: "Amount must be greater than 0" }),
  currency_code: z.enum(["USD", "EUR", "GBP", "JPY", "AUD"]),
  date: z.string().min(1, { message: "Date is required" }),
  contact_id: z.string().min(1, { message: "Contact is required" }),
  emissions_category: z.string().optional(),
  scope: z.coerce.number().optional(),
  carbon_amount: z.coerce
    .number()
    .optional()
    .refine(
      (val) => val === undefined || val === null || val > 0 || val === 0,
      { message: "Carbon amount must be greater than 0" }
    ),
});

export default function TransactionForm() {
  const { user } = useAuth();
  const { data: contactResponse } = useContacts();
  const { fetchTableData } = useTransactionsContext();
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: "transaction",
      description: "",
      amount: undefined,
      currency_code: "USD",
      date: undefined,
      contact_id: "",
      emissions_category: undefined,
      scope: undefined,
      carbon_amount: undefined,
    },
  });

  const transactionType = form.watch("transactionType");
  const [tab, setTab] = useState("general");
  const [emissionsFactor, setEmissionsFactor] = useState<
    EmissionsFactor | undefined
  >(undefined);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const fieldsToValidate = ["description", "amount", "date", "contact_id"];

    // Add carbon_amount validation for offsets
    if (values.transactionType === "offset") {
      fieldsToValidate.push("carbon_amount");
    }
    let isValid = true;
    for (const field of fieldsToValidate) {
      // Cast field to any to avoid type errors
      const fieldResult = await form.trigger(
        field as keyof z.infer<typeof formSchema>
      );
      if (!fieldResult) isValid = false;
    }

    if (!isValid) {
      // If there are validation errors in required fields, switch to the appropriate tab
      if (form.formState.errors.carbon_amount) {
        setTab("emissions");
      } else {
        setTab("general");
      }
      return;
    }

    if (user) {
      try {
        console.log("date", values.date);
        await createLineItem(
          {
            description: values.description,
            total_amount: values.amount,
            currency_code: values.currency_code,
            contact_id: values.contact_id,
            emission_factor_id:
              values.transactionType === "transaction"
                ? emissionsFactor?.activity_id || ""
                : "",
            scope:
              values.transactionType === "transaction"
                ? values.scope || undefined
                : 0,
            date: values.date,
            transaction_type: values.transactionType,
            co2:
              values.transactionType === "offset"
                ? values.carbon_amount
                : undefined,
            co2_unit: values.transactionType === "offset" ? "kg" : undefined,
          },
          user.company_id
        );

        // add 2 sec timeout to allow for carbon estimates to be made
        setTimeout(async () => {
          await fetchTableData("unreconciled", {});
          await fetchTableData("reconciled", {});
          await fetchTableData("offsets", {});
          if (dialogCloseRef.current) {
            dialogCloseRef.current.click();
          }

          setLoading(false);
        }, 1500);

        form.reset();
      } catch (error) {
        console.error("Error creating line item:", error);
        setLoading(false);
      }
    } else {
      console.error("Company ID is null");
      setLoading(false);
      form.reset();
    }
  }

  const handleNextClick = () => {
    // Validate required fields in the first tab before proceeding
    const generalFieldsToValidate: Array<keyof z.infer<typeof formSchema>> = [
      "description",
      "amount",
      "date",
      "contact_id",
    ];

    Promise.all(
      generalFieldsToValidate.map((field) => form.trigger(field))
    ).then((results) => {
      const allValid = results.every(Boolean);
      if (allValid) {
        setTab("emissions");
      }
    });
  };

  const handleBackClick = () => {
    setTab("general");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Add a new transaction</h2>
          <p className="text-gray-500">
            Manually enter transaction details below
          </p>
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
                      form.setValue("carbon_amount", undefined);
                    }
                  }}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      style={{ borderColor: "#225244", color: "#225244" }}
                      value="transaction"
                      id="transaction"
                    />
                    <label
                      htmlFor="transaction"
                      className="text-sm font-medium"
                    >
                      Standard Transaction
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      style={{ borderColor: "#225244", color: "#225244" }}
                      value="offset"
                      id="offset"
                    />
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
            <TabsTrigger
              value="general"
              className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:#59C295"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="emissions"
              className="pb-2 px-4 border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:#59C295"
            >
              Emissions
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. January electricity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Cost ($) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="$400"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const sanitizedValue = rawValue.replace(
                            /^0+(?=\d)/,
                            ""
                          ); // remove leading zeros
                          field.onChange(Number(sanitizedValue));
                        }}
                      />
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
                    <FormLabel>
                      Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "LLL dd, y")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-white border border-gray-200 shadow-md rounded-md"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                  <FormLabel>
                    Contact <span className="text-red-500">*</span>
                  </FormLabel>
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
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3].map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`text-center py-3 border rounded-md ${
                                field.value === value
                                  ? "border-[#225244] bg-[#f1f8f6] text-[#225244] font-medium"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                              onClick={() => field.onChange(value)}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
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
                              setEmissionsFactor(
                                value as EmissionsFactor | undefined
                              );
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
                    <FormLabel>
                      CO2 Amount (kg) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber || "");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between">
              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white"
                type="button"
                onClick={handleBackClick}
              >
                Back
              </Button>
              <Button
                className="bg-[#225244] hover:bg-[#1a3f35] text-white flex items-center"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 018 8h-4l3.5 3.5L20 12h-4a8 8 0 01-8 8v-4l-3.5 3.5L4 12z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Post Transaction"
                )}
              </Button>
            </div>
            <DialogClose ref={dialogCloseRef} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
