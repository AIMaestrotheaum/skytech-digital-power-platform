from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
)

from app.database import get_db


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# CUSTOMER REGISTRATION SCHEMA
# ============================================================

class CustomerRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    query = text("""
        SELECT
            id,
            name,
            email,
            password_hash,
            role,
            is_active
        FROM users
        WHERE email = :email
        LIMIT 1
    """)

    user = db.execute(
        query,
        {
            "email": login_data.email,
        },
    ).mappings().first()

    # User not found
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Inactive account
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Password verification
    if not verify_password(
        login_data.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create JWT
    access_token = create_access_token(
        {
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "user_id": user["id"],
        "name": user["name"],
    }


# ============================================================
# CREATE TEST CUSTOMER
# ============================================================

@router.post("/register-customer")
def register_customer(
    request: CustomerRegisterRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Validate name
    # --------------------------------------------------------

    if not request.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name is required",
        )

    # --------------------------------------------------------
    # Validate password
    # --------------------------------------------------------

    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters",
        )

    # --------------------------------------------------------
    # Check existing email
    # --------------------------------------------------------

    existing_user = db.execute(
        text("""
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER(:email)
            LIMIT 1
        """),
        {
            "email": str(request.email),
        },
    ).mappings().first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    # --------------------------------------------------------
    # Hash password
    # --------------------------------------------------------

    password_hash = hash_password(
        request.password
    )

    # --------------------------------------------------------
    # Create customer
    # --------------------------------------------------------

    result = db.execute(
        text("""
            INSERT INTO users (
                name,
                email,
                password_hash,
                role,
                is_active
            )
            VALUES (
                :name,
                :email,
                :password_hash,
                'customer',
                true
            )
            RETURNING
                id,
                name,
                email,
                role,
                is_active
        """),
        {
            "name": request.name.strip(),
            "email": str(request.email),
            "password_hash": password_hash,
        },
    )

    db.commit()

    customer = result.mappings().first()

    return {
        "success": True,
        "message": "Customer account created successfully",
        "customer": dict(customer),
    }