import jwt#type: ignore

encoded = jwt.encode({}, private_key, algorithm = ...)

decoded = jwt.decode({}, public_key, algorithm = ...)