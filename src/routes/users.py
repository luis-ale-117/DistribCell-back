"""
    users.py
"""
#Imports

#libreria para hashear la contraseña
import hashlib
#libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, redirect, render_template, request,session,url_for
#importamos de models a la clase usuarios para poder crear a los usuarios con la misma estructura.   
from models.User import User
#importamos la bd para realizar consultas, inserciones, etc.
from utils.db import db
#importamos la clave
from models.Key import Key

    #
#Variable Blueprint para el registro
users_blueprint = Blueprint('users', __name__)
#Agregamos ruta de users
@users_blueprint.route('/delete',methods=['GET','POST','DELETE'])
#Funcion users()
def delete():
    email = session['email']
    #db.session.query(User).filter(User.email == email).delete()
    #db.session.commit()
    print("va a regresar")
    return redirect('/logout')
def update():
    email = session['email']
    user = db.session.query(User).filter(User.email == email)
    print(user)
        