"use client";

import { useAuth } from "@/context/AuthContext";
import { createContact } from "@/services/contacts";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().min(2).max(50),
  phone: z.string().min(2).max(50),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  client_overview: z.string(),
  notes: z.string().optional(),
});

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
      <div className="flex items-center space-x-1 text-base">
        <Link href="/contacts" className="text-green-600 hover:underline">
          Contacts
        </Link>
        <span className="text-gray-600">/ Add Contact</span>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-4 flex flex-col space-y-4"
      >
        <div className="flex flex-row space-x-8">
          <div className="flex flex-col space-y-4 w-1/2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-black-600">Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="johnsmith@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-full">
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
                <FormItem className="w-full">
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
                <FormItem className="w-full">
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Massachusetts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col space-y-4 w-1/2">
            <FormField
              control={form.control}
              name="client_overview"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Client Overview</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="w-full flex justify-end items-center mt-6">
          <Button type="submit" className="w-[150px]">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>

  );
}