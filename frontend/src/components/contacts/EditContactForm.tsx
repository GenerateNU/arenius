"use client";

import { useEffect, useState } from "react";
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
import apiClient from "@/services/apiClient";
import LoadingSpinner from "../ui/loading-spinner";

// Schema for form validation using Zod
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const EditContactForm = ({ contactId, closeModal }: { contactId: string, closeModal: () => void }) => {
    const form = useForm<ContactFormData>({
      resolver: zodResolver(contactSchema),
      defaultValues: {
        name: "",
        phone: "",
        city: "",
        state: "",
      },
    });
  
    const { reset } = form;
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
  
    // Fetch contact details when component mounts
    useEffect(() => {
      const fetchContact = async () => {
        try {
          const response = await apiClient.get(`/contact/${contactId}`);
          const contact = response.data.contact;
  
          // Once the data is fetched, reset the form with the contact data
          reset({
            name: contact.name,
            phone: contact.phone,
            city: contact.city || "",
            state: contact.state || "",
          });
        } catch (error) {
          console.error("Error fetching contact details", error);
        }
      };
  
      fetchContact();
    }, [contactId, reset, form]);
  
    const onSubmit = async (data: ContactFormData) => {
      try {
        setIsSaving(true);
        console.log("Submitting contact data:", data);
        const response = await apiClient.patch(`/contact/${contactId}`, data);
        console.log("Contact updated successfully:", response.data);
        
        // Close the modal after successful update
        closeModal();
        
        setSuccessMessage("Contact updated successfully!");
      } catch (error) {
        console.error("Error updating contact", error);
      } finally {
        setIsSaving(false);
      }
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
                <FormLabel>Client Name</FormLabel>
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
