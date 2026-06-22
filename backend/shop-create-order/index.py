"""Создаёт заказ и возвращает ссылку для оплаты через Robokassa. v2"""
import os
import json
import hashlib
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


def get_user_by_session(cur, session_id: str):
    cur.execute(
        f"""SELECT u.id FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,),
    )
    row = cur.fetchone()
    return row[0] if row else None


def make_robokassa_url(inv_id: int, amount: float, description: str) -> str:
    login = os.environ['ROBOKASSA_LOGIN']
    pass1 = os.environ['ROBOKASSA_PASS1']
    amount_str = f"{amount:.2f}"
    sig = hashlib.md5(f"{login}:{amount_str}:{inv_id}:{pass1}".encode()).hexdigest()
    desc_enc = description.replace(' ', '+')
    return (
        f"https://auth.robokassa.ru/Merchant/Index.aspx"
        f"?MerchantLogin={login}"
        f"&OutSum={amount_str}"
        f"&InvId={inv_id}"
        f"&Description={desc_enc}"
        f"&SignatureValue={sig}"
        f"&Culture=ru"
        f"&Encoding=utf-8"
    )


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id', '').strip() or None

    if not session_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'not_authorized'})}

    body = json.loads(event.get('body') or '{}')
    item_id = body.get('item_id')
    if not item_id:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'item_id required'})}

    conn = get_db()
    cur = conn.cursor()

    user_id = get_user_by_session(cur, session_id)
    if not user_id:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'session_expired'})}

    cur.execute(
        f"SELECT id, name, price FROM {SCHEMA}.shop_items WHERE id = %s AND is_active = TRUE",
        (item_id,),
    )
    item = cur.fetchone()
    if not item:
        cur.close(); conn.close()
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'item_not_found'})}

    item_id_db, item_name, price = item

    cur.execute(
        f"""INSERT INTO {SCHEMA}.orders (user_id, item_id, amount, status)
            VALUES (%s, %s, %s, 'pending') RETURNING id""",
        (user_id, item_id_db, price),
    )
    order_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    pay_url = make_robokassa_url(order_id, float(price), f"NightZone: {item_name}")

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'order_id': order_id, 'pay_url': pay_url}),
    }