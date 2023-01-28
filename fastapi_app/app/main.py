import os
import aiofiles
import magic
from fastapi import Depends, FastAPI, UploadFile, HTTPException
from starlette.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, col
from typing import List, Dict
from app.db import get_session
from app.models import Document, DocumentRead, DocumentCreate, DocumentUpdate, \
                        Category, DocumentCategory, DocumentCategoryBase, DocumentQuery, \
                        CategoryCreate
from app.functions import api_key_auth, random_text


app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/ping", dependencies=[Depends(api_key_auth)])
async def pong():
    return {"ping": "pong!"}


@app.post("/api/upload_doc", dependencies=[Depends(api_key_auth)])
async def upload_doc(file: UploadFile):
    content_type = file.content_type
    if content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Accept only PDF file!")

    content = await file.read()
    if len(content) > (1024 * 1024 * 50):
        raise HTTPException(status_code=413, detail="File is too large!")

    filename_sp = os.path.splitext(file.filename)
    base_name = filename_sp[0]
    extension = filename_sp[1]
    filename = f"{base_name}_{random_text()}{extension}"
    filename = filename.replace(" ", "_")
    filepath = os.path.join('app', 'uploads', filename)
    async with aiofiles.open(filepath, 'wb') as out_file:
        await out_file.write(content)
    return {"file_type": content_type, "file_path": filepath}


@app.get("/api/download_doc/{file_name}", dependencies=[Depends(api_key_auth)])
async def download_doc(file_name: str):
    filepath = os.path.join('app', 'uploads', file_name)
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="File is not exist!!")
    else:
        mime = magic.Magic(mime=True)
        content_type = mime.from_file(filepath)
        return FileResponse(path=filepath, filename=file_name, media_type=content_type)


@app.post("/api/create_doc", dependencies=[Depends(api_key_auth)], response_model=DocumentRead)
async def create_doc(doc: DocumentCreate, session: AsyncSession = Depends(get_session)):
    try:
        doc_obj = Document(name=doc.name, type=doc.type, path=doc.path)
        session.add(doc_obj)
        await session.commit()
        await session.refresh(doc_obj)
        doc_id = doc_obj.id
        categories = doc.categories
        doc_cat_list = []
        for category in categories:
            doc_cat_obj = DocumentCategory(document_id=doc_id, category_id=category.category_id, value=category.value)
            session.add(doc_cat_obj)
            session.refresh(doc_cat_obj)
            doc_cat_list.append(doc_cat_obj)
            await session.commit()
        doc_read_obj = DocumentRead(id=doc_id, name=doc_obj.name, type=doc_obj.type, path=doc_obj.path, categories=doc_cat_list)
        return doc_read_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.patch("/api/update_doc", dependencies=[Depends(api_key_auth)], response_model=DocumentRead)
async def update_doc(doc_id: int, doc: DocumentUpdate, session: AsyncSession = Depends(get_session)):
    doc_obj = await session.get(Document, doc_id)
    if not doc_obj:
        raise HTTPException(status_code=404, detail="Document not found!!")
    try:
        setattr(doc_obj, "name", doc.name)
        session.add(doc_obj)
        await session.commit()
        await session.refresh(doc_obj)

        statement = select(DocumentCategory).where(DocumentCategory.document_id == doc_id)
        results = await session.execute(statement)
        for doc_cat in results:
            await session.delete(doc_cat[0])

        categories = doc.categories
        doc_cat_list = []
        for category in categories:
            doc_cat_obj = DocumentCategory(document_id=doc_id, category_id=category.category_id, value=category.value)
            session.add(doc_cat_obj)
            session.refresh(doc_cat_obj)
            doc_cat_list.append(doc_cat_obj)
            await session.commit()
        doc_read_obj = DocumentRead(id=doc_id, name=doc_obj.name, type=doc_obj.type, path=doc_obj.path, categories=doc_cat_list)
        return doc_read_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/delete_doc", dependencies=[Depends(api_key_auth)])
