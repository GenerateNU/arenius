"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createContact } from "@/services/contacts";
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
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().min(2).max(50),
  phone: z.string().min(2).max(50),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  scope: z.string().min(2).max(50),
  client_overview: z.string(),
  notes: z.string().optional(),
});

const SCOPES = ["Scope 1", "Scope 2", "Scope 3"];

export default function ContactForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      scope: "Scope 1",
      client_overview: "",
      notes: "",
    },
  });

  const { companyId } = useAuth();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!companyId) {
      console.error("Company ID is null");
      return;
    }

    try {
      const response = await createContact({
        ...values,
        company_id: "",
      }, companyId);
  
      if (response) {
        form.reset();
        router.push("/contacts");
      }
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-4 flex flex-col space-y-4"
      >
        <div className="flex items-center space-x-12">
          <div className="relative">
            <Image
              src="/profile.png"
              alt="Profile"
              width={180}
              height={180}
              className="rounded-full border border-gray-300 shadow-md"
            />
            <button title="Edit Profile" className="w-10 h-10 absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-300 flex items-center justify-center">
              <Image
                src="/edit.svg"
                alt="Edit"
                width={20}
                height={20}
              />
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-[400px]">
                  <FormLabel className="text-green-600">Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-green-600">Scope</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Scope 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCOPES.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>Email</FormLabel>
              <FormMessage />
              <FormControl>
                <Input placeholder="johnsmith@gmail.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="123-456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Boston" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="w-1/4">
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="Massachusetts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="client_overview"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>Client Overview</FormLabel>
              <FormControl>
                <Textarea placeholder="Overview" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-1/2 flex justify-between items-center mt-4">
          <label className="text-sm font-medium text-muted-foreground">Last Updated: Now</label>
          <Button type="submit" className="w-[150px]">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}