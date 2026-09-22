from typing import Optional
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from .utils.security import verify_token, COOKIE_NAME


security = HTTPBearer(auto_error=False)

# this will act as a middleware for every protected request 
def get_current_user(request: Request,credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)

    if not token and credentials:
        token = credentials.credentials

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=401, detail="user not found!!!")

    return user


def require_role(require_role: str): 
    def role_checker(current_user: User = Depends(get_current_user)):

        if current_user.role != require_role:
            raise HTTPException(status_code=403, detail="Forbidden: role not allowed to access")

        return current_user

    return role_checker