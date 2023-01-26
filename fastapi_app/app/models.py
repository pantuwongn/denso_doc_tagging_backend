from sqlmodel import SQLModel, Field


class DocumentBase(SQLModel):
    name: str


class Document(DocumentBase, table=True):
    id: int = Field(default=None, primary_key=True)
    type: str
    path: str

class DocumentCreate(DocumentBase):
    pass


class CategoryBase(SQLModel):
    name: str
    enable: bool


class Category(CategoryBase, table=True):
    id: int = Field(default=None, primary_key=True)


class CategoryCreate(CategoryBase):
    pass


class DocumentCategory(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    document_id: int = Field(default=None, foreign_key="document.id")
    category_id: int = Field(default=None, foreign_key="category.id")
    value: str