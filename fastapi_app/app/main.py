import os
import aiofiles
from fastapi import Depends, FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import Document, DocumentCreate, Category, DocumentCategory
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


@app.post("/api/upload_doc", dependencies=[Depends(api_key_auth)]) #, response_model=Document)
async def upload_doc(file: UploadFile, session: AsyncSession = Depends(get_session)):
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
    print(os.getcwd())
    filepath = os.path.join('app', 'uploads', filename)
    async with aiofiles.open(filepath, 'wb') as out_file:
        await out_file.write(content)
    return {"file_type": content_type, "file_name": filename}