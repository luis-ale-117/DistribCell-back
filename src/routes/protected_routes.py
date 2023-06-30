from functools import wraps
from flask import redirect, session


class protected_routes:
    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "user" not in session:
                return redirect("/login")
            return f(*args, **kwargs)

        return decorated_function
