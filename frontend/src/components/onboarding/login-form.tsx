"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loading-spinner";

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export default function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, isLoginError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Monitor path changes to detect when redirect completes
  useEffect(() => {
    if (redirecting && pathname === "/dashboard") {
      // We've arrived at the dashboard, clear the loading state
      setRedirecting(false);
      setLoading(false);
    }
  }, [pathname, redirecting]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await login({
        email: values.email,
        password: values.password,
        rememberMe: checked,
      });

      if (response?.response?.status === 200) {
        setRedirecting(true); // Set redirecting flag
        router.push("/dashboard");
        
        // Fallback timeout in case navigation takes too long
        const fallbackTimer = setTimeout(() => {
          setLoading(false);
          setRedirecting(false);
        }, 5000);
        
        return () => clearTimeout(fallbackTimer);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("An error occured: ", err);
      setLoading(false);
    }
  }

  return (
    <>
      {/* Full-screen loading overlay shown when redirecting */}
      {redirecting && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <LoadingSpinner size={60} className="opacity-80" />
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={styles.formLabel}>Email</FormLabel>
                <FormControl>
                  <Input
                    className="rounded-sm"
                    placeholder="Enter your company email"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={styles.formLabel}>Password</FormLabel>
                <FormControl>
                  <Input
                    className="rounded-sm"
                    type="password"
                    {...field}
                    placeholder="Enter your password"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {isLoginError && (
            <div className={styles.error}>
              Your email or password is incorrect.
            </div>
          )}

          <div className={styles.actionContainer}>
            <Label className={styles.checkboxContainer}>
              <Checkbox
                checked={checked}
                onCheckedChange={() => setChecked(!checked)}
              />
              Remember me
            </Label>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot password
            </Link>
          </div>

          <Button type="submit" size="long" disabled={loading}>
            {loading && !redirecting ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size={20} color="#FFFFFF" className="mr-2" />
                <span>Logging in...</span>
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <div className={styles.signUpContainer}>
            Don&apos;t have an account?{" "}
            <Link href="/onboarding" className={styles.signUp}>
              Sign up!
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
}

const styles = {
  form: "w-full flex flex-col gap-4 mt-10",
  formLabel: "font-header text-[20px]",
  actionContainer: "flex justify-between items-center font-body text-sm my-3",
  checkboxContainer: "flex items-center gap-2",
  signUpContainer: "w-full mt-3 text-center font-body",
  error: "text-red-500 text-center text-sm",
  signUp: "underline font-semibold",
  forgotPassword: "underline font-bold",
};