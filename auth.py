from datetime import datetime, timedelta
from typing import Annotated
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db_models import User
import db_models
from database import SessionLocal
from starlette import status
from models import UserCreate, LoginRequest, Token
from fastapi import Security
from fastapi.security import SecurityScopes
from dotenv import load_dotenv
import os
    

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

load_dotenv() 

# Secret key and algorithm for JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES =  int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


# Password hashing context (used to hash and unhash passwords)
argon2_context = CryptContext(schemes=["argon2"], deprecated="auto")
# This is where we going to be able to identify where the JWT token is expected to be sent from the client (e.g., in the Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login",
    scopes={
        "sensor:read": "Read sensors",
        "sensor:write": "Create/update sensors",
        "reading:read": "Read readings",
        "reading:write": "Create/update readings",
        "sensor:delete": "Delete sensors",
        "reading:delete": "Delete readings",
        "admin:users": "Manage users/roles/permissions",
    },
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

dp_dendency = Annotated[Session, Depends(get_db)]  


def seed_auth(db: Session):
    # Permissions 
    perm_names = [
        "sensor:read", "sensor:write", "sensor:delete",
        "reading:read", "reading:write", "reading:delete",
        "admin:users",
    ]
    perms = {}
    for name in perm_names:
        p = db.query(db_models.Permission).filter_by(name=name).first()
        if not p:
            p = db_models.Permission(name=name)
            db.add(p)
        perms[name] = p

    db.flush()  # ensure ids exist before commit

    #   Roles
    def get_or_create_role(name: str):
        r = db.query(db_models.Role).filter_by(name=name).first()
        if not r:
            r = db_models.Role(name=name)
            db.add(r)
        return r

    admin_role = get_or_create_role("admin")
    user_role = get_or_create_role("user")
    viewer_role = get_or_create_role("viewer")

    db.flush()

    #   Assign permissions to roles
    admin_role.permissions = list(perms.values())
    user_role.permissions = [
        perms["sensor:read"], perms["sensor:write"],
        perms["reading:read"], perms["reading:write"],
    ]
    viewer_role.permissions = [
        perms["sensor:read"],
        perms["reading:read"],
    ]

    db.flush()

    #   Create initial admin user
    admin = db.query(db_models.User).filter_by(username="admin").first()
    if not admin:
        admin = db_models.User(
            username="admin",
            hashed_password=argon2_context.hash("Admin123!"),
            is_active=True
        )
        admin.roles = [admin_role]
        db.add(admin)

    db.commit()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user( db: dp_dendency, user: UserCreate):

    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create a new user object 
    new_user = User(
        username=user.username,
        # Hash the password
        hashed_password=argon2_context.hash(user.password)
    )

    default_role = db.query(db_models.Role).filter_by(name="viewer").first()
    if default_role:
        new_user.roles.append(default_role)

    # Add the new user to the database
    db.add(new_user)
    db.commit()

    return {"message": "User created"}


@router.post("/login", response_model=Token)
async def login_for_access_token( form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: dp_dendency):
    user = db.query(User).filter(User.username == form_data.username).first()

    # Verify the password: hash the provided password and compare it to the stored hash
    if not user or not argon2_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
    # build scopes from roles -> permissions
    scope_set = set()
    for role in user.roles:
        for perm in role.permissions:
            scope_set.add(perm.name)

    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "scopes": sorted(scope_set)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "scopes": sorted(scope_set)}


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    encode.update({"exp": expire})
    encoded_jwt = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
        security_scopes: SecurityScopes,
        token: Annotated[str, Depends(oauth2_scheme)], 
        db: dp_dendency):
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_scopes: list[str] = payload.get("scopes", [])
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Enforce scopes
    for scope in security_scopes.scopes:
        if scope not in token_scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": f'Bearer scope="{security_scopes.scope_str}"'},
            )

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user



@router.post("/users/{username}/roles/{role_name}")
def add_role_to_user(
    username: str,
    role_name: str,
    db: dp_dendency,
    current_user = Security(get_current_user, scopes=["admin:users"])
):
    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(404, "User not found")

    role = db.query(db_models.Role).filter_by(name=role_name).first()
    if not role:
        raise HTTPException(404, "Role not found")

    if role not in user.roles:
        user.roles.append(role)
        db.commit()

    return {"message": f"Role '{role_name}' added to '{username}'"}
