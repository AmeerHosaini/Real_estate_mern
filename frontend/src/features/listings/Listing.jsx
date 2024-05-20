import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";
import { useGetListingsQuery } from "./listingsApiSlice";
import { useState, memo } from "react";
import useAuth from "../../hooks/useAuth";
import Contact from "../../components/Contact";
import useTitle from "../../hooks/useTitle";

const Listing = () => {
  const { id } = useParams();
  SwiperCore.use([Navigation]);

  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const { id: userId, isAuth } = useAuth();

  const { listing } = useGetListingsQuery("listings", {
    selectFromResult: ({ data }) => ({
      listing: data?.entities[id],
    }),
  });

  useTitle(listing?.name);
  if (listing) {
    return (
      <main className="mt-3">
        <Swiper navigation>
          {listing?.imageUrls.map((url) => (
            <SwiperSlide key={url}>
              <div
                className="h-[550px]"
                style={{
                  background: `url(${url}) center no-repeat`,
                  backgroundSize: "contain",
                }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-white cursor-pointer">
          <FaShare
            className="text-black"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
          />
        </div>
        {copied && (
          <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-white p-2">
            Link copied!
          </p>
        )}
        <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
          <p className="text-2xl font-semibold">
            {listing.name} - ${listing.regularPrice.toLocaleString("en-US")}
            {listing.offer && (
              <span>
                {" (Discounted Price: $"}
                {listing.discountedPrice.toLocaleString("en-US")}
                {")"}
              </span>
            )}
            {listing.listingType === "rent" && " / month"}
          </p>
          <p className="flex items-center mt-6 gap-2 text-slate-600  text-sm">
            <FaMapMarkerAlt className="text-green-700" />
            {listing.address}
          </p>
          <div className="flex gap-4">
            <p className="bg-white border border-blue-500 w-full max-w-[250px] text-blue-500 shadow-lg text-center p-2 rounded-md">
              {listing.listingType === "rent" ? "For Rent" : "For Sale"}
            </p>
            {listing.offer && (
              <p className="bg-white border border-green-500 w-full max-w-[250px] text-green-500 shadow-lg text-center p-2 rounded-md">
                Price After discount: $
                {+listing.regularPrice - +listing.discountedPrice}
              </p>
            )}
          </div>
          <p className="text-slate-800">
            <span className="font-semibold text-black">Description - </span>
            {listing.description}
          </p>
          <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaBed className="text-lg" />
              {listing.bedrooms > 1
                ? `${listing.bedrooms} beds `
                : `${listing.bedrooms} bed `}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaBath className="text-lg" />
              {listing.bathrooms > 1
                ? `${listing.bathrooms} baths `
                : `${listing.bathrooms} bath `}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaParking className="text-lg" />
              {listing.parking ? "Parking spot" : "No Parking"}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap ">
              <FaChair className="text-lg" />
              {listing.furnished ? "Furnished" : "Unfurnished"}
            </li>
          </ul>
          {!isAuth && (
            <p className="my-3 ">
              Please{" "}
              <Link className="text-blue-500" to="/auth/signin">
                login
              </Link>{" "}
              to contact the owner.
            </p>
          )}
          {isAuth && listing.userRef !== userId && !contact && (
            <button
              onClick={() => setContact(true)}
              className="bg-blue-950 text-white p-3 rounded-lg w-80 mt-4 border border-blue-950 hover:bg-white hover:text-blue-950 transition duration-300 ease-in-out uppercase"
            >
              Contact the owner
            </button>
          )}
          {contact && <Contact listingId={id} userId={listing?.userRef} />}
        </div>
      </main>
    );
  }
};

const memoizedListingPage = memo(Listing);

export default memoizedListingPage;
