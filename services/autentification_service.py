from User_aut import auth
#io cpu bound

class Autent:
    def __init__(self):
        ...
    async def create_token(id):
        return await auth.Token.give_token(id = id)
    async def check_token(request, authorization_header):
        return await auth.Token.check_access_token(request = request, authorization_header = authorization_header)