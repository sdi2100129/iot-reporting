from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, Float, Date, Time, ForeignKey, Table, Boolean
from datetime import datetime, date, time
 

base = declarative_base()

#   Map to database tables
class Sensor(base):
    __tablename__ = "sensors"
    
    sensorId = Column(Integer, primary_key=True, index=True, nullable=False)
    type = Column(String, index=True, nullable=False)
    vendorName = Column(String, nullable=False)
    vendorEmail = Column(String, nullable=False)
    description = Column(String)
    location = Column(String, nullable=False)

    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")

class SensorReading(base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensorId = Column(Integer, ForeignKey("sensors.sensorId"), nullable=False)
    readingType = Column(String, nullable=False)
    readingValue = Column(Float, nullable=False)
    readingDate = Column(Date, default=date.today)
    readingTime = Column(Time, default=lambda: datetime.now().time())
    description = Column(String, nullable=True)

    sensor = relationship("Sensor", back_populates="readings")


user_roles = Table(
    "user_roles",
    base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


role_permissions = Table(
    "role_permissions",
    base.metadata,
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)



class User(base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    roles = relationship("Role", secondary=user_roles, back_populates="users")



class Role(base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")



class Permission(base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g. "sensor:write"

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
