"""
    home.py
"""
from flask import render_template, request, Blueprint, flash

blueprint = Blueprint("home", __name__)


@blueprint.route("/", methods=["GET", "POST"])
def home():
    """ABC"""
    if request.method == "GET":
        flash("un mensaje", "info")
        return render_template("inicio.html")

    return None
