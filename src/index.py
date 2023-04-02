"""
    index.py
"""
#Imports   sudo service mysql start
from app import app             #importamos app
from utils.db import db         #importamos la bd

#DB
with app.app_context():
    db.create_all()

#Iniciamos
if __name__ == "__main__":
    app.secret_key = 'luisillo'
    app.run(debug = True)