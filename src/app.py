"""
    app.py
"""
#Imports
from flask import Flask                             #Flask
from routes.login import login_blueprint            #ruta login
from routes.signup import signup_blueprint      #ruta register
from routes.home import home_blueprint              #ruta home
from routes.dashboard import dashboard_blueprint    #ruta dashboard
from routes.users import users_blueprint             #ruta users
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from utils.db import db

#Inicia Flask
app = Flask(__name__)

#configuracion de app para la base de datos

#creamos la base de datos si no ha sido creada
engine = create_engine("mysql://root:Mart123.v@localhost/tt")       
if not database_exists(engine.url):
    create_database(engine.url)
app.config["SQLALCHEMY_DATABASE_URI"] = 'mysql://root:Mart123.v@localhost/tt' #Conexion a mysql
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

#Routes
app.register_blueprint(home_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(signup_blueprint)
app.register_blueprint(dashboard_blueprint)
app.register_blueprint(users_blueprint)
