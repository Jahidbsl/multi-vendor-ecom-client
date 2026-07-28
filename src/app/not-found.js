"use client";

import Lottie from "lottie-react";
import React from "react";
import notfound from "@/public/lottie/Not Found.json";

const UnderCons = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl w-full mx-auto text-center space-y-6">
        
        {/* Lottie Animation Container */}
        <div className="w-full max-w-[320px] sm:max-w-[480px] lg:max-w-[600px] mx-auto">
          <Lottie animationData={notfound} loop={true} autoplay={true} />
        </div>

      </div>
    </div>
  );
};

export default UnderCons;