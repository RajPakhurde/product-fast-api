from fastapi import (APIRouter, Depends, UploadFile, File, Form, HTTPException)
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, User
from ..schemas import UserResponse
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model= list[UserResponse])
def get_user_list(db: Session = Depends(get_db), current_user: User = Depends(require_role("ADMIN"))):
    try:
        users = db.query(User).all()
        return users

    except Exception:
        raise HTTPException(status_code=500, detail="failed to fetch users..")