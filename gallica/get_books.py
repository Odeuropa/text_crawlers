import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import yaml
import os
import time

os.makedirs('out', exist_ok=True)

with open('gallica.txt', 'r') as f:
    ids = [r.strip() for r in f.readlines()]

for x in tqdm(ids):
    if os.path.exists(f'out/{x}.txt'):
        continue

    uri = f"https://gallica.bnf.fr/ark:/12148/{x}.texteBrut"
    try:
        res = requests.get(uri)
        if res.status_code != 200:
            print('Error. Status code:', res.status_code)
            time.sleep(3)
            continue
        else:
            print('OK')
    except requests.exceptions.ConnectionError as err:
        print(err) # continue even if there is a error
        continue

    html_text = res.text
    soup = BeautifulSoup(html_text, 'html.parser')

    metadata = {}
    text = []
    metadata_started = False

    for p in soup.find_all('p'):
        if 'Notice complète' in p.text:
            metadata_started = True
            continue
        elif 'Le texte affiché peut comporter' in p.text:
            metadata_started = False
            continue

        if metadata_started:
            k, v = p.text.split(' : ', maxsplit=1)
            metadata[k] = v
        elif len(metadata.keys()) > 0:
            text.append(p.text)
    
    with open(f'out/{x}.yaml', 'w') as f:
        f.write(yaml.dump(metadata))
    with open(f'out/{x}.txt', 'w') as f:
        f.write('\n'.join(text))
