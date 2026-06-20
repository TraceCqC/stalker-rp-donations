"""Выход из аккаунта — инвалидирует сессию и сбрасывает cookie"""
import os
import json
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p38734199_stalker_rp_donations'


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def parse_session(cookie_header: str) -> str | None:
    for part in cookie_header.split(';'):
        part = part.strip()
        if part.startswith('session_id='):
            return part[len('session_id='):]
    return None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    cookie_header = headers.get('X-Cookie', '') or headers.get('cookie', '')
    session_id = parse_session(cookie_header)

    if session_id:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
        conn.commit()
        cur.close()
        conn.close()

    return {
        'statusCode': 200,
        'headers': {**CORS, 'X-Set-Cookie': 'session_id=; Path=/; Max-Age=0'},
        'body': json.dumps({'ok': True}),
    }
