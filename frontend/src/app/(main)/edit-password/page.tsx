"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
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

export default function EditPasswordPage() {
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
      setMessage("Password edit successful! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Edit Password</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} className="w-full" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button className="w-full mt-4" type="submit" size="long">
              Change Password
            </Button>

            {message && <div className="mt-4 text-center text-red-500">{message}</div>}
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
