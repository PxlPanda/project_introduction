import smtplib
import os
from email.mime.text import MIMEText
from random import randrange
import asyncio
from dotenv import load_dotenv#type: ignore


load_dotenv()


server_email = os.getenv("SERVER_EMAIL")
server_email_password = os.getenv("SERVER_EMAIL_PASSWORD")


async def send_email(getter):
    message = randrange(100000, 999999)
    sender = server_email
    password = server_email_password
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    try:
        server.login(sender, password)
        msg = str(message)
        server.sendmail(sender, getter, msg)

        return message
    except Exception as ex:
        return f"{ex}, check your login and password please!"
    finally:
        server.quit()