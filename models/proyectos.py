"""
proyectos.py
"""
from utils.db import db


class Proyectos(db.Model):
    """ABC"""

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), nullable=False)
    proyect = db.Column(db.String(1000), nullable=False)

    def __init__(self, email, proyect):
        self.email = email
        self.proyect = proyect
