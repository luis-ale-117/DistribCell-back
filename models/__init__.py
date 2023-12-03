"""
Modelos de la base de datos
"""
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.mysql import JSON, LONGBLOB, BIGINT
from utils.db import db


class Usuarios(db.Model):
    """
    Modelo para el manejo de usuarios en la base de datos
    """

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    apellido = db.Column(db.String(255), nullable=False)
    correo = db.Column(db.String(128), nullable=False, unique=True)
    contrasena_hash = db.Column(db.String(128), nullable=False)
    confirmado = db.Column(db.Boolean, nullable=False, default=False)
    simulaciones = db.relationship(
        "Simulaciones", cascade="all, delete", backref="usuarios", lazy=True
    )

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
        Revisa si la contraseña es la misma que la
        del usuario seleccionado
        """
        return check_password_hash(self.contrasena_hash, contrasena)

    def asigna_contrasena(self, contrasena: str):
        """
        Asigna la nueva contraseña al usuario seleccionado
        """
        self.contrasena_hash = generate_password_hash(contrasena)

    def numero_simulaciones(self):
        """Numero de simulaciones del usuario"""
        return len(self.simulaciones)


class Simulaciones(db.Model):
    """
    Modelo para el manejo de simulaciones en la base de datos
    """

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
    cola = db.relationship(
        "Cola", cascade="all, delete", backref="simulaciones", lazy=True
    )

    def numero_generaciones(self):
        """Numero de generaciones de la simulación"""
        return len(self.generaciones)


class Generaciones(db.Model):
    """
    Modelo para el manejo de generaciones de cada automata
    celular en la base de datos
    """

    id = db.Column(db.Integer, primary_key=True)
    iteracion = db.Column(db.Integer, nullable=False)
    simulacion_id = db.Column(
        db.Integer,
        db.ForeignKey("simulaciones.id"),
        nullable=False,
    )
    contenido = db.Column(LONGBLOB, nullable=False)


class Cola(db.Model):
    """
    Modelo para el manejo de la cola de procesos en la base de datos
    """

    id = db.Column(db.Integer, primary_key=True)
    simulacion_id = db.Column(
        db.Integer,
        db.ForeignKey("simulaciones.id"),
        nullable=False,
    )
    num_generaciones = db.Column(db.Integer, nullable=False, default=1)
    ultima_actualizacion = db.Column(BIGINT, nullable=True, default=0)
