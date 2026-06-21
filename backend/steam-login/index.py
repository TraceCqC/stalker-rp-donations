"""Редирект пользователя на страницу авторизации Steam (OpenID)"""
import os


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    site_url = os.environ.get('SITE_URL', 'https://nightzone.poehali.dev')
    callback_url = 'https://functions.poehali.dev/edbd3d47-b8f0-4f79-beaf-4ba48d8f3bf6'

    params = (
        "openid.ns=http://specs.openid.net/auth/2.0"
        "&openid.mode=checkid_setup"
        "&openid.return_to=" + callback_url +
        "&openid.realm=" + site_url +
        "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select"
        "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select"
    )

    redirect_url = f"https://steamcommunity.com/openid/login?{params}"

    return {
        'statusCode': 302,
        'headers': {**CORS, 'Location': redirect_url},
        'body': '',
    }