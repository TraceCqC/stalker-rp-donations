"""Обработка ответа от Steam OpenID, создание сессии и редирект в личный кабинет"""
import os
import re
import secrets
import urllib.request
import urllib.parse
import json
import psycopg2


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

SCHEMA = 't_p38734199_stalker_rp_donations'


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def verify_openid(params: dict) -> str | None:
    """Верифицирует ответ OpenID у Steam, возвращает steam_id или None"""
    check_params = {k: v for k, v in params.items()}
    check_params['openid.mode'] = 'check_authentication'

    data = urllib.parse.urlencode(check_params).encode()
    req = urllib.request.Request(
        'https://steamcommunity.com/openid/login',
        data=data,
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode()

    if 'is_valid:true' not in body:
        return None

    claimed_id = params.get('openid.claimed_id', '')
    match = re.search(r'https://steamcommunity\.com/openid/id/(\d+)', claimed_id)
    return match.group(1) if match else None


def get_steam_profile(steam_id: str) -> dict:
    """Получает никнейм и аватар из Steam API"""
    api_key = os.environ.get('STEAM_API_KEY', '')
    if not api_key:
        return {'username': f'Сталкер_{steam_id[-4:]}', 'avatar_url': ''}

    url = (
        f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
        f"?key={api_key}&steamids={steam_id}"
    )
    with urllib.request.urlopen(url, timeout=10) as resp:
        data = json.loads(resp.read())

    players = data.get('response', {}).get('players', [])
    if not players:
        return {'username': f'Сталкер_{steam_id[-4:]}', 'avatar_url': ''}

    p = players[0]
    return {
        'username': p.get('personaname', f'Сталкер_{steam_id[-4:]}'),
        'avatar_url': p.get('avatarfull', ''),
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    site_url = os.environ.get('SITE_URL', 'https://nightzone.poehali.dev')
    params = event.get('queryStringParameters') or {}

    if not params.get('openid.mode'):
        return {
            'statusCode': 302,
            'headers': {**CORS, 'Location': f'{site_url}/?auth_error=1'},
            'body': '',
        }

    steam_id = verify_openid(params)
    if not steam_id:
        return {
            'statusCode': 302,
            'headers': {**CORS, 'Location': f'{site_url}/?auth_error=1'},
            'body': '',
        }

    profile = get_steam_profile(steam_id)
    session_id = secrets.token_hex(32)

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        f"""INSERT INTO {SCHEMA}.users (steam_id, username, avatar_url, last_login)
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (steam_id) DO UPDATE
            SET username = EXCLUDED.username,
                avatar_url = EXCLUDED.avatar_url,
                last_login = NOW()
            RETURNING id""",
        (steam_id, profile['username'], profile['avatar_url']),
    )
    user_id = cur.fetchone()[0]

    cur.execute(
        f"""INSERT INTO {SCHEMA}.sessions (id, user_id)
            VALUES (%s, %s)""",
        (session_id, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 302,
        'headers': {
            **CORS,
            'Location': f'{site_url}/api/steam-callback#cabinet?sid={session_id}',
        },
        'body': '',
    }