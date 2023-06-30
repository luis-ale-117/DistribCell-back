"""
    home.py
"""
from flask import Blueprint, render_template, request

home_blueprint = Blueprint("home", __name__)


@home_blueprint.route("/", methods=["GET", "POST"])
def home():
    """ABC"""
    if request.method == "GET":
        return render_template("home.html")

    return None
