"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/services/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  Form,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await login({
        email: values.email,
        password: values.password,
      });

      if (response?.status === 200) {
        router.push("/transactions");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
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
                    <Input placeholder="john@email.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormMessage />
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className={styles.actionContainer}>
              <Label className={styles.checkboxContainer}>
                <Checkbox />
                Remember me
              </Label>
              <a href="" className={styles.forgotPassword}>
                Forgot Password?
              </a>
            </div>

            <Button className="mt-4" type="submit" size="long">
              Submit
            </Button>
            <div className={styles.signUpContainer}>
              Don&apos;t have an account?{" "}
              <a href="" className={styles.link}>
                Sign up!
              </a>
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </form>
        </Form>
      </div>

      <div className="w-1/2 bg-gray-200"></div>
    </div>
  );
}

const styles = {
  container: "flex flex-1",
  formContainer:
    "w-1/2 flex flex-1 flex-col items-center justify-center bg-gray-100",
  form: "bg-white p-6 rounded-lg shadow-md w-96",
  actionContainer: "flex justify-between items-center text-black text-sm mt-3",
  checkboxContainer: "flex items-center gap-2",
  signUpContainer: "w-full mt-3 text-center text-black",
  error: "mt-4 text-red-500 text-center",
  link: "text-blue-500 hover:underline",
  forgotPassword: "text-black-500 hover:underline",
};
