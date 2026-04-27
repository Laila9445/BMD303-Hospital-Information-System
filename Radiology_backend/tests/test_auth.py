from tests.conftest import client


def test_register(client):
    """Test user registration."""
    res = client.post("/api/auth/register", json={
        "username": "dr_test",
        "email": "test@hospital.com",
        "password": "SecurePass123!",
        "full_name": "Dr Test",
        "role": "radiologist"
    })
    assert res.status_code == 200
    assert res.json()["data"]["username"] == "dr_test"


def test_login(client):
    """Test user login."""
    # Register first
    client.post("/api/auth/register", json={
        "username": "dr_test",
        "email": "test@hospital.com",
        "password": "SecurePass123!",
        "full_name": "Dr Test",
        "role": "radiologist"
    })
    
    # Login
    res = client.post("/api/auth/login", json={
        "username": "dr_test",
        "password": "SecurePass123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()["data"]
    assert "refresh_token" in res.json()["data"]


def test_wrong_password(client):
    """Test login with wrong password."""
    res = client.post("/api/auth/login", json={
        "username": "nobody",
        "password": "wrong"
    })
    assert res.status_code == 401


def test_duplicate_username(client):
    """Test registration with duplicate username."""
    # First registration
    client.post("/api/auth/register", json={
        "username": "dr_unique",
        "email": "first@hospital.com",
        "password": "SecurePass123!",
        "full_name": "Dr First",
        "role": "user"
    })
    
    # Second registration with same username
    res = client.post("/api/auth/register", json={
        "username": "dr_unique",
        "email": "second@hospital.com",
        "password": "SecurePass123!",
        "full_name": "Dr Second",
        "role": "user"
    })
    assert res.status_code == 409


def test_get_current_user(client):
    """Test getting current user profile."""
    # Register and login
    client.post("/api/auth/register", json={
        "username": "dr_profile",
        "email": "profile@hospital.com",
        "password": "SecurePass123!",
        "full_name": "Dr Profile",
        "role": "radiologist"
    })
    
    login_res = client.post("/api/auth/login", json={
        "username": "dr_profile",
        "password": "SecurePass123!"
    })
    
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get current user
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["username"] == "dr_profile"
