from fastapi import (APIRouter, Depends, UploadFile, File, Form, HTTPException)
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
from ..database import get_db
from ..models import Product, User
from ..schemas import ProductResponse
from ..auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("", response_model=ProductResponse)
def create_product(name: str = Form(...), description: str = Form(...), price: float = Form(...), image: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    extension = Path(image.filename).suffix
    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        buffer.write(image.file.read())

    product = Product(name=name, description=description, price=price, image_url=f"/uploads/{filename}", owner_id=current_user.id)

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("")
def get_products(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    if page < 1:
        raise HTTPException(status_code=400, detail="page must be >= 1")

    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")

    offset = (page -1) * limit
    total = db.query(Product).count()
    products = (db.query(Product).offset(offset).limit(limit).all())
    total_pages = (total + limit - 1) // limit

    return {"items": products, "page": page, "limit":limit, "total": total, "total_pages": total_pages}


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this product")

    db.delete(product)
    db.commit()
    