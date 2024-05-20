import { Link } from "react-router-dom";
import { useGetListingsQuery } from "../features/listings/listingsApiSlice";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SwiperCore from "swiper";
import "swiper/css/bundle";
import { Toaster, toast } from "react-hot-toast";
import Loader from "../components/Loading";
import ListingCard from "../components/ListingCard";

const Home = () => {
  SwiperCore.use([Navigation]);

  const {
    data: listings,
    isLoading,
    isError,
    error,
  } = useGetListingsQuery("listings", {
    pollingInterval: 6000000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  if (isError) {
    return toast.error(error?.data?.message);
  }

  const renderListings = (type) => {
    const filteredListings = (
      listings?.ids.filter(
        (id) => listings.entities[id].listingType === type
      ) || []
    ).slice(0, 4);

    if (filteredListings.length === 0) {
      return (
        <div className="text-gray-600 text-center">
          No {type} listings available
        </div>
      );
    }

    return filteredListings.map((id) => (
      <ListingCard key={id} listingId={id} />
    ));
  };

  const renderOffer = (type, isAvailable) => {
    const filteredListings = (
      listings?.ids.filter(
        (id) => listings.entities[id].offer === isAvailable
      ) || []
    ).slice(0, 4);

    if (filteredListings.length === 0) {
      return (
        <div className="text-gray-600 text-center">
          No {type} listings available
        </div>
      );
    }

    return filteredListings.map((id) => (
      <ListingCard key={id} listingId={id} />
    ));
  };

  return isLoading ? (
    <Loader />
  ) : (
    <main>
      <Toaster />
      {/* Heading */}
      <section className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your dream house <span className="text-slate-500">with</span>{" "}
          DreamSpace
        </h1>
        <div className="text-gray-400 text-xs sm:text-sm">
          Explore a diverse selection of homes, from cozy cottages to luxurious
          estates,
          <br /> with Ameer Estate Agency. Let us guide you on your path to home
          ownership.
        </div>
        <Link
          to="/search"
          className="text-xs sm:text-sm text-blue-500 font-bold hover:underline"
        >
          Explore Now...
        </Link>
      </section>

      {/* Slider */}
      <Swiper navigation>
        {listings?.ids
          .filter((id) => listings.entities[id].offer === true)
          .map((id, index) => (
            <SwiperSlide key={index}>
              <div
                style={{
                  background: `url(${listings.entities[id].imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[500px]"
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* Offered */}
      <section className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        <div>
          <div className="my-3">
            <h2 className="text-2xl font-semibold text-slate-600">
              Recent Offers
            </h2>
            <Link
              to="/search?offer=true"
              className="text-sm text-blue-800 hover:underline"
            >
              Show more offers
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {renderOffer("offer", true)}
          </div>
        </div>
      </section>

      {/* Rents */}
      <section className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        <div>
          <div className="my-3">
            <h2 className="text-2xl font-semibold text-slate-600">
              Recent Places for Rent
            </h2>
            <Link
              to="/search?offer=true"
              className="text-sm text-blue-800 hover:underline"
            >
              Show more places for rent
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">{renderListings("rent")}</div>
        </div>
      </section>

      {/* Sales */}
      <section className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        <div>
          <div className="my-3">
            <h2 className="text-2xl font-semibold text-slate-600">
              Recent Places for Sale
            </h2>
            <Link
              to="/search?offer=true"
              className="text-sm text-blue-800 hover:underline"
            >
              Show more places for sale
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">{renderListings("sale")}</div>
        </div>
      </section>
    </main>
  );
};

export default Home;
