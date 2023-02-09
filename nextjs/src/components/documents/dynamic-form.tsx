import { IGetCategories } from "@/actions";
import {
  IDynamicForm,
  IDynamicFormRules,
  shouldApplyRule,
} from "@/functions/dynamic-form.function";
import { Form, Input, Select } from "antd";

interface IProps {
  dynamicForm: IDynamicForm;
  categories?: IGetCategories;
  formRule?: IDynamicFormRules;
  selectKey?: number[];
}

export const DynamicFormsElement = ({
  dynamicForm,
  categories,
  formRule,
}: IProps) => {
  let nodes = [];
  for (const key in dynamicForm) {
    if (Object.prototype.hasOwnProperty.call(dynamicForm, key)) {
      let parsedKey = parseInt(key);
      const fields = dynamicForm[parsedKey];
      const targetCategory = categories?.find(
        (category) => category?.id === parsedKey
      );

      nodes.push(
        <Form.Item
          label={targetCategory?.name}
          name={`${key}`}
          key={`${key}`}
          initialValue={dynamicForm[parsedKey]}
        >
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder={targetCategory?.name}
            options={[{ label: `Please enter your ${targetCategory?.name}` }]}
            dropdownRender={(menu) => <>{menu}</>}
          />
        </Form.Item>
      );
    }
  }
  return <>{nodes}</>;
};
