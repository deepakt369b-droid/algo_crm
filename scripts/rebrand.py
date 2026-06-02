import os

search_replace_pairs = [
    ("Flowline Pro", "Flowline Pro"),
    ("flowlinepro", "flowlinepro"),
    ("Flowline Pro", "Flowline Pro")
]

directories_to_search = [
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/locales",
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/components",
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/app",
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/public",
]

files_to_search = [
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/README.md",
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/.env",
    "c:/Users/SAHARA/Downloads/nextcrm-app-main/nextcrm-app-main/package.json"
]

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in search_replace_pairs:
            new_content = new_content.replace(old, new)
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
    except Exception as e:
        pass # Some files might not be utf-8 or readable

for filepath in files_to_search:
    process_file(filepath)

for directory in directories_to_search:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.json', '.ts', '.tsx', '.md', '.env', '.mdx')):
                process_file(os.path.join(root, file))

print("Rebranding completed.")
