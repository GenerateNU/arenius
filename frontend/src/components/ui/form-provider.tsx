"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
});

interface FormProviderWrapperProps {
  children: React.ReactNode;
}

export default function FormProviderWrapper({ children }: FormProviderWrapperProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
