import React from "react";
import { useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface SignupFormProps {
  onSubmit: (data: any) => void;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const { register, formState: { errors }, handleSubmit } = useFormContext();

  return (
    <div className="w-full max-w-lg space-y-6">
      <h2 className="text-2xl font-semibold text-center">Let's set up your account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full p-8 bg-white rounded-lg">
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <input
              {...register("firstName")}
              placeholder="John"
              className="w-full p-4 border border-gray-300 rounded-md"
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
              className="w-full p-4 border border-gray-300 rounded-md"
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
              className="w-full p-4 border border-gray-300 rounded-md"
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
              className="w-full p-4 border border-gray-300 rounded-md"
            />
          </FormControl>
          <FormMessage>{errors.password?.message}</FormMessage>
        </FormItem>

        <button type="submit" className="mt-4 p-4 bg-[#59C295] text-white rounded-md w-full">
          Next
        </button>
      </form>
    </div>
  );
}
