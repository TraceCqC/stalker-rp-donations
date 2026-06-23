"""Управление новостями сайта. Публичный GET, CRUD только для администраторов."""
import os
import json
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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


def check_auth(cur, headers: dict):
    session_id = headers.get('X-Session-Id', '').strip()
    if not session_id:
        return None
    steam_id = get_admin_steam_id(cur, session_id)
    if not steam_id or not is_admin(cur, steam_id):
        return None
    return steam_id


def row_to_news(r) -> dict:
    return {
        'id': r[0], 'ver': r[1], 'date': r[2],
        'title': r[3], 'tag': r[4], 'text': r[5],
        'sort_order': r[6], 'image_url': r[7],
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    body = json.loads(event.get('body') or '{}')
    params = event.get('queryStringParameters') or {}

    conn = get_db()
    cur = conn.cursor()

    if method == 'GET':
        cur.execute(
            f"SELECT id, ver, date, title, tag, text, sort_order, image_url FROM {SCHEMA}.news ORDER BY sort_order, id"
        )
        news = [row_to_news(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'news': news})}

    if not check_auth(cur, headers):
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'forbidden'})}

    if method == 'POST':
        cur.execute(
            f"""INSERT INTO {SCHEMA}.news (ver, date, title, tag, text, sort_order, image_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, ver, date, title, tag, text, sort_order, image_url""",
            (body.get('ver'), body.get('date'), body.get('title'),
             body.get('tag'), body.get('text'), body.get('sort_order', 0),
             body.get('image_url') or None),
        )
        item = row_to_news(cur.fetchone())
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'item': item})}

    if method == 'PUT':
        news_id = params.get('id')
        if not news_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        cur.execute(
            f"""UPDATE {SCHEMA}.news
                SET ver=%s, date=%s, title=%s, tag=%s, text=%s, sort_order=%s, image_url=%s
                WHERE id=%s
                RETURNING id, ver, date, title, tag, text, sort_order, image_url""",
            (body.get('ver'), body.get('date'), body.get('title'),
             body.get('tag'), body.get('text'), body.get('sort_order', 0),
             body.get('image_url') or None, int(news_id)),
        )
        row = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not_found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'item': row_to_news(row)})}

    if method == 'DELETE':
        news_id = params.get('id')
        if not news_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        cur.execute(f"DELETE FROM {SCHEMA}.news WHERE id = %s", (int(news_id),))
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method_not_allowed'})}
