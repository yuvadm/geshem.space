import boto3
import json
import urllib3

from datetime import datetime, timedelta
from io import StringIO


def geshem_update():
    MAPS_JSON = 'http://map.govmap.gov.il/rainradar/radar.json'
    BUCKET = 'imgs.geshem.space'
    IMG_PREFIX = 'imgs/'

    http = urllib3.PoolManager()
    s3 = boto3.resource('s3')
    client = boto3.client('s3')
    maps_json = json.loads(http.request('GET', MAPS_JSON).data.decode('utf-8'))

    yesterday = (datetime.utcnow().date() - timedelta(days=1)).strftime('%Y%m%d')
    response = ''

    try:
        latest_imgs = client.list_objects_v2(Bucket=BUCKET, Prefix=IMG_PREFIX, StartAfter=IMG_PREFIX + yesterday)['Contents']
        latest_keys = [i['Key'] for i in latest_imgs]
    except KeyError:
        latest_keys = []

    for r in ['images140', 'images280']:
        imgs = sorted(maps_json[r].items(), key=lambda x: x[0], reverse=True)
        res = r[-3:]
        for ts, url in imgs:
            dt = datetime.strptime(ts, '%Y:%m:%d:%H:%M')
            d = dt.strftime('%Y%m%d')
            t = dt.strftime('%H%M')
            img = http.request('GET', url).data
            key = '{}{}/{}/{}.png'.format(IMG_PREFIX, d, t, res)

            if latest_keys:
                if key not in latest_keys:
                    client.put_object(Bucket=BUCKET, Key=key, Body=img, ContentType='image/png', CacheControl='public, max-age=31536000')
                    latest_keys.append(key)
                    response += 'Put {}, '.format(key)
                else:
                    response += 'Skipping {}, '.format(key)
            else:
                try:
                    _ = client.head_object(Bucket=BUCKET, Key=key)
                    response += 'Skipping {}, '.format(key)
                except:
                    client.put_object(Bucket=BUCKET, Key=key, Body=img)
                    latest_keys.append(key)
                    response += 'Put {}, '.format(key)

    if latest_keys:
        index = {}
        for r in ['140', '280']:
            keys = sorted(list(filter(lambda k: k.endswith('{}.png'.format(r)), latest_keys)))[-10:]
            index[r] = keys
        client.put_object(Bucket=BUCKET, Key='imgs.json', Body=json.dumps(index),
                          ContentType='application/json', CacheControl='public, max-age=60')

    return response


def update(event, context):

    res = geshem_update()

    body = {
        "message": "SUCCESS: \n" + res,
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response
