from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, UserLogin
from ..auth import get_current_user
from ..utils.security import(hash_password, verify_password, create_access_token, set_auth_cookie, clear_auth_cookie)


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(user.email == User.email).first()

    if existing_user:
        raise HTTPException(status_code = 400,detail= "Email already registered")

    new_user = User(username=user.username, email=user.email, password = hash_password(user.password))

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



@router.post("/login", response_model=UserResponse)
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="invalid credetials")

    token = create_access_token({ "user_id": existing_user.id, "user_email": existing_user.email})
    set_auth_cookie(response, token)
    return existing_user


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=204)
def logout(response: Response):
    clear_auth_cookie(response)