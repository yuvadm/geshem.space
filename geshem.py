import requests

from flask import Flask, render_template
from pathlib import Path

MAPS_JSON = 'http://map.govmap.gov.il/rainradar/radar.json'
STATIC_DIR = Path(__file__).resolve().parents[0] / 'static'

app = Flask(__name__)


def fetch_latest_images():
    maps_json = requests.get(MAPS_JSON).json()
    for r in ['images140', 'images280']:
        imgs = sorted(maps_json[r].items(), key=lambda x: x[0], reverse=True)[:1]  # only take latest
        for _ts, url in imgs:
            image = requests.get('http://' + url)
            filename = r[-3:] + '.png'
            with open(str(STATIC_DIR / filename), 'wb+') as f:
                f.write(image.content)

@app.route('/')
def home():
    fetch_latest_images()
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
