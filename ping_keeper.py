#!/usr/bin/env python3
"""
Keep-Alive Ping Script for Render Hosted Service.
Pings the Render service URL to prevent it from spinning down after 15 minutes of inactivity.
Usage:
    python ping_keeper.py [optional_service_url]
"""

import sys
import time
import urllib.request

DEFAULT_URL = "https://hindtraders-app.onrender.com"

def ping_service(url: str):
    ping_endpoint = url.rstrip('/') + '/api/ping'
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Pinging: {ping_endpoint}")
    try:
        req = urllib.request.Request(ping_endpoint, headers={'User-Agent': 'KeepAlivePing/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            body = resp.read().decode('utf-8')
            print(f"Status Code: {status}")
            print(f"Response Body: {body}")
            return True
    except Exception as e:
        print(f"Ping attempt note: {e}")
        # Fallback to root URL ping
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                print(f"Fallback Root Ping Status: {resp.status}")
                return True
        except Exception as err:
            print(f"Root ping failed: {err}")
            return False

if __name__ == '__main__':
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    ping_service(target_url)
