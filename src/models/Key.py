import os


class Key:
    key = os.getenv("PASSWORD_KEY", "MiContraseña")

    def __init__(self, key):
        self.key = key
