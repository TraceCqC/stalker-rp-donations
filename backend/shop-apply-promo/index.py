"""Проверка и применение промокода пользователем"""
import os
import json
import psycopg2

SCHEMA = 't_p38734199_stalker_rp_donations'
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')

    if not session_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'unauthorized'})}

    body = json.loads(event.get('body') or '{}')
    code = (body.get('code') or '').strip().upper()
    item_id = body.get('item_id')

    if not code:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'missing_code'})}

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        f"SELECT u.id FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    if not row:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'unauthorized'})}
    user_id = row[0]

    cur.execute(
        f"""SELECT id, type, value, category, max_uses, used_count, is_active, expires_at
            FROM {SCHEMA}.promocodes WHERE code = %s""",
        (code,)
    )
    promo = cur.fetchone()
    if not promo:
        cur.close(); conn.close()
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not_found'})}

    promo_id, promo_type, value, category, max_uses, used_count, is_active, expires_at = promo

    if not is_active:
        cur.close(); conn.close()
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'inactive'})}

    if expires_at:
        from datetime import datetime, timezone
        if datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'expired'})}

    if max_uses is not None and used_count >= max_uses:
        cur.close(); conn.close()
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'limit_reached'})}

    cur.execute(
        f"SELECT id FROM {SCHEMA}.promocode_uses WHERE promocode_id = %s AND user_id = %s",
        (promo_id, user_id)
    )
    if cur.fetchone():
        cur.close(); conn.close()
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'already_used'})}

    if promo_type == 'balance':
        cur.execute(
            f"UPDATE {SCHEMA}.users SET balance = balance + %s WHERE id = %s",
            (value, user_id)
        )
        cur.execute(
            f"INSERT INTO {SCHEMA}.promocode_uses (promocode_id, user_id) VALUES (%s, %s)",
            (promo_id, user_id)
        )
        cur.execute(
            f"UPDATE {SCHEMA}.promocodes SET used_count = used_count + 1 WHERE id = %s",
            (promo_id,)
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'type': 'balance',
            'value': float(value),
            'message': f'На ваш баланс зачислено {value} ₽'
        })}

    if promo_type == 'discount':
        item_category = None
        if item_id:
            cur.execute(
                f"SELECT category FROM {SCHEMA}.shop_items WHERE id = %s AND is_active = TRUE",
                (item_id,)
            )
            item_row = cur.fetchone()
            item_category = item_row[0] if item_row else None

        if category and item_category and category != item_category:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({
                'error': 'category_mismatch',
                'promo_category': category
            })}

        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'type': 'discount',
            'value': float(value),
            'promo_id': promo_id,
            'category': category,
            'message': f'Скидка {value}% применена'
        })}

    cur.close(); conn.close()
    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'unknown_type'})}
