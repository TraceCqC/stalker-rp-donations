"""Возвращает текущего авторизованного пользователя и его покупки по сессии"""
import os
import json
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p38734199_stalker_rp_donations'


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id', '').strip() or None

    if not session_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'not_authorized'})}

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        f"""SELECT u.id, u.steam_id, u.username, u.avatar_url, u.created_at, u.is_admin
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,),
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'session_expired'})}

    user_id, steam_id, username, avatar_url, created_at, is_admin = row

    cur.execute(
        f"""SELECT id, category, item_name, price, status, created_at
            FROM {SCHEMA}.purchases
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 50""",
        (user_id,),
    )
    purchases = [
        {
            'id': r[0],
            'category': r[1],
            'item_name': r[2],
            'price': float(r[3]),
            'status': r[4],
            'created_at': r[5].isoformat(),
        }
        for r in cur.fetchall()
    ]

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'user': {
                'id': user_id,
                'steam_id': steam_id,
                'username': username,
                'avatar_url': avatar_url,
                'member_since': created_at.isoformat(),
                'is_admin': is_admin,
            },
            'purchases': purchases,
        }),
    }