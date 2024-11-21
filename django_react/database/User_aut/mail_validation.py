import smtplib
import os
from email.mime.text import MIMEText

server_email = os.getenv("SERVER_EMAIL")
server_email_password = os.getenv("SERVER_EMAIL_PASSWORD")


def send_email(message):
    sender = server_email
    password = server_email_password
    
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    
    try:
        server.login(sender, password)
        msg = MIMEText(message)
        print(sender, password)
        #msg["Subject"] = "Подтверждение регистрации на сайте МИСИС физкультура"
        server.sendmail(sender, sender, msg.as_string())
        
        return "Message sent successfully"
    except Exception as ex:
        return f"{ex}, check your login and password please!"
    
print(server_email)
print(server_email_password)
   
def main():
    message = "Try to make this shit work"
    print(send_email(message = message))
    
if __name__ == "__main__":
    main()