import axiosInstance from "@/lib/axios";

export * from "./template.action";

export interface ICategory {
  id: number;
  name: string;
  enable: boolean;
}

export interface IStatuslessCategory {
  category_id: number;
  value: string;
}

export interface IErrorResponse {
  detail: [
    {
      loc: [string, number];
      msg: string;
      type: string;
    }
  ];
}

export interface IDoc {
  name: string;
  type: string;
  path: string;
  id: number;
  categories: IStatuslessCategory[];
}

export type IUploadDoc = {
  file_type: string;
  file_path: string;
};
export type ICreateDoc = IDoc;
export type ICreateDocPayload = Omit<IDoc, "id">;
export type IUpdateDocPayload = Omit<IDoc, "type" | "path" | "id">;
export type IUpdateDoc = IDoc;
export type IGetDoc = IDoc;
export type IQueryDocPayload = IStatuslessCategory[];
export type IQueryDoc = IDoc[];
export type IGetCategories = ICategory[];

export const uploadDoc = async (payload: FormData) => {
  const { data } = await axiosInstance.post<IUploadDoc>("upload_doc", payload);
  return data;
};

export const downloadDoc = async (fileName: string) => {
  const { data } = await axiosInstance.get(`download_doc/${fileName}`, {
    responseType: "blob",
  });
  return data;
};

export const createDoc = async (payload: ICreateDocPayload) => {
  const { data } = await axiosInstance.post<ICreateDoc>("create_doc", payload);
  return data;
};

export const updateDoc = async (
  payload: IUpdateDocPayload,
  queryId: number
) => {
  const { data } = await axiosInstance.patch<IUpdateDoc>(
    "update_doc",
    payload,
    { params: { doc_id: queryId } }
  );
  return data;
};

export const deleteDoc = async (queryId: number) => {
  const { data } = await axiosInstance.delete<string>("delete_doc", {
    params: { doc_id: queryId },
  });
  return data;
};

export const getDocById = async (queryId: number) => {
  const { data } = await axiosInstance.get<IGetDoc>("get_doc_by_id", {
    params: { doc_id: queryId },
  });
  return data;
};

export const queryDoc = async (payload: IQueryDocPayload) => {
  const { data } = await axiosInstance.post<IQueryDoc>("query_doc", payload);
  return data;
};

export const queryInitialDoc = async () => {
  const initialPayload = [
    {
      category_id: 1,
      value: "",
    },
  ];
  const { data } = await axiosInstance.post<IQueryDoc>(
    "query_doc",
    initialPayload
  );
  return data;
};

export const getCategories = async () => {
  const { data } = await axiosInstance.get<IGetCategories>("get_category_list");
  return data;
};

// Not in the application but temp add just in case
export interface ICategoryPayload {
  name: string;
  enable: boolean;
}

export type ICreateCategoryPayload = ICategoryPayload;
export type ICreateCategory = ICategory;
export type IUpdateCategoryPayload = ICategoryPayload;

export const createCategory = async (payload: ICreateCategoryPayload) => {
  const { data } = await axiosInstance.post<ICreateCategory>(
    "create_category",
    payload
  );
  return data;
};

export const updateCategory = async (
  payload: IUpdateCategoryPayload,
  queryId: number
) => {
  const { data } = await axiosInstance.patch("update_category", payload, {
    params: { category_id: queryId },
  });
  return data;
};
