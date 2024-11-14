from User_aut import auth
#io cpu bound

def create_token(id):
    auth.Token.give_token(id = id)
def check_token(request, authorization_header):
    auth.Token.check_access_token(request = request, authorization_header = authorization_header)