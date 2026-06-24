"""CRUD промокодов — только для администраторов"""
import os
import json
import psycopg2

SCHEMA = 't_p38734199_stalker_rp_donations'
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def check_admin(cur, session_id):
    cur.execute(
        f"SELECT u.is_admin FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    return row and row[0]


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    conn = get_db()
    cur = conn.cursor()

    if method == 'GET':
        cur.execute(
            f"""SELECT id, code, type, value, category, max_uses, used_count, is_active, expires_at, created_at
                FROM {SCHEMA}.promocodes ORDER BY created_at DESC"""
        )
        rows = cur.fetchall()
        promos = [
            {
                'id': r[0], 'code': r[1], 'type': r[2], 'value': float(r[3]),
                'category': r[4], 'max_uses': r[5], 'used_count': r[6],
                'is_active': r[7], 'expires_at': r[8].isoformat() if r[8] else None,
                'created_at': r[9].isoformat()
            }
            for r in rows
        ]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'promocodes': promos})}

    if not check_admin(cur, session_id):
        cur.close()
        conn.close()
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'forbidden'})}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        code = body.get('code', '').strip().upper()
        promo_type = body.get('type')
        value = body.get('value')
        category = body.get('category') or None
        max_uses = body.get('max_uses') or None
        expires_at = body.get('expires_at') or None

        if not code or promo_type not in ('balance', 'discount') or not value:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'invalid_params'})}

        cur.execute(
            f"""INSERT INTO {SCHEMA}.promocodes (code, type, value, category, max_uses, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (code, promo_type, value, category, max_uses, expires_at)
        )
        promo_id = cur.fetchone()[0]
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'id': promo_id, 'code': code})}

    if method == 'PUT':
        promo_id = params.get('id')
        if not promo_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'missing_id'})}

        fields = []
        values = []
        for field in ('code', 'type', 'value', 'category', 'max_uses', 'expires_at', 'is_active'):
            if field in body:
                val = body[field]
                if field == 'code' and val:
                    val = val.strip().upper()
                fields.append(f"{field} = %s")
                values.append(val if val != '' else None)

        if not fields:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'no_fields'})}

        values.append(promo_id)
        cur.execute(f"UPDATE {SCHEMA}.promocodes SET {', '.join(fields)} WHERE id = %s", values)
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    if method == 'DELETE':
        promo_id = params.get('id')
        if not promo_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'missing_id'})}
        cur.execute(f"UPDATE {SCHEMA}.promocodes SET is_active = FALSE WHERE id = %s", (promo_id,))
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    cur.close(); conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method_not_allowed'})}
