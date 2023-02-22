import { IGetCategories } from '@/actions';
import {
  IDynamicForm,
  IDynamicFormRules,
  shouldApplyRule,
} from '@/functions/dynamic-form.function';
import { Button, Form, Input, Select } from 'antd';
import TruncateTag from '../tags/truncate-tag';

interface IProps {
  dynamicForm: IDynamicForm;
  categories?: IGetCategories;
  formRule?: IDynamicFormRules;
  selectKey?: number[];
  onRemoveElementClick?: (key: number) => void;
}

export const DynamicFormsElement = ({
  dynamicForm,
  categories,
  formRule,
  onRemoveElementClick,
}: IProps) => {
  let nodes = [];
  for (const key in dynamicForm) {
    if (Object.prototype.hasOwnProperty.call(dynamicForm, key)) {
      let parsedKey = parseInt(key);
      const fields = dynamicForm[parsedKey].value;
      const targetCategory = categories?.find(
        (category) => category?.id === parsedKey
      );

      console.log("IS single here? ", dynamicForm[parsedKey]);
      

      nodes.push(
        <div className="flex items-center">
          <Form.Item
            label={targetCategory?.name}
            name={`${key}`}
            key={`${key}`}
            initialValue={dynamicForm[parsedKey].value}
            className="flex-1"
          >
            {dynamicForm[parsedKey].isSingle ? (
              <Input placeholder={`Enter ${targetCategory?.name}`} />
            ) : (
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder={targetCategory?.name}
                options={[
                  { label: `Please enter your ${targetCategory?.name}` },
                ]}
                dropdownRender={(menu) => <>{menu}</>}
                className="flex-1"
                tagRender={TruncateTag}
              />
            )}
          </Form.Item>
          {!dynamicForm[parsedKey].required && onRemoveElementClick && (
            <Button
              type="text"
              className="text-gray-400 mt-2 ml-2"
              onClick={() => {
                onRemoveElementClick(parseInt(key));
              }}
            >
              X
            </Button>
          )}
        </div>
      );
    }
  }
  return <>{nodes}</>;
};
