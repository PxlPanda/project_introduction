import os

base_dir = "frontend"
directories = [
    "src/components",
    "src/pages",
    "src/services",
    "src/hooks",
    "src/utils",
    "src/context",
    "src/assets",
    "src/theme"
]

for dir_path in directories:
    full_path = os.path.join(base_dir, dir_path)
    os.makedirs(full_path, exist_ok=True)
    print(f"Created directory: {full_path}")
