import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetListingsQuery } from "../features/listings/listingsApiSlice";
import { useGetUsersQuery } from "../features/users/usersApiSlice";

const Contact = ({ listingId, userId }) => {
  const [message, setMessage] = useState("");

  const { user } = useGetUsersQuery("users", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });

  const { listing } = useGetListingsQuery("listings", {
    selectFromResult: ({ data }) => ({
      listing: data?.entities[listingId],
    }),
  });

  return (
    <section className="flex flex-col gap-4">
      <p>
        Contact <span className="font-bold">{user?.username}</span> for{" "}
        <span className="font-bold">{listing.name.toLowerCase()}</span>
      </p>
      <textarea
        value={message}
        name="message"
        id="message"
        rows="2"
        placeholder="Leave your message..."
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-500 p-3 rounded-lg"
      ></textarea>
      <Link
        to={`mailto:${user?.email}?subject=Regarding ${listing.name}&body=${message}`}
        className="bg-blue-950 w-80 text-white p-3 text-center rounded-lg border border-blue-950 hover:bg-white hover:text-blue-950 transition duration-300 ease-in-out uppercase"
      >
        Send Message
      </Link>
    </section>
  );
};

export default Contact;
