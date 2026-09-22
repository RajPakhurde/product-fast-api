from fastapi import (APIRouter, Depends, HTTPException)
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserResponseForAdmin, UpdateGoogleAuthRequest, UpdateRoleRequest
from ..auth import require_role

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model= list[UserResponseForAdmin])
def get_user_list(db: Session = Depends(get_db), current_user: User = Depends(require_role("ADMIN"))):
    try:
        users = db.query(User).all()
        return users

    except Exception:
        raise HTTPException(status_code=500, detail="failed to fetch users..")


@router.put("/google", response_model=UserResponseForAdmin)
def update_google_auth_status(payload: UpdateGoogleAuthRequest, db: Session = Depends(get_db), current_user: User = Depends(require_role("ADMIN"))):
    user = db.query(User).filter(User.id == payload.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="user not found.")

    user.google_auth_enabled = payload.google_auth_enabled
    db.commit()
    db.refresh(user)
    return user

@router.put("/role", response_model=UserResponseForAdmin)
def update_user_role(payload: UpdateRoleRequest, db: Session = Depends(get_db), current_user: User = Depends(require_role("ADMIN"))):
    user = db.query(User).filter(User.id == payload.user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="user not found.")

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user