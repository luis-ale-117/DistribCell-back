"""
    index.py
"""
# Imports   sudo service mysql start
from app import app  # importamos app
from utils.db import db  # importamos la bd
import os

# DB
with app.app_context():
    db.create_all()

# Iniciamos
if __name__ == "__main__":
    app.secret_key = os.getenv("APP_SECRET", "luisillo")
    app.run(host="0.0.0.0", debug=True)
