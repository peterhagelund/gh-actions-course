from os import getenv
from sys import exit
from requests import get
from time import sleep

def main():
  url = getenv("INPUT_URL")
  max_attempts = int(getenv("INPUT_MAX_ATTEMPTS"))
  delay = float(getenv("INPUT_DELAY"))
  print(f"url = {url}")
  print(f"max_attempts = {max_attempts}")
  print(f"delay = {delay}")
  print(f"Pinging URL {url}...")
  try:
    for attempt in range(max_attempts):
      print(f"Attempt number {attempt+1}...")
      response = get(url)
      status_code = response.status_code
      print(f"Status code is {status_code}")
      if  status_code == 200:
        print("Success")
        exit(0)
      print("Sleeping...")
      sleep(delay)
    print("Unable to ping URL successfully")
  except Exception as e:
    print(f"Exception during ping: {e}")
  exit(1)


if __name__ == '__main__':
  main()