async def delete_doc(doc_id: int, session: AsyncSession = Depends(get_session)):
    doc_obj = await session.get(Document, doc_id)
    if not doc_obj:
        raise HTTPException(status_code=404, detail="Document not found!!")
    try:
        statement = select(DocumentCategory).where(DocumentCategory.document_id == doc_id)
        results = await session.execute(statement)
        for doc_cat in results:
            await session.delete(doc_cat[0])
        file_path = doc_obj.path
        print(os.getcwd())
        os.remove(file_path)
        await session.delete(doc_obj)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/get_doc_by_id", dependencies=[Depends(api_key_auth)], response_model=DocumentRead)
async def get_doc(doc_id: int, session: AsyncSession = Depends(get_session)):
    doc_obj = await session.get(Document, doc_id)
    if not doc_obj:
        raise HTTPException(status_code=404, detail="Document not found!!")
    statement = select(DocumentCategory).where(DocumentCategory.document_id == doc_id)
    results = await session.execute(statement)
    doc_cat_list = []
    for doc_cat in results:
        doc_cat_obj = DocumentCategoryBase(category_id=doc_cat[0].category_id, value=doc_cat[0].value)
        doc_cat_list.append(doc_cat_obj)
    ret_doc_obj = DocumentRead(id=doc_obj.id, name=doc_obj.name, type=doc_obj.type, path=doc_obj.path, categories=doc_cat_list)
    return ret_doc_obj


@app.post("/api/query_doc", dependencies=[Depends(api_key_auth)], response_model=List[DocumentRead])
async def query_doc(query_list: List[DocumentQuery], session: AsyncSession = Depends(get_session)):
    final_doc_id_list = []
    for query in query_list:
        q = and_(DocumentCategory.category_id == query.category_id, col(DocumentCategory.value).contains(query.value))
        statement = select(DocumentCategory).where(q)
        results = await session.execute(statement)
        doc_id_list = []
        for res in results:
            doc_id_list.append(res[0].document_id)
        if len(final_doc_id_list) == 0:
            intersect = doc_id_list
        else:
            intersect = [value for value in doc_id_list if value in final_doc_id_list]
        final_doc_id_list = intersect

    returnList = []
    for doc_id in final_doc_id_list:
        doc_obj = await session.get(Document, doc_id)
        if not doc_obj:
            continue
        else:
            statement = select(DocumentCategory).where(DocumentCategory.document_id == doc_id)
            results = await session.execute(statement)
            doc_cat_list = []
            for doc_cat in results:
                doc_cat_obj = DocumentCategoryBase(category_id=doc_cat[0].category_id, value=doc_cat[0].value)
                doc_cat_list.append(doc_cat_obj)
            ret_doc_obj = DocumentRead(id=doc_obj.id, name=doc_obj.name, type=doc_obj.type, path=doc_obj.path, categories=doc_cat_list)
            returnList.append(ret_doc_obj)
    return returnList


@app.get("/api/get_category_list", dependencies=[Depends(api_key_auth)], response_model=List[Category])
async def get_category_list(session: AsyncSession = Depends(get_session)):
    statement = select(Category)
    results = await session.execute(statement)
    return_list = []
    for res in results:
        return_list.append(res[0])
    return return_list


@app.post("/api/create_category", dependencies=[Depends(api_key_auth)], response_model=Category)
async def create_category(category: CategoryCreate, session: AsyncSession = Depends(get_session)):
    try:
        cat_obj = Category(name=category.name, enable=category.enable)
        session.add(cat_obj)
        await session.commit()
        await session.refresh(cat_obj)
        return cat_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.patch("/api/update_category", dependencies=[Depends(api_key_auth)], response_model=Category)
async def update_category(category_id: int, category: CategoryCreate, session: AsyncSession = Depends(get_session)):
    cat_obj = await session.get(Category, category_id)
    if not cat_obj:
        raise HTTPException(status_code=404, detail="Category not found!!")
    try:
        setattr(cat_obj, "name", category.name)
        setattr(cat_obj, "enable", category.enable)
        session.add(cat_obj)
        await session.commit()
        await session.refresh(cat_obj)
        return cat_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
