import React from "react";
<<<<<<< HEAD
import ImageStack from "@/components/ui/onboarding-nav";
=======
import ImageStack from "@/components/onboarding/onboarding-nav";
>>>>>>> 146cdd03449318f685f5f3328de82c2eada572ce

const WelcomeMessage: React.FC = () => {
  return (
    <div className="flex h-screen w-full">
      <div className="w-1/3 flex flex-col items-center justify-center p-8 bg-[#F8F8F8]">
        <ImageStack atXero={true} atWelcome={true}/>
      </div>

      <div className="w-2/3 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          All done! Welcome to Arenius!
        </h1>
        <button className="w-40 h-10 bg-[#59C295] text-white text-sm font-semibold rounded-md">
          Go To Dashboard
        </button>
      </div>
    </div>
  );
};

export default WelcomeMessage;
