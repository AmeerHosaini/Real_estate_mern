import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../app/api/apiSlice";

const listingsAdapter = createEntityAdapter();

const initialState = listingsAdapter.getInitialState();

export const listingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query({
      query: () => ({
        url: "/listing/get",
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      transformResponse: (responseData) => {
        const loadedOffers = responseData?.map((listing) => {
          listing.id = listing._id;
          return listing;
        });
        return listingsAdapter.setAll(initialState, loadedOffers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Listing", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Listing", id })),
          ];
        } else {
          return [{ type: "Listing", id: "LIST" }];
        }
      },
    }),
    getListingsBySearch: builder.query({
      query: (searchQuery) => ({
        url: `/listing/get?${searchQuery}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      transformResponse: (responseData) => {
        const loadedOffers = responseData?.map((listing) => {
          listing.id = listing._id;
          return listing;
        });
        return listingsAdapter.setAll(initialState, loadedOffers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Listing", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Listing", id })),
          ];
        } else {
          return [{ type: "Listing", id: "LIST" }];
        }
      },
    }),
    addNewListing: builder.mutation({
      query: (initialListing) => ({
        url: "/listing",
        method: "POST",
        body: {
          ...initialListing,
        },
      }),
      invalidatesTags: [{ type: "Listing", id: "LIST" }],
    }),
    updateListing: builder.mutation({
      query: (initialListing) => ({
        url: `/listing`,
        method: "PATCH",
        body: {
          ...initialListing,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Listing", id: arg.id },
      ],
    }),
    deleteListing: builder.mutation({
      query: ({ id }) => ({
        url: "/listing",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Listing", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetListingsQuery,
  useGetListingsBySearchQuery,
  useAddNewListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
} = listingsApiSlice;

export const selectListingResult =
  listingsApiSlice.endpoints.getListings.select();

// create memoized selector
const selectListingData = createSelector(
  selectListingResult,
  (listingResult) => listingResult.data
);

export const {
  selectAll: selectAllListings,
  selectById: selectListingById,
  selectIds: selectListingsIds,
} = listingsAdapter.getSelectors(
  (state) => selectListingData(state) ?? initialState
);
