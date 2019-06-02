import boto3
import json
import math
import re
import urllib3

from datetime import datetime, timedelta
from io import StringIO
from json.decoder import JSONDecodeError

def challenge_res(c):
    cs = str(c)
    chrs = list(cs)
    ints = list(map(int, chrs))
    ld = ints[-1]
    ints = sorted(ints)
    md = ints[0]
    sv1 = (2 * ints[2]) + ints[1]
    sv2 = int(str(2 * ints[2]) + str(ints[1]))
    mp = (ints[0] + 2) ** ints[1]
    x = (int(c) * 3) + sv1
    y = math.cos(math.pi * sv2)
    ans = x * y
    ans -= mp
    ans += (md - ld)
    ans = str(int(ans)) + str(sv2)
    return ans

def scrape_fallback(res, http, url):
    c = re.search(r'Challenge=(\d+)', res)[1]
    cid = re.search(r'ChallengeId=(\d+)', res)[1]
    cr = challenge_res(c)

    headers = {
        'X-AA-Challenge': c,
        'X-AA-Challenge-ID': cid,
        'X-AA-Challenge-Result': cr
    }

    res = http.request('GET', url, headers=headers)
    ck = res.headers['Set-Cookie']
    headers['Cookie'] = ck
    res = http.request('GET', url, headers=headers)

    resdat = res.data.decode('utf-8')
    maps_json = json.loads(resdat)
    return maps_json

def geshem_update():
    MAPS_JSON = 'http://map.govmap.gov.il/rainradar/radar.json'
    BUCKET = 'imgs.geshem.space'
    IMG_PREFIX = 'imgs/'

    http = urllib3.PoolManager()
    s3 = boto3.resource('s3')
    client = boto3.client('s3')

    res = http.request('GET', MAPS_JSON)
    resdat = res.data.decode('utf-8')

    try:
        maps_json = json.loads(resdat)
    except JSONDecodeError:
        maps_json = scrape_fallback(resdat, http, MAPS_JSON)

    yesterday = (datetime.utcnow().date() - timedelta(days=1)).strftime('%Y%m%d')
    response = ''

    try:
        latest_imgs = client.list_objects_v2(Bucket=BUCKET, Prefix=IMG_PREFIX, StartAfter=IMG_PREFIX + yesterday)['Contents']
        latest_keys = [i['Key'] for i in latest_imgs]
    except KeyError:
        latest_keys = []

    for r in ['images280']:
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
        for r in ['280']:
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
