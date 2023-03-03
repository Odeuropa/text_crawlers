import requests
import json
import argparse


def run(start, include_smell_words=False):
    current = start
    _continue = True
    ls = []

    headers = {'content-type': 'application/json'}


    if include_smell_words:
        with open('../smell_word/fr.txt') as f:
            lines = [x.replace('\n', '') for x in f.readlines()]
            smell_words = ' '.join(lines).replace(', ', ' ')

    while _continue:
        try:
            query = {
                'operation': 'searchRetrieve',
                'version': 1.2,
                'startRecord': current,
                'maximumRecords': 150,
                'page': 1,
                'query': '(gallicapublication_date>="1500" and gallicapublication_date<="1930") and (ocr.quality all "Texte disponible") and (subgallica any "%s")' % smell_words,
                'filter' :'dc.language all "fre" and ocr.quality all "Texte disponible"'
            }
            req = requests.get('https://gallica.bnf.fr/services/engine/search/ajax/sru',
                         params=query,
                          headers=headers)
            # print(req.url)

            data = req.json()
            for x in data['fragment']['contenu']['SearchResultsFragment']['contenu']['ResultsFragment']['contenu']:
                ls.append(x['parameters']['gallicarte']
                            ['parameters']['arkId'])
            print(len(ls), ls[-1])
            with open('gallica_sw.txt', 'w') as f:
                f.write('\n'.join(ls))
                f.write('\n')
        except Exception as e:
            print(e)
            _continue = False

        current = start + len(ls)


parser = argparse.ArgumentParser(
    prog='Gallica get list of books',
    description='Retrieve the list of all French books in the Odeuropa time-frame')
parser.add_argument('-s', '--start', type=int, default=0,
                    help='Record n. from which the crawling should start')
parser.add_argument('-w', '--smell_words', action='store_true',
                    help='Consider smell words for the search')
args = parser.parse_args()

run(args.start, args.smell_words)
