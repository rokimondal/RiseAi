import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMarginStore = create(
    persist(
        (set) => ({
            marginLeft: 56,
            marginRight: 56,
            setMarginLeft: (marginLeft) => set({ marginLeft }),
            setMarginRight: (marginRight) => set({ marginRight }),
        }),
        {
            name: "margin-storage",
            getStorage: () => localStorage,
        }
    )
)