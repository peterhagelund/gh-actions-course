from os import getenv
def main():
  url = getenv("INPUT_URL")
  max_attempts = getenv("INPUT_MAX-ATTEMPTS")
  delay = getenv("INPUT_DELAY")
  print(f"url = {url}")
  print(f"max_attempts = {max_attempts}")
  print(f"delay = {delay}")


if __name__ == '__main__':
  main()
