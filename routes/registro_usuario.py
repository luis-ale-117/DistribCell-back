"""
registro_usuario.py
Modulo para el registro de nuevos usuarios
"""
from flask import (
    render_template,
    session,
    redirect,
    url_for,
    Blueprint,
)

blueprint = Blueprint("registro_usuario", __name__)


@blueprint.route("/registro_usuario", methods=["GET"])
def pagina_registro_usuario():
    """Regresa la pagina de registro de usuario"""
    if "usuario_id" in session:
        return redirect(url_for("inicio.pagina_inicio"))
    return render_template("registro_usuario.html", titulo="Regístrate")
