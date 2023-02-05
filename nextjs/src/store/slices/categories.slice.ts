import { getCategories, IGetCategories } from "@/actions";
import { StateCreator } from "zustand";
import { ICategoriesState } from "../interface/categories.inteface";

export const CategoriesSlice: StateCreator<ICategoriesState> = (set, get) => ({
  categories: [],
  setCategories(categories) {
    set({ categories: categories });
  },
});
