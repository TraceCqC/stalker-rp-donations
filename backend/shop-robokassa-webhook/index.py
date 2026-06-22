"""Вебхук Robokassa ResultURL — подтверждает оплату и активирует заказ"""
import os
import json
import hashlib
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/plain',
}

SCHEMA = 't_p38734199_stalker_rp_donations'


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def parse_body(event: dict) -> dict:
    body = event.get('body') or ''
    result = {}
    for pair in body.split('&'):
        if '=' in pair:
            k, v = pair.split('=', 1)
            result[k] = v
    return result


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = parse_body(event)
    if not params:
        params = event.get('queryStringParameters') or {}

    out_sum = params.get('OutSum', '')
    inv_id = params.get('InvId', '')
    sig_received = params.get('SignatureValue', '').lower()

    pass2 = os.environ['ROBOKASSA_PASS2']
    sig_expected = hashlib.md5(f"{out_sum}:{inv_id}:{pass2}".encode()).hexdigest().lower()

    if sig_received != sig_expected:
        return {'statusCode': 400, 'headers': CORS, 'body': 'bad sign'}

    order_id = int(inv_id)
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        f"""UPDATE {SCHEMA}.orders
            SET status = 'paid', paid_at = NOW(), robokassa_inv_id = %s
            WHERE id = %s AND status = 'pending'
            RETURNING user_id, item_id""",
        (order_id, order_id),
    )
    row = cur.fetchone()
    if row:
        user_id, item_id = row
        cur.execute(
            f"""INSERT INTO {SCHEMA}.purchases (user_id, category, item_name, price, status)
                SELECT %s, s.category, s.name, s.price, 'completed'
                FROM {SCHEMA}.shop_items s WHERE s.id = %s""",
            (user_id, item_id),
        )
    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': CORS, 'body': f'OK{inv_id}'}
