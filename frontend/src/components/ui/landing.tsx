import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../assets/onboarding-logo.png";
import { Button } from "@/components/ui/button";  


export default function SignupForm({ setIsLoginPage }) {
  const router = useRouter();

  const handleLogin = () => {
    setIsLoginPage(true); 
  };

  const handleSignup = () => {
    router.push("/onboarding");
  };

  return (
    <div className={styles.formContainer}>
      <div className="flex flex-col justify-start items-center mb-8">
        <h2 className="text-2xl mb-4">Welcome to</h2>
        <Image src={logo} alt="Onboarding Logo" className={styles.logo} />
      </div>

      <div className="w-full flex flex-col items-center space-y-4">
        <Button
          className={`${styles.button} ${styles.loginButton}`}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Button
          className={`${styles.button} ${styles.signupButton}`}
          onClick={handleSignup}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
}

const styles = {
  formContainer:
    "h-[90vh] w-[45vw] flex flex-col items-center justify-center bg-white/100 p-8 rounded-lg shadow-lg",
  logo: "w-100 pb-20",
  button: "w-3/4 py-5 rounded-lg text-lg",
  loginButton:
    "border-2 border-[#59C295] text-black bg-white",
  signupButton:
    "bg-[#59C295] text-white border-2 border-[#59C295]",
};
