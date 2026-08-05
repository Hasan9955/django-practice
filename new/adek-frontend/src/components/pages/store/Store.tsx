import SellerProfile from "./SellerProfile";
import ProductListing from "./ProductListing";
import Newsletter from "./Newsletter";
import StorePosts from "./storePosts";

const Store = () => {
  return (
    <div className="bg-[#F6F6F6] ">
      <SellerProfile />
      <ProductListing />
      <StorePosts />
      <Newsletter />
    </div>
  );
};

export default Store;
