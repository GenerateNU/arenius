"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "@/services/apiClient";
import { useForm } from "react-hook-form";
import logo from "@/assets/onboarding-logo.png";

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
      await apiClient.post('/auth/forgot-password', { email: values.email });
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setMessage("Failed to send reset email. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className="p-8">
      <div className={styles.formContainer}>
        <div className="flex flex-col justify-start items-center mb-8">
          <h2 className="text-2xl mb-4">Welcome to</h2>
          <Image src={logo} alt="Onboarding Logo" className={styles.logo} />
        </div>
      
        <div className="w-full flex flex-col items-center space-y-4">
            <h2 className="text-2xl mb-4">Forgot Password</h2>
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
                <Button className="mt-4" type="submit" size="long">
                  Send Reset Link
                </Button>
                {message && <div className={styles.message}>{message}</div>}
              </form>
            </Form>
              <Link href="/" className={styles.link}>Return to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  formContainer:
    "h-[90vh] w-[45vw] flex flex-col items-center justify-center bg-white/100 p-8 rounded-lg shadow-lg",
  form: "w-3/4",
  message: "mt-4 text-center text-green-500",
  returnToLoginContainer: "mt-4 text-center",
  link: "text-blue-500 hover:underline",
  logo: "w-100 pb-20",
  container:
    "h-screen w-full bg-[url('/onboarding-bg.jpeg')] bg-cover bg-center flex",
};
