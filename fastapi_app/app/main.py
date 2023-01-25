from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import get_session, DB_USER, DB_PASS
from app.models import Document, Category, DocumentCategory
from app.functions import api_key_auth


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