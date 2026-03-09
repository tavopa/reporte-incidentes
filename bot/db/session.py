from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings
from db.models import Base

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create all tables that are not yet present in the database."""
    Base.metadata.create_all(bind=engine)
