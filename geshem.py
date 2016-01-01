import redis
import requests

from datetime import datetime
from flask import Flask, jsonify, render_template
from os import environ, listdir
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
        imgs = sorted(maps_json[r].items(), key=lambda x: x[0], reverse=True)
        res = r[-3:]
        for ts, url in imgs:
            if not local:
                if redis.get('processed:{}:{}'.format(res, ts)):
                    continue
                else:
                    redis.set('processed:{}:{}'.format(res, ts), '1')
            dt = datetime.strptime(ts, '%Y:%m:%d:%H:%M').strftime('%Y%m%d_%H%M%S')
            image = requests.get('http://' + url)
            if not local:
                redis.set('latest_{}'.format(res), dt)
            else:
                dt = 'dev'
            filename = '{}_{}.png'.format(dt, res)
            with open(str(STATIC_DIR / 'img' / filename), 'wb+') as f:
                f.write(image.content)

@app.route('/imgs')
def get_imgs():
    img_files = sorted(
        filter(
            lambda f: f.endswith('.png'), listdir(str(STATIC_DIR / 'img'))
        ), reverse=True
    )
    img_140_files = list(filter(lambda f: f.endswith('140.png'), img_files))
    img_280_files = list(filter(lambda f: f.endswith('280.png'), img_files))
    imgs = {
        '140': img_140_files[:7],
        '280': img_280_files[:7]
    }
    return jsonify(imgs)

@app.route('/')
def home():
    return render_template('index.html')


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
