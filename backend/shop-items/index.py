"""Возвращает список товаров магазина по категориям. v2"""
import os
import json
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p38734199_stalker_rp_donations'


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT id, category, name, description, price, badge, is_popular, sort_order, image_url
            FROM {SCHEMA}.shop_items
            WHERE is_active = TRUE
            ORDER BY category, sort_order"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = [
        {
            'id': r[0],
            'category': r[1],
            'name': r[2],
            'description': r[3],
            'price': float(r[4]),
            'badge': r[5],
            'is_popular': r[6],
            'sort_order': r[7],
            'image_url': r[8],
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'items': items}),
    }