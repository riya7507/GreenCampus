"""
SQLAlchemy Declarative Base
All future ORM models (User, Issue, Item, etc.) will inherit from this Base class.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
