# Gallica crawler

Involved languages: FR (but potentially any language)

URI: https://api.bnf.fr/fr/api-document-de-gallica

## Crawlers

1. Install the dependencies

    pip install -r requirements.txt

2. Download the list of Gallica IDs for the chosen period

    phyton get_list.py [--start STARTING_RECORD]

  The output is saved on gallica.txt

3. For each ID in the list, download the text (.txt) and metadata (.yaml) in the `out` folder.

  python get_book.py