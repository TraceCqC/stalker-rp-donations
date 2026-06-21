"""Запрашивает онлайн и статус DayZ сервера через Steam Query Protocol (A2S_INFO)"""
import socket
import struct
import json


SERVER_HOST = '94.127.218.85'
SERVER_PORT = 27016
TIMEOUT = 5

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

A2S_INFO = b'\xFF\xFF\xFF\xFFTSource Engine Query\x00'


def query_server() -> dict:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(TIMEOUT)
    try:
        sock.sendto(A2S_INFO, (SERVER_HOST, SERVER_PORT))
        data, _ = sock.recvfrom(4096)
    finally:
        sock.close()

    if len(data) < 6:
        raise ValueError('Response too short')

    offset = 4
    header = data[offset]
    offset += 1

    if header == 0x41:
        challenge = data[offset:offset+4]
        challenge_req = b'\xFF\xFF\xFF\xFFTSource Engine Query\x00' + challenge
        sock2 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock2.settimeout(TIMEOUT)
        try:
            sock2.sendto(challenge_req, (SERVER_HOST, SERVER_PORT))
            data, _ = sock2.recvfrom(4096)
        finally:
            sock2.close()
        offset = 5

    def read_string(data, pos):
        end = data.index(b'\x00', pos)
        return data[pos:end].decode('utf-8', errors='replace'), end + 1

    offset += 1
    name, offset = read_string(data, offset)
    map_name, offset = read_string(data, offset)
    folder, offset = read_string(data, offset)
    game, offset = read_string(data, offset)
    offset += 2
    players = data[offset]
    offset += 1
    max_players = data[offset]

    return {
        'online': True,
        'players': players,
        'max_players': max_players,
        'map': map_name,
        'name': name,
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    try:
        result = query_server()
    except Exception:
        result = {'online': False, 'players': 0, 'max_players': 0, 'map': '', 'name': ''}

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps(result),
    }