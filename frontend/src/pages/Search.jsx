import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useTitle from "../hooks/useTitle";
import ListingCard from "../components/ListingCard";
import Loader from "../components/Loading";

const Search = () => {
  useTitle("Search");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    listingType: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "created_at",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const typeFromUrl = urlParams.get("listingType");
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSearchFilters({
        searchTerm: searchTermFromUrl || "",
        listingType: typeFromUrl || "all",
        parking: parkingFromUrl === "true" ? true : false,
        furnished: furnishedFromUrl === "true" ? true : false,
        offer: offerFromUrl === "true" ? true : false,
        sort: sortFromUrl || "created_at",
        order: orderFromUrl || "desc",
      });
    }

    const fetchListings = async () => {
      try {
        setLoading(true);
        setShowMore(false);
        const searchQuery = urlParams.toString();
        const res = await fetch(
          `http://localhost:3500/listing/get?${searchQuery}`
        );
        const data = await res.json();
        setListings(data);
        if (data.length > 8) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === "all" ||
      e.target.id === "rent" ||
      e.target.id === "sell"
    ) {
      setSearchFilters({ ...searchFilters, listingType: e.target.id });
    }

    if (e.target.id === "searchTerm") {
      setSearchFilters({ ...searchFilters, searchTerm: e.target.value });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setSearchFilters({
        ...searchFilters,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      });
    }

    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "created_at";
      const order = e.target.value.split("_")[1] || "desc";
      setSearchFilters({ ...searchFilters, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // keep the searched text in the url and add new filters to it
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", searchFilters.searchTerm);
    urlParams.set("listingType", searchFilters.listingType);
    urlParams.set("parking", searchFilters.parking);
    urlParams.set("furnished", searchFilters.furnished);
    urlParams.set("offer", searchFilters.offer);
    urlParams.set("sort", searchFilters.sort);
    urlParams.set("order", searchFilters.order);
    // console.log(typeof urlParams); object
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    // don't fetch the previous listings but the new ones
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  return (
    <main className="flex flex-col md:flex-row">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* search term */}
          <div className="flex items-center gap-2">
            <label
              className="whitespace-nowrap font-semibold"
              htmlFor="searchTerm"
            >
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              className="border rounded-lg p-3 w-full"
              value={searchFilters.searchTerm}
              onChange={handleChange}
            />
          </div>
          {/* type */}
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="all"
                className="w-4"
                checked={searchFilters.listingType === "all"}
                onChange={handleChange}
              />
              <label htmlFor="all">Rent & Sale</label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-4"
                checked={searchFilters.listingType === "rent"}
                onChange={handleChange}
              />
              <label htmlFor="rent">Rent</label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-4"
                checked={searchFilters.listingType === "sale"}
                onChange={handleChange}
              />
              <label htmlFor="sale">Sale</label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                checked={searchFilters.offer}
                className="w-4"
                onChange={handleChange}
              />
              <label htmlFor="offer">Offer</label>
            </div>
          </div>
          {/* Amenities */}
          <div className="flex gap-2 flex-wrap item-center">
            <label className="font-semibold">Amenities:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-4"
                checked={searchFilters.parking}
                onChange={handleChange}
              />
              <label htmlFor="parking">Parking</label>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-4"
                checked={searchFilters.furnished}
                onChange={handleChange}
              />
              <label htmlFor="furnished">Furnished</label>
            </div>
          </div>
          {/* sort */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              className="border rounded-lg p-3"
              id="sort_order"
              defaultChecked={"created_at_desc"}
            >
              <option value="regularPrice_desc">Price high to low</option>
              <option value="regularPrice_asc">Price low to high</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button
            disabled={loading}
            className="bg-blue-950 text-white p-3 rounded-lg uppercase border border-blue-950 hover:bg-white hover:text-blue-950 transition duration-300 ease-in-out"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 text-slate-700 mt-5">
          Listing Results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && listings.length === 0 && (
            <p className="text-xl text-slate-700">No listing found!</p>
          )}
          {loading && <Loader />}
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingCard key={listing._id} listingId={listing._id} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className="text-blue-500 hover:underline p-7 text-center w-full"
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Search;
