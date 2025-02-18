"use client"
import { useState, useEffect } from "react";
import { signup } from "@/services/signup";
import ImageStack from "@/components/onboarding/onboarding-nav";
import FormProviderWrapper from "@/components/onboarding/form-provider"; 
import SignupForm from "@/components/onboarding/signup-form";
import XeroSSOButton from "@/components/onboarding/xero-button"; 

export default function CustomForm() {

  const [useForm, setUseForm] = useState(true); 

  async function onSubmit(values) {
    console.log("Submitted Values:", values);

    if (!values.email || !values.password) {
      console.error("Email or password is missing!");
      return;
    }

    try {
      console.log("HELLO");
      const response = await signup({
        email: values.email,
        password: values.password,
      });

      console.log("Response:", response);

      if (response.status === 201 || response.status === 200) {
        setUseForm(false); 
      }
    } catch (err) {
      console.error("Signup failed:", err);
    }
  }

  const handleGoBack = () => {
    setUseForm(true); 
  };

  useEffect(() => {
    console.log("useForm state updated:", useForm);
  }, [useForm]);

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/3 flex flex-col items-center justify-center p-8 bg-[#F8F8F8]">
        <ImageStack atXero={!useForm} atWelcome={false} />
      </div>

      <div className="w-3/4 -ml-60 flex items-center justify-center p-8">
        {useForm ? (
          <FormProviderWrapper>
            <SignupForm onSubmit={onSubmit} /> 
          </FormProviderWrapper>
        ) : (
          <XeroSSOButton onGoBack={handleGoBack} /> 
        )}
      </div>
    </div>
  );
}
