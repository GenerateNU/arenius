"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@supabase/supabase-js";
import logo from "@/assets/onboarding-logo.png";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add error handling to prevent build failures
if (!supabaseUrl) {
  // During static build, provide a fallback for prerendering
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    console.warn('Supabase URL not found during build. Using placeholder for static generation.');
  } else {
    console.error('Supabase URL is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder-for-static-build.supabase.co',
  supabaseAnonKey || 'placeholder-key-for-static-build'
);

const formSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset successful! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
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
            <h2 className="text-2xl mb-4">Reset Password</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormMessage />
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button className="mt-4" type="submit" size="long">
                  Reset Password
                </Button>

                {message && <div className={styles.message}>{message}</div>}
              </form>
            </Form>

            <Link href="/" className={styles.link}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  formContainer: "h-[90vh] w-[45vw] flex flex-col items-center justify-center bg-white/100 p-8 rounded-lg shadow-lg",
  form: "w-3/4",
  message: "mt-4 text-center text-green-500",
  returnToLoginContainer: "mt-4 text-center",
  link: "text-blue-500 hover:underline",
  logo: "w-100 pb-20",
  container: "h-screen w-full bg-[url('/assets/onboarding-bg.jpeg')] bg-cover bg-center flex",
};
