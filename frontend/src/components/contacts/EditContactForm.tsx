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

const EditContactForm = ({ contactId }: { contactId: string }) => {
  const [contactData, setContactData] = useState<ContactFormData | null>(null);
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
  const [isSaving, setIsSaving] = useState(false)

  // Fetch contact details when component mounts
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await apiClient.get(`/contact/${contactId}`);
        const contact = response.data.contact;

        // Debug: Log fetched contact data
        console.log("Fetched contact data:", contact);

        // Set the fetched data to the state
        setContactData(contact);

        // Once the data is fetched, reset the form with the contact data
        reset({
          name: contact.name,
          phone: contact.phone,
          city: contact.city || "",
          state: contact.state || "",
        });

        // Debug: Log form values after resetting
        console.log("Form values after resetting:", {
          name: form.getValues("name"),
          phone: form.getValues("phone"),
          city: form.getValues("city"),
          state: form.getValues("state"),
        });
      } catch (error) {
        console.error("Error fetching contact details", error);
      }
      
    };

    fetchContact();
  }, [contactId, reset, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log("Submitting contact data:", data); // Debug: Log the form data on submit
      const response = await apiClient.patch(`/contact/${contactId}`, data);
      console.log("Contact updated successfully:", response.data);
      setIsSaving(true)        
    } catch (error) {
      console.error("Error updating contact", error);
    }
    finally {
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

        {/* Buttons placed after form fields */}
        <div className="mt-4 flex justify-between">
          <span className="text-red-500 cursor-pointer">Delete</span>
          <Button 
                onClick={() => setIsSaving(true)}
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size={10} className="mr-2" color="#FFFFFF"  />
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
