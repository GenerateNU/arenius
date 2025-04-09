"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@supabase/supabase-js";
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add error handling to prevent build failures
if (!supabaseUrl) {
  // During static build, provide a fallback for prerendering
  if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    console.warn(
      "Supabase URL not found during build. Using placeholder for static generation."
    );
  } else {
    console.error(
      "Supabase URL is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }
}

const supabase = createClient(
  supabaseUrl || "https://placeholder-for-static-build.supabase.co",
  supabaseAnonKey || "placeholder-key-for-static-build"
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
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset successful! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Reset Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" size="long">
            Reset Password
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
  container: "w-full flex flex-col space-y-4",
  header: "text-2xl mb-4",
  form: "space-y-6",
  message: "mt-4 text-center text-green-500",
  link: "text-darkEvergreen hover:underline",
};
