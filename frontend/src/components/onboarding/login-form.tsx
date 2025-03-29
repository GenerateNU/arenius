"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
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
import Image from 'next/image';
import logo from '../../assets/onboarding-logo.png'; 


const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { login, isLoginError } = useAuth();

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

      if (response?.response?.status === 200) {
        router.push("/transactions");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }
  

  return (
    <div className={styles.formContainer}>
        <div className="flex flex-col justify-start items-center ">
        <h2 className="text-2xl mb-4">Welcome to</h2>
        <Image 
          src={logo} 
          alt="Onboarding Logo" 
          className={styles.logo} 
        />
        </div>
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

        {isLoginError && (
          <div className={styles.error}>Your email or password is incorrect.</div>
        )}

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
            <a href="/onboarding" className={styles.link}>
              Sign up!
            </a>
          </div>
        </form>
      </Form>
    </div>
  );
}

const styles = {
  formContainer:
    "h-[90vh] w-[45vw] flex flex-col items-center justify-center bg-white/100 p-8 rounded-lg shadow-lg",
  form: "w-3/4",
  actionContainer: "flex justify-between items-center text-black text-sm mt-3",
  checkboxContainer: "flex items-center gap-2",
  signUpContainer: "w-full mt-3 text-center text-black",
  error: "mt-4 text-red-500 text-center text-sm",
  link: "text-blue-500 hover:underline",
  forgotPassword: "text-black-500 hover:underline",
  logo: "w-100 pb-20 ", 
};
