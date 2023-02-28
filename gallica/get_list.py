import urllib.request, json
import argparse

def run(start):
    current = start
    _continue = True
    ls = []
    while _continue:
        try:
            with urllib.request.urlopen(f"https://gallica.bnf.fr/services/engine/search/ajax/sru?operation=searchRetrieve&version=1.2&startRecord={current}&maximumRecords=150&page=1&query=gallicapublication_date%3E%3D%221500%22%20and%20gallicapublication_date%3C%3D%221930%22%29%20and%20%28ocr.quality%20all%20%22Texte%20disponible%22%29&filter=dc.language%20all%20%22fre%22%20") as url:
                data = json.loads(url.read().decode())
                for x in data['fragment']['contenu']['SearchResultsFragment']['contenu']['ResultsFragment']['contenu']:
                    ls.append(x['parameters']['gallicarte']['parameters']['arkId'])
                print(len(ls), ls[-1])
                with open('gallica.txt', 'w') as f:
                    f.write('\n'.join(ls))
                    f.write('\n')
        except Exception as e:
            print(e)
            _continue = False

        current = start + len(ls)

parser = argparse.ArgumentParser(
                    prog = 'Gallica get list of books',
                    description = 'Retrieve the list of all French books in the Odeuropa time-frame')
parser.add_argument('-s','--start', type=int, default=0, help='Record n. from which the crawling should start')     
args = parser.parse_args()

run(args.start)

