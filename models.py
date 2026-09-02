from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    current_price = Column(Float)
    base_price = Column(Float)
    competitor_price = Column(Float, nullable=True)
    inventory_age_days = Column(Integer, default=0) # Stock mein kitne din se hai[cite: 1]
    suggested_price = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)