# Geshem

A rain radar clone running on Mapbox GL, see it live at: [http://geshem.space](http://geshem.space)

## Dev

 - Python 3.5
 - Redis (optional, recommended)

Setup a virtualenv:

```bash
$ mkvirtualenv -p `which python3` geshem
$ pip install -r requirements.txt
```

Then just run:

```bash
$ python geshem.py
```

Make sure you have a stupid `redis-server` running on localhost to enjoy some sane caching.
