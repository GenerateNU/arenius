import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { SignupRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface SignupFormProps {
  onSubmit: (data: SignupRequest) => void;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useFormContext<SignupRequest>();

  const { isLoginError } = useAuth();

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Let&apos;s set up your account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <input
              {...register("firstName")}
              placeholder="John"
              className={styles.input}
            />
          </FormControl>
          <FormMessage>{errors.firstName?.message}</FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <input
              {...register("lastName")}
              placeholder="Doe"
              className={styles.input}
            />
          </FormControl>
          <FormMessage>{errors.lastName?.message}</FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <input
              type="email"
              {...register("email")}
              placeholder="example@example.com"
              className={styles.input}
            />
          </FormControl>
          <FormMessage>{errors.email?.message}</FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <input
              type="password"
              {...register("password")}
              placeholder="********"
              className={styles.input}
            />
          </FormControl>
          <FormMessage>{errors.password?.message}</FormMessage>
        </FormItem>

        {isLoginError && (
          <div className={styles.error}>Email is already in use.</div>
        )}

        <button type="submit" className={styles.submitButton}>
          Next
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: "w-full max-w-lg space-y-6",
  heading: "text-2xl font-semibold text-center",
  form: "space-y-6 w-full p-8 bg-white rounded-lg",
  input: "w-full p-4 border border-gray-300 rounded-md",
  error: "mt-4 text-red-500 text-center text-sm",
  submitButton: "mt-4 p-4 bg-[#59C295] text-white rounded-md w-full",
};
