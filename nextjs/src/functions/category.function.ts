import { IGetCategories } from "@/actions";
import { REQUIRED_NONMULTIPLE_CATEGORY } from "@/constants";
import { MenuProps } from "antd";

export const fetchedCategoryParser = (
  categories?: IGetCategories
): MenuProps["items"] => {
  if (!categories) return [];

  let enabledCategories = categories.filter(
    (category) =>
      category.enable === true &&
      category.name !== REQUIRED_NONMULTIPLE_CATEGORY
  );

  return enabledCategories?.map((category) => {
    return {
      key: category.id,
      label: category.name,
    };
  });
};
