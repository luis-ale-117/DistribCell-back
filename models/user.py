"""
user.py
"""
from utils.db import db


class User(db.Model):
    """User"""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(500), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)

    def __init__(self, email, password, name, lastname):
        self.email = email
        self.password = password
        self.name = name
        self.lastname = lastname

    def nothing(self):
        return

    def nothing2(self):
        return
