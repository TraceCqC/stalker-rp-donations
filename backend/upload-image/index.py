"""Загрузка изображений товаров в S3. Только для администраторов."""
import os
import json
import base64
import uuid
import boto3
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p38734199_stalker_rp_donations'


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_admin_steam_id(cur, session_id: str):
    cur.execute(
        f"""SELECT u.steam_id FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,),
    )
    row = cur.fetchone()
    return row[0] if row else None


def is_admin(cur, steam_id: str) -> bool:
    cur.execute(f"SELECT 1 FROM {SCHEMA}.admins WHERE steam_id = %s", (steam_id,))
    return cur.fetchone() is not None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id', '').strip()

    conn = get_db()
    cur = conn.cursor()
    steam_id = get_admin_steam_id(cur, session_id) if session_id else None
    if not steam_id or not is_admin(cur, steam_id):
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'forbidden'})}
    cur.close(); conn.close()

    body = json.loads(event.get('body') or '{}')
    data_b64 = body.get('data', '')
    content_type = body.get('content_type', 'image/jpeg')

    image_data = base64.b64decode(data_b64)

    ext = 'jpg'
    if 'png' in content_type:
        ext = 'png'
    elif 'webp' in content_type:
        ext = 'webp'
    elif 'gif' in content_type:
        ext = 'gif'

    key = f'shop-items/{uuid.uuid4()}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=image_data, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'url': cdn_url})}
