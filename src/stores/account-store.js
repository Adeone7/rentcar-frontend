import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAccount = create(
  persist(
    function (set) {
      return {
        account: null,

        clearAccount: function () {
          set({ account: null });
        },
        setAccount: function (newAccount) {
          set({ account: newAccount });
        },
      };
    },
    { name: "account" }
  )
);

export const useToken = create(
  persist(
    function (set) {
      return {
        token: null,

        clearToken: function () {
          set({ token: null });
        },
        setToken: function (newToken) {
          set({ token: newToken });
        },
      };
    },
    { name: "token" }
  )
);

export const useOfferStore = create(
  persist(
    (set) => ({
      offers: [],
      setOffers: (offers) => set({ offers: [] }),
    }),
    { name: "offer-store" }
  )
);
