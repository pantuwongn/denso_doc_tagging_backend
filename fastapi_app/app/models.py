from sqlmodel import SQLModel, Field


class Document(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    type: str
    path: str


class Category(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    enable: bool


class DocumentCategory(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    document_id: int = Field(default=None, foreign_key="document.id")
    category_id: int = Field(default=None, foreign_key="category.id")
    value: str