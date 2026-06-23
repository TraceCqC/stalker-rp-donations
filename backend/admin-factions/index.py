"""Управление фракциями сайта. Публичный GET, CRUD только для администраторов."""
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


def row_to_faction(r) -> dict:
    return {
        'id': r[0], 'name': r[1], 'icon': r[2], 'color': r[3],
        'alignment': r[4], 'description': r[5],
        'is_paid': r[6], 'sort_order': r[7], 'is_active': r[8],
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
        show_all = params.get('all') == '1'
        where = '' if show_all else 'WHERE is_active = TRUE'
        cur.execute(
            f"SELECT id, name, icon, color, alignment, description, is_paid, sort_order, is_active FROM {SCHEMA}.factions {where} ORDER BY sort_order, id"
        )
        factions = [row_to_faction(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'factions': factions})}

    if not check_auth(cur, headers):
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'forbidden'})}

    if method == 'POST':
        cur.execute(
            f"""INSERT INTO {SCHEMA}.factions (name, icon, color, alignment, description, is_paid, sort_order, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, icon, color, alignment, description, is_paid, sort_order, is_active""",
            (body.get('name'), body.get('icon', 'Shield'), body.get('color', 'text-gray-400'),
             body.get('alignment', ''), body.get('description', ''),
             body.get('is_paid', False), body.get('sort_order', 0), body.get('is_active', True)),
        )
        item = row_to_faction(cur.fetchone())
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'item': item})}

    if method == 'PUT':
        fid = params.get('id')
        if not fid:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        cur.execute(
            f"""UPDATE {SCHEMA}.factions
                SET name=%s, icon=%s, color=%s, alignment=%s, description=%s, is_paid=%s, sort_order=%s, is_active=%s
                WHERE id=%s
                RETURNING id, name, icon, color, alignment, description, is_paid, sort_order, is_active""",
            (body.get('name'), body.get('icon', 'Shield'), body.get('color', 'text-gray-400'),
             body.get('alignment', ''), body.get('description', ''),
             body.get('is_paid', False), body.get('sort_order', 0), body.get('is_active', True), int(fid)),
        )
        row = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not_found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'item': row_to_faction(row)})}

    if method == 'DELETE':
        fid = params.get('id')
        if not fid:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        cur.execute(f"DELETE FROM {SCHEMA}.factions WHERE id = %s", (int(fid),))
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method_not_allowed'})}
