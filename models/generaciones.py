"""
generaciones.py
Modelo para el manejo de generaciones de cada automata
celular en la base de datos
"""
from sqlalchemy.dialects.mysql import LONGBLOB  # Longblob
from utils.db import db


class Simulaciones(db.Model):
    """Modelo de las generaciones"""

    iteracion = db.Column(db.Integer, primary_key=True)
    simulacion_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id"),
        primary_key=True,
        nullable=False,
    )
    contenido = db.Column(LONGBLOB)
