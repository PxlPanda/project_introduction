from dotenv import load_dotenv#type: ignore
import os
import requests

load_dotenv()

class NWTimes_API():
    key = os.getenv("NEW_YORK_TIMES_KEY")
    def __init__(self):
        ...
    def get_bestsellers(self) -> list[str]:
        response = requests.get("/lists/names.json", json = True)
        return response
    def get_reviews(self, author: str):
        params = {"author" : author, "api-key" : self.key}
        url = "https://api.nytimes.com/svc/books/v3/reviews.json"
        response = requests.get(url = url, params = params)
        # print (response.json())
        reviews = str()
        for review in response.json()["results"]:
            reviews += str(review["url"]) 
            reviews += "\n"
        return reviews
        #return response.json()["results"]