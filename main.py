from presentations.app import app
import uvicorn


def main():
    uvicorn.run(app)

if __name__ == "main":
    main()