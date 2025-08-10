from os import getenv
from sys import exit
from requests import get
from time import sleep
from typing import Any

def is_url_reachable(url: str, max_attempts: int, delay: float) -> bool:
  print(f"Pinging URL {url}...")
  try:
    for attempt in range(max_attempts):
      print(f"Attempt number {attempt+1}...")
      response = get(url)
      status_code = response.status_code
      print(f"Status code is {status_code}")
      if status_code == 200:
        print("Success")
        return True
      print("Sleeping...")
      sleep(delay)
    print("Unable to ping URL successfully")
  except Exception as e:
    print(f"Exception during ping: {e}")
  return False

def set_output(file_path: str, key: str, value: Any):
  with open(file_path, "a") as f:
    print(f"{key}={value}", file=f)

def run():
  url = getenv("INPUT_URL")
  max_attempts = int(getenv("INPUT_MAX_ATTEMPTS"))
  delay = float(getenv("INPUT_DELAY"))
  file_path = getenv("GITHUB_OUTPUT")
  print(f"url = {url}")
  print(f"max_attempts = {max_attempts}")
  print(f"delay = {delay}")
  reachable = is_url_reachable(url, max_attempts, delay)
  set_output(file_path, "url-reachable", reachable)
  if not reachable:
    raise Exception(f"URL {url} not reachable")


if __name__ == '__main__':
  run()
