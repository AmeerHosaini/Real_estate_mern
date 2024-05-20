import { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";
import useTitle from "../../hooks/useTitle";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAddNewListingMutation } from "./listingsApiSlice";

const NewListing = () => {
  useTitle("Create Listing");

  const navigate = useNavigate();
  const { id } = useAuth();
  const [files, setFiles] = useState([]);
  const [isImageUploadError, setIsImageUploadError] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    listingType: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [addNewListing, { isLoading, isSuccess, isError, error }] =
    useAddNewListingMutation();

  useEffect(() => {
    if (isSuccess) {
      setFormData({
        imageUrls: [],
        name: "",
        description: "",
        address: "",
        listingType: "rent",
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 0,
        discountedPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
      });
    }
  }, [isSuccess]);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setIsUpload(true);
      setIsImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setIsImageUploadError(false);
          setIsUpload(false);
        })
        .catch((err) => {
          setIsImageUploadError("Image upload failed (2 mb max per image)");
          setIsUpload(false);
        });
    } else {
      setIsImageUploadError("You can only upload 6 images per listing");
      setIsUpload(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        listingType: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    if (formData.imageUrls.length < 1) {
      return toast.error("You must upload at least one image!");
    }

    if (+formData.regularPrice < +formData.discountedPrice)
      return toast.error("Discount price must be lower than regular price");

    if (!isError) {
      const { data } = await addNewListing({ ...formData, userRef: id });
      navigate(`/listing/${data._id}`);
      toast.success("Listing added successfully");
    } else {
      return toast.error(error?.data?.message);
    }
  };

  return (
    <>
      <Toaster />
      <main className="p-3 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-center my-7">
          Create a Listing
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex flex-col gap-4 flex-1">
            <input
              type="text"
              placeholder="Name"
              className="border p-3 rounded-lg"
              id="name"
              maxLength="62"
              minLength="10"
              required
              value={formData.name}
              onChange={handleChange}
            />
            <textarea
              type="text"
              placeholder="Description"
              className="border p-3 rounded-lg"
              id="description"
              required
              value={formData.description}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Address"
              className="border p-3 rounded-lg"
              id="address"
              required
              value={formData.address}
              onChange={handleChange}
            />
            <div className="flex gap-6 flex-wrap">
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="sale"
                  className="w-5"
                  onChange={handleChange}
                  checked={formData.listingType === "sale"}
                />
                <label htmlFor="sale">Sale</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="rent"
                  className="w-5"
                  checked={formData.listingType === "rent"}
                  onChange={handleChange}
                />
                <label htmlFor="rent">Rent</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="parking"
                  className="w-5"
                  checked={formData.parking}
                  onChange={handleChange}
                />
                <label htmlFor="parking">Parking spot</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="furnished"
                  className="w-5"
                  checked={formData.furnished}
                  onChange={handleChange}
                />
                <label htmlFor="furnished">Furnished</label>
              </div>
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="offer"
                  className="w-5"
                  checked={formData.offer}
                  onChange={handleChange}
                />
                <label htmlFor="offer">Offer</label>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="bedrooms"
                  min="1"
                  max="10"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
                <label htmlFor="bedrooms">Beds</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="bathrooms"
                  min="1"
                  max="10"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
                <label htmlFor="bathrooms">Baths</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="regularPrice"
                  min="0"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  value={formData.regularPrice}
                  onChange={handleChange}
                />
                <div className="flex flex-col items-center">
                  <p>Regular price</p>
                  {formData.listingType === "rent" && (
                    <span className="text-xs">($ / month)</span>
                  )}
                </div>
              </div>
              {formData.offer && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="discountedPrice"
                    min="0"
                    required
                    className="p-3 border border-gray-300 rounded-lg"
                    value={formData.discountedPrice}
                    onChange={handleChange}
                  />
                  <div className="flex flex-col items-center">
                    <p>Discounted price</p>

                    {formData.listingType === "rent" && (
                      <span className="text-xs">($ / month)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-4">
            <p className="font-semibold">
              Images:
              <span className="font-normal text-gray-600 ml-2">
                The first image will be the cover (max 6)
              </span>
            </p>
            <div className="flex gap-4">
              <input
                onChange={(e) => setFiles(e.target.files)}
                className="p-3 border border-gray-300 rounded w-full"
                type="file"
                id="images"
                accept="image/*"
                multiple
              />
              <button
                type="button"
                disabled={isUpload}
                onClick={handleImageSubmit}
                className="p-3 text-white bg-green-500 hover:text-green-500 hover:bg-white border border-green-500 rounded uppercase transition duration-300 ease-in-out hover:shadow-lg disabled:opacity-80"
              >
                {isUpload ? "Uploading..." : "Upload"}
              </button>
            </div>
            <p className="text-red-500 text-sm">{isImageUploadError}</p>
            {formData.imageUrls.length > 0 &&
              formData.imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="flex justify-between p-3 border items-center"
                >
                  <img
                    src={url}
                    alt="listing image"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-3 text-red-500 rounded-lg uppercase hover:opacity-75"
                  >
                    Delete
                  </button>
                </div>
              ))}
            <button
              disabled={isLoading}
              className="p-3 bg-orange-500 text-white rounded-lg uppercase hover:bg-white hover:text-orange-500 border border-orange-500 transition duration-300 ease-in-out disabled:opacity-80"
            >
              {isLoading ? "Creating..." : "Create listing"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default NewListing;
