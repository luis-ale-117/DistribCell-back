"""
usuarios.py
Modelo para el manejo de usuarios en la base de datos
"""
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import db


class Usuarios(db.Model):
    """Modelo de los usuarios"""

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    correo = db.Column(db.String(128), nullable=False, unique=True)
    contrasena_hash = db.Column(db.String(128), nullable=False)
    confirmado = db.Column(db.Boolean, nullable=False, default=False)

    def __init__(
        self,
        nombre: str,
        apellido: str,
        correo: str,
        contrasena: str,
        confirmado: bool = False,
    ):
        self.nombre = nombre
        self.apellido = apellido
        self.correo = correo
        self.contrasena_hash = generate_password_hash(contrasena)
        self.confirmado = confirmado

    def checa_contrasena(self, contrasena: str) -> bool:
        """
        Revisa si la contrasena es la misma que la
        del usuario selecionado
        """
        return check_password_hash(self.contrasena_hash, contrasena)
