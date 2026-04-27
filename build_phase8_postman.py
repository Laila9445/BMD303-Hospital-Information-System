import json
with open('c:/Desktop/PhysioTherapy_system/physio_clinic/PhysioClinic_Phase7.postman_collection.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['info']['name'] = 'PhysioClinic_Phase8'

auth_folder = {
    "name": "Phase 8 Auth",
    "item": [
        {
            "name": "Auth: Login Admin",
            "event": [{"listen": "test", "script": {"exec": [
                "pm.test('Status code is 200', function () {",
                "    pm.response.to.have.status(200);",
                "});",
                "var jsonData = pm.response.json();",
                "pm.globals.set('access_token', jsonData.access_token);",
                "pm.globals.set('refresh_token', jsonData.refresh_token);"
            ], "type": "text/javascript"}}],
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {"mode": "raw", "raw": '{"email": "admin@clinic.com", "password": "admin123"}'},
                "url": {"raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"]}
            }
        },
        {
            "name": "Auth: Login Therapist",
            "event": [{"listen": "test", "script": {"exec": [
                "var jsonData = pm.response.json();",
                "pm.globals.set('access_token', jsonData.access_token);",
                "pm.globals.set('refresh_token', jsonData.refresh_token);"
            ], "type": "text/javascript"}}],
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {"mode": "raw", "raw": '{"email": "ahmed.hassan@clinic.com", "password": "therapist123"}'},
                "url": {"raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"]}
            }
        },
        {
            "name": "Auth: Login Nurse",
            "event": [{"listen": "test", "script": {"exec": [
                "var jsonData = pm.response.json();",
                "pm.globals.set('access_token', jsonData.access_token);",
                "pm.globals.set('refresh_token', jsonData.refresh_token);"
            ], "type": "text/javascript"}}],
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {"mode": "raw", "raw": '{"email": "mona.ibrahim@clinic.com", "password": "nurse123"}'},
                "url": {"raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"]}
            }
        },
        {
            "name": "Auth: Refresh Token",
            "event": [{"listen": "test", "script": {"exec": [
                "var jsonData = pm.response.json();",
                "pm.globals.set('access_token', jsonData.access_token);"
            ], "type": "text/javascript"}}],
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {"mode": "raw", "raw": '{"refresh_token": "{{refresh_token}}"}'},
                "url": {"raw": "{{base_url}}/api/auth/refresh", "host": ["{{base_url}}"], "path": ["api", "auth", "refresh"]}
            }
        },
        {
            "name": "Auth: Get Me",
            "request": {
                "method": "GET",
                "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
                "url": {"raw": "{{base_url}}/api/auth/me", "host": ["{{base_url}}"], "path": ["api", "auth", "me"]}
            }
        }
    ]
}

# Add authorization header to all existing requests
def inject_auth(items):
    for item in items:
        if "request" in item:
            if "header" not in item["request"]:
                item["request"]["header"] = []
            item["request"]["header"].append({"key": "Authorization", "value": "Bearer {{access_token}}"})
        elif "item" in item:
            inject_auth(item["item"])

inject_auth(data['item'])

data['item'] = [auth_folder] + data['item']

with open('c:/Desktop/PhysioTherapy_system/physio_clinic/PhysioClinic_Phase8.postman_collection.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
