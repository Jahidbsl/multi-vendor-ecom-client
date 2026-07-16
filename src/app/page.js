import { HeroBanner } from "@/components/Herobanner";
import TopVendors from "@/components/TopVendors";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <TopVendors />
    </div>
  );
}
