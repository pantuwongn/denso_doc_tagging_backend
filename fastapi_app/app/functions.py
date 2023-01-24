import os
from fastapi.security import APIKeyHeader
from fastapi import HTTPException, Depends

X_API_KEY = APIKeyHeader(name="X-API-Key")
api_key = os.environ.get("API_KEY")


def api_key_auth(x_api_key: str = Depends(X_API_KEY)):
    # this function is used to validate X-API-KEY in request header
    # if the sent X-API-KEY in header is not existed in the config file
    #   reject access
    if x_api_key != api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden"
        )