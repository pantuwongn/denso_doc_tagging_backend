import { IGetCategories } from "@/actions";
import { Form, Input } from "antd";
import { Rule } from "antd/es/form";

export interface IDynamicForm {
  [key: number]: string[];
}

export interface IDynamicFormRules {
  key: number;
  index: number;
  rules: Rule[];
}

const shouldApplyRule = (
  formRule: IDynamicFormRules | undefined,
  currentKey: number,
  currentIndex: number
) => {
  if (!formRule) return false;
  return formRule.key === currentKey && formRule.index === currentIndex;
};

export const DynamicFormsElement = (
  dynamicForm: IDynamicForm,
  categories?: IGetCategories,
  formRule?: IDynamicFormRules
) => {
  let nodes = [];
  for (const key in dynamicForm) {
    if (Object.prototype.hasOwnProperty.call(dynamicForm, key)) {
      let parsedKey = parseInt(key);
      const fields = dynamicForm[parsedKey];
      const targetCategory = categories?.find(
        (category) => category?.id === parsedKey
      );

      nodes.push(
        <div className="flex flex-col">
          {fields.map((field, index) => {
            const rules = shouldApplyRule(formRule, parsedKey, index)
              ? formRule?.rules
              : undefined;
            if (index === 0) {
              //Key should not be index but i don't know ...
              return (
                <Form.Item
                  label={targetCategory?.name}
                  name={`${key},${index}`}
                  key={`${key},${index}`}
                  initialValue={dynamicForm[parsedKey][index]}
                  rules={rules}
                >
                  <Input placeholder={`Enter ${targetCategory?.name}`} />
                </Form.Item>
              );
            }
            return (
              <Form.Item
                name={`${key},${index}`}
                key={`${key},${index}`}
                initialValue={dynamicForm[parsedKey][index]}
                rules={rules}
              >
                <Input placeholder={`Enter ${targetCategory?.name}`} />
              </Form.Item>
            );
          })}
        </div>
      );
    }
  }
  return nodes;
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

      tempArry.push({
        category_id: parsedId,
        value: element,
      });
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

  console.log("Search param ", searchParams.toString());

  return searchParams;
};
