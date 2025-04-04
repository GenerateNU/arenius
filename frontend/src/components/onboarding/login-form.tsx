"use client";

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
  FormControl,
  Form,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import logo from "../../assets/onboarding-logo.png";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoginError } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await login({
        email: values.email,
        password: values.password,
      });

      if (response?.response?.status === 200) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("An error occured: ", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className="flex flex-col justify-start w-full">
        <h2 className="font-header text-2xl mb-4">Welcome to</h2>
        <Image src={logo} alt="Onboarding Logo" className={styles.logo} />
      </div>
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
              <Checkbox />
              Remember me
            </Label>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot password
            </Link>
          </div>

          <Button type="submit" size="long" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
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
    </div>
  );
}

const styles = {
  formContainer:
    "h-[80vh] w-full flex flex-col items-center justify-center bg-white/100 px-16 py-10 rounded-lg shadow-lg font-body",
  form: "w-full flex flex-col gap-4 mt-10",
  formLabel: "font-header text-[20px]",
  actionContainer: "flex justify-between items-center font-body text-sm my-3",
  checkboxContainer: "flex items-center gap-2",
  signUpContainer: "w-full mt-3 text-center font-body",
  error: "text-red-500 text-center text-sm",
  signUp: "underline font-semibold",
  forgotPassword: "underline font-bold",
  logo: "w-100",
};
