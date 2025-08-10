from os import environ
def main():
  print("Hello, World!")
  gh_env = {n: v for (n, v) in environ if n.startswith("GITHUB_")}
  for n, v in gh_env.items():
    print(f"{n} = {v}")

if __name__ == '__main__':
  main()
