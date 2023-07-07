"""
usuarios.py
Modulo para el manejo de los datos del usuario
"""
from flask import redirect, session, url_for, Blueprint
from models import Usuarios

blueprint = Blueprint("usuarios", __name__)


@blueprint.route("/delete", methods=["GET"])
def pagina_datos_usuario():
    """ABC"""
    if "usuario_id" not in session:
        return redirect(url_for("inicio.pagina_inicio"))
    Usuarios.query.get(session["usuario_id"])
    return redirect(url_for("inicio.pagina_inicio"))


def update():
    """ABC"""
    # email = session["email"]
    # user = db.session.query(User).filter(User.email == email)
    return "ok"
