import { useGetListingsQuery } from "../features/listings/listingsApiSlice";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaBath, FaBed } from "react-icons/fa";
import { memo } from "react";

const ListingCard = ({ listingId }) => {
  const { listing } = useGetListingsQuery("listings", {
    selectFromResult: ({ data }) => ({
      listing: data?.entities[listingId],
    }),
  });
  if (listing) {
    return (
      <section className="bg-white gap-4 shadow-md hover:shadow-xl transition duration-300 ease-in-out overflow-hidden rounded-lg w-full my-5 sm:w-[330px]">
        <Link to={`/listing/${listingId}`}>
          <img
            src={listing.imageUrls[0]}
            alt={listing.name}
            className="h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition duration-300 ease-in-out overflow-hidden rounded-lg my-5 sm:w-[330px]"
          />
          <div className="p-3 flex flex-col gap-3 w-full">
            <p className="truncate text-lg font-semibold text-slate-700">
              {listing.name}
            </p>
            <div className="flex items-center gap-1">
              <MdLocationOn className="h-4 w-4 text-green-700" />
              <p className="text-sm text-gray-500 truncate w-full">
                {listing.address}
              </p>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {listing.description}
            </p>
            <p className="text-lg font-semibold text-slate-700">
              ${listing.regularPrice.toLocaleString("en-US")}
              {listing.offer && (
                <span>
                  {" (Discounted Price: $"}
                  {listing.discountedPrice.toLocaleString("en-US")}
                  {")"}
                </span>
              )}
              {listing.listingType === "rent" && " / month"}
            </p>
            <ul className="text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds `
                  : `${listing.bedrooms} bed `}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths `
                  : `${listing.bathrooms} bath `}
              </li>
            </ul>
          </div>
        </Link>
      </section>
    );
  }
};

const memoizedListing = memo(ListingCard);

export default memoizedListing;
