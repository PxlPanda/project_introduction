from hashlib import sha256
import os

m = sha256()
n = sha256()
n.update(b"1")
m.update(b"Nobody inspects")
m.update(b" the spammish repetition")
print(m.hexdigest())
print(n.hexdigest())
print("-------------------------")
print(os.getenv("SALT").encode())