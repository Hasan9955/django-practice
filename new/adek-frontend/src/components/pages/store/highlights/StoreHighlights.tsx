import Image from "next/image";
import banner from "@/assets/images/store/srorebannerimg.png";
import PopularSlider from "./PopularSlider";
import ProductCategoryFilter from "./ProductCategoryFilter";
import ExploreStore from "./ExploreStore";

const StoreHighlights = () => {
  return (
    <>
      <div className="w-full h-auto bg-white mt-1 ">
        <Image
          alt="banner"
          src={banner}
          className="w-full h-auto object-cover"
        />
      </div>
      <ExploreStore />
      <PopularSlider />
      <ProductCategoryFilter />
    </>
  );
};

export default StoreHighlights;
