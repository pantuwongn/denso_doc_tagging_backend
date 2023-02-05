import { IGetCategories } from "@/actions";

export interface ICategoriesState {
  categories: IGetCategories;
  setCategories: (categories: IGetCategories) => void;
}
