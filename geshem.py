import redis
import requests

from datetime import datetime
from flask import Flask, render_template
from os import environ
from pathlib import Path
from pytz import utc, timezone
from redis.exceptions import ConnectionError

MAPS_JSON = 'http://map.govmap.gov.il/rainradar/radar.json'
STATIC_DIR = Path(__file__).resolve().parents[0] / 'static'

app = Flask(__name__)
redis = redis.from_url(environ.get('REDIS_URL', 'redis://localhost'))

def fetch_latest_images(local=False):
    maps_json = requests.get(MAPS_JSON).json()
    for r in ['images140', 'images280']:
        imgs = sorted(maps_json[r].items(), key=lambda x: x[0], reverse=True)[:1]  # only take latest
        res = r[-3:]
        for ts, url in imgs:
            dt = datetime.strptime(ts, '%Y:%m:%d:%H:%M').strftime('%Y%m%d_%H%M%S')
            image = requests.get('http://' + url)
            if not local:
                redis.set('latest_{}'.format(res), dt)
            else:
                dt = 'dev'
            filename = '{}_{}.png'.format(dt, res)
            with open(str(STATIC_DIR / filename), 'wb+') as f:
                f.write(image.content)

@app.route('/')
def home():
    try:
        latests = redis.pipeline().get('latest_140').get('latest_280').execute()
        latest_140, latest_280 = map(lambda x: x.decode(), latests)
        ts = utc.localize(datetime.strptime(latest_280, '%Y%m%d_%H%M%S')).astimezone(timezone('Asia/Jerusalem'))
    except ConnectionError:
        latest_140, latest_280 = 'dev', 'dev'
        ts = datetime.now()
    return render_template('index.html', ts=ts, latest_140=latest_140, latest_280=latest_280)

@app.after_request
def update_images(response):
    # poor man's background task
    try:
        if not redis.get('fresh'):
            redis.setex('fresh', 'yes', 60)
            fetch_latest_images()
    except ConnectionError as e:
        if app.debug:
            fetch_latest_images(local=True)
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
