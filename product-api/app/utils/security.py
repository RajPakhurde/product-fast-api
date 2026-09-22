from  pwdlib import PasswordHash
from jose import jwt
from fastapi import Response, HTTPException
import os
import requests
from google.oauth2 import id_token
from google.auth.transport import requests

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

COOKIE_NAME = os.getenv("COOKIE_NAME")
COOKIE_MAX_AGE = os.getenv("COOKIE_MAX_AGE")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

password_hash = PasswordHash.recommended()

def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(plain_password: str, hash_password: str):
    return password_hash.verify(plain_password, hash_password)


def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(key=COOKIE_NAME,value=token, httponly=True, samesite="none", secure=True, max_age=COOKIE_MAX_AGE, path="/")


def clear_auth_cookie(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", samesite="none", secure=True)


def verify_google_auth_token(token:str):
    try:
        google_user = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return google_user

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid google token")