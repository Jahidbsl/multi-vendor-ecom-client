import { HeroBanner } from "@/components/Herobanner";
import TopSellingProducts from "@/components/Topsellingproducts";
import TopVendors from "@/components/TopVendors";

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <TopSellingProducts/>
      <TopVendors />
    </div>
  );
}
