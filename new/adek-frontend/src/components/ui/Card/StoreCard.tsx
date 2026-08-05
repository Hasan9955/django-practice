import Image from "next/image";
import { cn } from "@/lib/utils";
import type { StaticImageData } from "next/image";
import { RootState } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export type StoreProduct = {
  name: string;
  image: string | StaticImageData;
};

export type StoreData = {
  id: string;
  name: string;
  bannerImage: string | StaticImageData;
  products: StoreProduct[];
};

type StoreCardProps = {
  store: StoreData;
  className?: string;
};

export function StoreCard({ store, className }: StoreCardProps) {
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.auth.user);

  console.log(store, "store ingo");

  const handleVisitStore = () => {
    if (user === null) {
      Swal.fire({
        title: "Login to Explore NicheHub",
        html: `
        You need to log in to visit this store. <br><br>
        <strong>Login now to explore more!</strong>
      `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Close",
        confirmButtonColor: "#004899",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login");
        }
      });

      return;
    }

    router.push(`/stores/${store.id}`);
  };
  return (
    <article
      className={cn(
        "rounded-[12px] border border-[#CFEDFF] bg-white flex w-full md:w-full lg:w-[400px] px-3 pt-3 pb-8 flex-col items-start gap-2 md:gap-4  transition-all hover:shadow-md hover:-translate-y-1",
        className,
      )}
      aria-label={`${store.name} card`}
    >
      <div className="w-full">
        <div className="h-[167px] w-full overflow-hidden rounded-[8px]">
          <Image
            src={store.bannerImage || "/images.png"}
            alt={`${store.name} banner`}
            width={768}
            height={167}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <div className="flex justify-between items-start gap-2 px-1 my-4 w-full">
          <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
          <button
            onClick={handleVisitStore}
            className="bg-orange-400 hover:bg-orange-500 whitespace-nowrap text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
            aria-label={`Visit ${store.name}`}
          >
            Visit store
          </button>
        </div>
      </div>

      <div className="flex  justify-between gap-4 w-full">
        {store.products?.length ? (
          store.products.slice(0, 3).map((product, index) => (
            <div
              key={index}
              className="flex w-[168px] flex-col items-center gap-[12px]"
            >
              <div className="w-full overflow-hidden rounded-[8px]">
                <Image
                  src={product.image || "/images.png"}
                  alt={product.name}
                  width={168}
                  height={168}
                  className="w-full aspect-square object-cover"
                  priority={index === 0}
                />
              </div>
              <span className="text-[#322F35] text-center text-sm font-medium leading-[124%] line-clamp-1">
                {product.name}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No products available</p>
        )}
      </div>
    </article>
  );
}
