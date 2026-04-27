def _auth_headers(client, username: str = "dr_flow", email: str = "flow@hospital.com"):
    client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "SecurePass123!",
            "full_name": "Dr Flow",
            "role": "radiologist",
        },
    )
    login_res = client.post(
        "/api/auth/login",
        json={"username": username, "password": "SecurePass123!"},
    )
    token = login_res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_study_requires_existing_patient(client):
    headers = _auth_headers(client, username="dr_study", email="study@hospital.com")
    res = client.post(
        "/api/studies",
        json={"patient_id": 9999, "study_type": "X-Ray", "status": "pending"},
        headers=headers,
    )
    assert res.status_code == 404


def test_report_requires_existing_study(client):
    headers = _auth_headers(client, username="dr_report", email="report@hospital.com")
    res = client.post(
        "/api/reports",
        json={"study_id": 9999, "description": "test", "result": "normal"},
        headers=headers,
    )
    assert res.status_code == 404


def test_patient_study_report_happy_path(client):
    headers = _auth_headers(client)

    patient_res = client.post(
        "/api/patients",
        json={"name": "Patient A", "age": 35, "gender": "female"},
        headers=headers,
    )
    assert patient_res.status_code == 200
    patient_id = patient_res.json()["data"]["id"]

    study_res = client.post(
        "/api/studies",
        json={"patient_id": patient_id, "study_type": "MRI", "status": "pending"},
        headers=headers,
    )
    assert study_res.status_code == 200
    study_id = study_res.json()["data"]["id"]

    complete_res = client.put(
        f"/api/studies/{study_id}",
        json={"status": "completed"},
        headers=headers,
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["data"]["status"] == "completed"

    report_res = client.post(
        "/api/reports",
        json={"study_id": study_id, "description": "lesion absent", "result": "normal"},
        headers=headers,
    )
    assert report_res.status_code == 200


def test_study_cannot_complete_twice(client):
    headers = _auth_headers(client, username="dr_status", email="status@hospital.com")

    patient_res = client.post(
        "/api/patients",
        json={"name": "Patient B", "age": 48, "gender": "male"},
        headers=headers,
    )
    patient_id = patient_res.json()["data"]["id"]

    study_res = client.post(
        "/api/studies",
        json={"patient_id": patient_id, "study_type": "CT", "status": "pending"},
        headers=headers,
    )
    study_id = study_res.json()["data"]["id"]

    first_complete = client.put(
        f"/api/studies/{study_id}",
        json={"status": "completed"},
        headers=headers,
    )
    assert first_complete.status_code == 200

    second_complete = client.put(
        f"/api/studies/{study_id}",
        json={"status": "completed"},
        headers=headers,
    )
    assert second_complete.status_code == 409
