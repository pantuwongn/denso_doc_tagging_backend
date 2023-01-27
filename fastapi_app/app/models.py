from sqlmodel import SQLModel, Field
from typing import List


class CategoryBase(SQLModel):
    name: str
    enable: bool


class Category(CategoryBase, table=True):
    id: int = Field(default=None, primary_key=True)


class CategoryCreate(CategoryBase):
    pass


class DocumentCategoryBase(SQLModel):
    category_id: int = Field(default=None, foreign_key="category.id")
    value: str


class DocumentCategory(DocumentCategoryBase, table=True):
    id: int = Field(default=None, primary_key=True)
    document_id: int = Field(default=None, foreign_key="document.id")


class DocumentBase(SQLModel):
    name: str
    type: str
    path: str


class Document(DocumentBase, table=True):
    id: int = Field(default=None, primary_key=True)


class DocumentCreate(DocumentBase):
    categories: List[DocumentCategoryBase]


class DocumentRead(Document):
    categories: List[DocumentCategoryBase]


class DocumentUpdate(SQLModel):
    name: str
    categories: List[DocumentCategoryBase]