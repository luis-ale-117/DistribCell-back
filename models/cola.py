"""
cola.py
Modelo para el manejo de la cola de procesos en la base de datos
"""
from sqlalchemy.dialects.mysql import BIGINT
from utils.db import db


class Cola(db.Model):
    """Modelo de la cola de procesos"""

    id = db.Column(db.Integer, primary_key=True)
    simulacion_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        nullable=False,
    )
    proceso_id = db.Column(db.String(255))
    estado = db.Column(db.String(100), nullable=False)
    ultima_actualizacion = db.Column(BIGINT, nullable=False)
