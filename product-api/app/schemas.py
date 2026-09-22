from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str = "USER"

    #this response model is allowed to read data from an objects attributes not only from a dictionary.
    class Config:
        from_attributes = True

class UserResponseForAdmin(BaseModel):
    id: int
    username: str
    email: str
    role: str
    google_auth_enabled: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: str
    owner_id: int

    class Config:
        from_attributes = True


class GoogleLoginRequest(BaseModel):
    credential: str