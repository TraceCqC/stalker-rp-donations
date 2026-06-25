"""CRUD управление категориями магазина (только для администраторов)"""
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


def check_admin(cur, session_id):
    cur.execute(
        f"""SELECT u.is_admin FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,),
    )
    row = cur.fetchone()
    return row and row[0]


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id', '').strip() or None
    method = event.get('httpMethod', 'GET')

    conn = get_db()
    cur = conn.cursor()

    if method != 'GET':
        if not session_id or not check_admin(cur, session_id):
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'forbidden'})}

    if method == 'GET':
        cur.execute(
            f"SELECT id, key, label, icon, sort_order, is_active FROM {SCHEMA}.categories ORDER BY sort_order, id"
        )
        categories = [
            {'id': r[0], 'key': r[1], 'label': r[2], 'icon': r[3], 'sort_order': r[4], 'is_active': r[5]}
            for r in cur.fetchall()
        ]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(categories)}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        key = body.get('key', '').strip()
        label = body.get('label', '').strip()
        icon = body.get('icon', 'Package').strip()
        sort_order = int(body.get('sort_order', 0))
        if not key or not label:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'key and label required'})}
        cur.execute(
            f"""INSERT INTO {SCHEMA}.categories (key, label, icon, sort_order, is_active)
                VALUES (%s, %s, %s, %s, TRUE) RETURNING id""",
            (key, label, icon, sort_order),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'id': new_id, 'key': key, 'label': label, 'icon': icon, 'sort_order': sort_order, 'is_active': True})}

    if method == 'PUT':
        cat_id = int(body.get('id', 0))
        label = body.get('label', '').strip()
        icon = body.get('icon', 'Package').strip()
        sort_order = int(body.get('sort_order', 0))
        is_active = bool(body.get('is_active', True))
        if not cat_id or not label:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id and label required'})}
        cur.execute(
            f"""UPDATE {SCHEMA}.categories SET label=%s, icon=%s, sort_order=%s, is_active=%s WHERE id=%s""",
            (label, icon, sort_order, is_active, cat_id),
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    if method == 'DELETE':
        cat_id = int(body.get('id', 0))
        if not cat_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
        cur.execute(f"DELETE FROM {SCHEMA}.categories WHERE id=%s", (cat_id,))
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
