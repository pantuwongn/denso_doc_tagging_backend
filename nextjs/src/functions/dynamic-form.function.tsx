import { Rule } from "antd/es/form";

export interface IDynamicForm {
  [key: number]: {
    value: string[];
    required: boolean;
  };
}

export interface IDynamicFormRules {
  key: number;
  index: number;
  rules: Rule[];
}

export const shouldApplyRule = (
  formRule: IDynamicFormRules | undefined,
  currentKey: number,
  currentIndex: number
) => {
  if (!formRule) return false;
  return formRule.key === currentKey && formRule.index === currentIndex;
};

export const categoriesformToQueryParser = (
  values: any,
  skipKey?: string[]
) => {
  let tempArry = [];
  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      if (skipKey?.includes(key)) continue;
      const element = values[key];
      const parsedId = parseInt(key.split(",")[0]);

      //Use for combo box input
      if (Array.isArray(element)) {
        element.forEach((e) => {
          tempArry.push({
            category_id: parsedId,
            value: e,
          });
        });
      }
      //Use for normal input
      else {
        tempArry.push({
          category_id: parsedId,
          value: element,
        });
      }
    }
  }
  return tempArry;
};

export const formWithNameToQueryParser = (
  values: any,
  filetype: string,
  uploadPath: string
) => {
  let categories = categoriesformToQueryParser(values, ["nameField"]);
  let payload = {
    name: values["nameField"],
    type: filetype,
    path: uploadPath,
    categories: categories,
  };
  return payload;
};

export const mapPayloadToSearchParams = (
  queryPayload: Array<{ category_id: number; value: string }>
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  queryPayload.forEach((query) => {
    const key = query.category_id.toString();
    const values = searchParams.getAll(key) || [];
    values.push(query.value);

    //@ts-ignore
    searchParams.set(key, values);
  });

  return searchParams;
};

export const removeFromDynamicForm = (
  key: number,
  dynamicForm: IDynamicForm
) => {
  let result = { ...dynamicForm };
  delete result[key];
  return result;
};
