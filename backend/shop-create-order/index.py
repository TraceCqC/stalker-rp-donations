"""Создаёт заказ и возвращает ссылку для оплаты через Robokassa. v3 (промокоды)"""
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


def apply_promo(cur, code: str, user_id: int, item_category: str):
    """Проверяет и применяет промокод скидки. Возвращает (promo_id, discount_pct) или (None, 0)"""
    if not code:
        return None, 0

    cur.execute(
        f"""SELECT id, type, value, category, max_uses, used_count, is_active, expires_at
            FROM {SCHEMA}.promocodes WHERE code = %s""",
        (code.strip().upper(),)
    )
    promo = cur.fetchone()
    if not promo:
        return None, 0

    promo_id, promo_type, value, category, max_uses, used_count, is_active, expires_at = promo

    if not is_active or promo_type != 'discount':
        return None, 0

    if expires_at:
        from datetime import datetime, timezone
        if datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
            return None, 0

    if max_uses is not None and used_count >= max_uses:
        return None, 0

    cur.execute(
        f"SELECT id FROM {SCHEMA}.promocode_uses WHERE promocode_id = %s AND user_id = %s",
        (promo_id, user_id)
    )
    if cur.fetchone():
        return None, 0

    if category and category != item_category:
        return None, 0

    return promo_id, float(value)


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id', '').strip() or headers.get('x-session-id', '').strip() or None

    if not session_id:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'not_authorized'})}

    body = json.loads(event.get('body') or '{}')
    item_id = body.get('item_id')
    promo_code = body.get('promo_code', '')

    if not item_id:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'item_id required'})}

    conn = get_db()
    cur = conn.cursor()

    user_id = get_user_by_session(cur, session_id)
    if not user_id:
        cur.close(); conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'session_expired'})}

    cur.execute(
        f"SELECT id, name, price, category FROM {SCHEMA}.shop_items WHERE id = %s AND is_active = TRUE",
        (item_id,),
    )
    item = cur.fetchone()
    if not item:
        cur.close(); conn.close()
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'item_not_found'})}

    item_id_db, item_name, price, item_category = item
    price = float(price)

    promo_id, discount_pct = apply_promo(cur, promo_code, user_id, item_category)
    discount = round(price * discount_pct / 100, 2) if discount_pct else 0
    final_price = max(1.0, round(price - discount, 2))

    cur.execute(
        f"""INSERT INTO {SCHEMA}.orders (user_id, item_id, amount, status, promo_id, discount)
            VALUES (%s, %s, %s, 'pending', %s, %s) RETURNING id""",
        (user_id, item_id_db, final_price, promo_id, discount),
    )
    order_id = cur.fetchone()[0]

    if promo_id:
        cur.execute(
            f"INSERT INTO {SCHEMA}.promocode_uses (promocode_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (promo_id, user_id)
        )
        cur.execute(
            f"UPDATE {SCHEMA}.promocodes SET used_count = used_count + 1 WHERE id = %s",
            (promo_id,)
        )

    conn.commit()
    cur.close()
    conn.close()

    pay_url = make_robokassa_url(order_id, final_price, f"NightZone: {item_name}")

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'order_id': order_id,
            'pay_url': pay_url,
            'original_price': price,
            'discount': discount,
            'final_price': final_price,
        }),
    }
