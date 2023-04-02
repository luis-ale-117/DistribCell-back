from utils.db import db

class Proyects(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(50),nullable = False)
    #password = db.Column(db.String(50),nullable = False)
    #name = db.Column(db.String(50),nullable = False)
    #lastname = db.Column(db.String(50),nullable = False)
    #photo = db.Column(db.String(100),nullable = True)
    proyect = db.Column(db.String(1000), nullable = False)

    def __init__(self, email, proyect):
        self.email = email
        self.proyect = proyect