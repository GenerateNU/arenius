"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import LoadingSpinner from "../ui/loading-spinner";
import { Contact } from "@/types";
import { updateContact } from "@/services/contacts";

// Schema for form validation using Zod
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  clientOverview: z.string().optional(),
  notes: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export type EditContactFormProps = {
  contact: Contact;
  setContact: (contact: Contact) => void;
  closeModal: () => void;
};

const EditContactForm = ({
  contact,
  setContact,
  closeModal,
}: EditContactFormProps) => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact.name,
      phone: contact.phone,
      city: contact.city,
      state: contact.state,
      clientOverview: contact.client_overview,
      notes: contact.notes,
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: ContactFormData) => {
    setIsSaving(true);
    const response = await updateContact(contact.id, data);

    setSuccessMessage("Contact updated successfully!");
    setContact(response);

    closeModal();
    setIsSaving(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mt-4 flex flex-col"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Los Angeles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clientOverview"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Overview</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size={10} className="mr-2" color="#FFFFFF" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {successMessage && (
          <div className="mt-4 text-green-500 text-center">
            {successMessage}
          </div>
        )}
      </form>
    </Form>
  );
};

export default EditContactForm;
