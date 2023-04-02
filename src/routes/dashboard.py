"""
    dashboard.py
"""
    #Imports
#libreria para hashear la contraseña
from functools import wraps
#libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, redirect, render_template, request,session
#importamos de models a la clase usuarios para poder crear a los usuarios con la misma estructura.   
from models.User import User
#importamos la bd para realizar consultas, inserciones, etc.
from utils.db import db
#importamos la clave
from models.Key import Key
#importamos protected_routes
#from protected_routes import protected_routes
#funcion para proteger las rutas
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print(session['email'])
        if 'email' not in session:
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function
    #
#Variable Blueprint para el dashboard
dashboard_blueprint = Blueprint('dashboard', __name__)
#Agregamos ruta de dashboard
@dashboard_blueprint.route('/dashboard',methods=['GET','POST'])

@login_required
#definimos la funcion dashboard()
def dashboard():
    #Si recibe GET renderisa el templae dashboard.html
    if request.method == 'GET':
        if 'email' in session:
            email = session['email']
            return render_template('dashboard.html',name_u = session['name'],lastname_u = session['lastname'])
        else:
            return redirect('/login')    
