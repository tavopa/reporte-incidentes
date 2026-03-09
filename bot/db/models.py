import uuid
from sqlalchemy import Column, String, BigInteger, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_user_id = Column(BigInteger, nullable=False, index=True)
    session_id = Column(String(255), nullable=False)

    # Reportante
    nombre = Column(String(255))
    telefono = Column(String(50))
    nivel_organizacional = Column(String(100))
    compania = Column(String(255))

    # Evento
    fecha_evento = Column(String(50))
    hora_aproximada = Column(String(50))

    # Descripción
    que_ocurrio = Column(Text)
    por_que_ocurrio = Column(Text)
    impacto = Column(Text)

    # Clasificación
    clasificacion_principal = Column(String(100))

    # Control
    estado = Column(String(50), default="pendiente")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
