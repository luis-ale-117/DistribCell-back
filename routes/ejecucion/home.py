"""
    home.py
"""
from flask import render_template, request, Blueprint

blueprint = Blueprint("home", __name__)


@blueprint.route("/", methods=["GET", "POST"])
def home():
    """ABC"""
    if request.method == "GET":
        return render_template("home.html")

    return None
