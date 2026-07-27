'use client';

import Lottie from 'lottie-react';
import animationData from '@/public/lottie/loading.json';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-40 h-40 md:w-48 md:h-48">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
        />
      </div>
    </div>
  );
}