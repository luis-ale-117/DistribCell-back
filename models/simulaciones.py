"""
simulaciones.py
Modelo para el manejo de simulaciones en la base de datos
"""
from sqlalchemy.dialects.mysql import JSON
from utils.db import db


class Simulaciones(db.Model):
    """Modelo de los simulaciones"""

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.String(2048))
    anchura = db.Column(db.Integer, nullable=False)
    altura = db.Column(db.Integer, nullable=False)
    estados = db.Column(db.Integer, nullable=False)
    reglas = db.Column(JSON, nullable=False)
    tipo = db.Column(db.String(100), nullable=False)
    generaciones = db.relationship(
        "Generaciones", cascade="all, delete", backref="simulaciones", lazy=True
    )
