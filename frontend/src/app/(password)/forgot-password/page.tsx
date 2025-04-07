"use client";
import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import apiClient from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await apiClient.post("/auth/forgot-password", { email: values.email });
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setMessage("Failed to send reset email. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Forgot Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size="long">
            Send Reset Link
          </Button>
          {message && <div className={styles.message}>{message}</div>}
        </form>
      </Form>
      <Link href="/" className={styles.link}>
        Return to Login
      </Link>
    </div>
  );
}

const styles = {
  container: "flex flex-col space-y-4",
  header: "text-2xl font-header",
  form: "w-full space-y-6",
  message: "mt-4 text-center text-green-500",
  link: "text-darkEvergreen hover:underline",
};
