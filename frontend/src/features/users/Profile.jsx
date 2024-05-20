import useTitle from "../../hooks/useTitle";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetListingsQuery,
  useDeleteListingMutation,
} from "../listings/listingsApiSlice";
import { toast } from "react-hot-toast";
import { useSendLogoutMutation } from "../auth/authApiSlice";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "./usersApiSlice";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";

const Profile = () => {
  useTitle("User Profile");
  const navigate = useNavigate();
  const { id: userId } = useAuth();

  const { user } = useGetUsersQuery("users", {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatar(user.avatar);
    }
  }, [user]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showListings, setShowListings] = useState(false);
  const [file, setFile] = useState(undefined);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const fileRef = useRef(null);

  const { listings } = useGetListingsQuery("listings", {
    selectFromResult: ({ data }) => ({
      listings: data?.ids
        .map((id) => data?.entities[id])
        .filter((listing) => listing?.userRef === userId),
    }),
  });

  const [
    updateUser,
    { isLoading, isError: isUpdateUserError, error: updateUserError },
  ] = useUpdateUserMutation();
  const [
    deleteUser,
    {
      isError: isDeleteUserError,
      error: deleteUserError,
      isSuccess: isDeleteUserSuccess,
    },
  ] = useDeleteUserMutation();
  const [sendLogout, { isSuccess: isLogoutSuccess }] = useSendLogoutMutation();
  const [deleteListing, { isError, error }] = useDeleteListingMutation();

  useEffect(() => {
    if (isLogoutSuccess) {
      navigate("/auth/signin");
    }
  }, [isLogoutSuccess, navigate]);

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  useEffect(() => {
    if (isDeleteUserSuccess) navigate("/auth/signup");
  }, [isDeleteUserSuccess, navigate]);

  // update user profile image
  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setAvatar(downloadURL)
        );
      }
    );
  };

  // update user profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmPassword !== password) {
      return toast.error("Password does not match!");
    }
    try {
      if (!isUpdateUserError) {
        if (password) {
          await updateUser({
            userId,
            username,
            email,
            password,
            avatar,
          }).unwrap();
          toast.success("User information updated successfully!");
        } else {
          await updateUser({ userId, username, email, avatar }).unwrap();
          toast.success("User information updated successfully!");
        }
      } else {
        toast.error(updateUserError?.data?.message);
      }
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  // delete user profile
  const handleDeleteUserProfile = async () => {
    try {
      if (!isDeleteUserError) {
        await deleteUser({ userId }).unwrap();
        toast.success("Profile deleted successfully!");
        await sendLogout();
      } else {
        toast.error(deleteUserError?.data?.message);
      }
    } catch (error) {
      toast.error(error?.data?.message);
    }
  };

  // sign out
  const onLogoutClicked = () => sendLogout();

  // delete listing
  const onDeleteListingClicked = async (id) => {
    try {
      if (!isError) {
        await deleteListing({ id }).unwrap();
        toast.success("Listing deleted successfully");
      } else {
        toast.error(error?.data?.message);
      }
    } catch (error) {
      console.log(error?.data?.message);
      toast.error("An error occurred while deleting");
    }
  };

  // toggle listing
  const toggleListings = () => {
    setShowListings(!showListings);
  };

  return (
    <main className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <img
          onClick={() => fileRef.current.click()}
          src={avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-500">
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>
        <div className="flex flex-col">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            defaultValue={username}
            onChange={(e) => setUsername(e.target.value)}
            id="username"
            className="border p-3 rounded-lg"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            className="border p-3 rounded-lg"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            className="border p-3 rounded-lg"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            id="confirm-password"
            className="border p-3 rounded-lg"
          />
        </div>
        <button className="bg-blue-950 text-white rounded-lg p-3 uppercase hover:bg-white hover:text-blue-950 border border-blue-950 transition duration-300 ease-in-out disabled:opacity-80 disabled:hover:bg-blue-950 disabled:hover:text-white">
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
        <Link
          to="/create-listing"
          className="bg-orange-500 text-center text-white rounded-lg p-3 uppercase hover:bg-white hover:text-orange-500 border border-orange-500 transition duration-300 ease-in-out disabled:opacity-80 disabled:hover:bg-orange-500 disabled:hover:text-white"
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUserProfile}
          className="text-red-500 cursor-pointer"
        >
          Delete account
        </span>
        <span
          onClick={onLogoutClicked}
          className="text-blue-950 cursor-pointer"
        >
          Sign out
        </span>
      </div>
      <button
        onClick={toggleListings}
        className="text-green-500 text-center w-full my-4"
      >
        {showListings ? "Hide Listings" : "Show Listings"}
      </button>
      {showListings && listings && listings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing.id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt={listing.name}
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                to={`/listing/${listing.id}`}
                className="text-blue-500 truncate flex-1"
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => onDeleteListingClicked(listing.id)}
                  className="text-red-500 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing.id}`}>
                  <button className="text-slate-500 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* show listings error */}
    </main>
  );
};

export default Profile;
