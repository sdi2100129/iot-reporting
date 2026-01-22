from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db_url = "postgresql://postgres:12345678@localhost:5432/iotdb"
engine = create_engine(db_url)

#   Define the database we want to connect with
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)