# Raindar Mapbox

A rain radar clone for Mapbox GL, see it live at: [http://geshem.space](http://geshem.space)

## Dev

 - Python 3.5
 - Redis

Setup a virtualenv:

```bash
$ mkvirtualenv -p `which python3` geshem
$ pip install -r requirements.txt
```

Make sure you have a stupid `redis-server` running on localhost, then just run:

```bash
$ python geshem.py
```
