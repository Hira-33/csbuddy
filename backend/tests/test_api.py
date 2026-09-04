from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "CSBuddy" in response.json()["message"]


def test_health():
    response = client.get("/api/admin/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["terms"] > 0


def test_list_terms():
    response = client.get("/api/terms")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) > 0


def test_get_term():
    response = client.get("/api/terms/recursion")
    assert response.status_code == 200
    assert response.json()["id"] == "recursion"


def test_get_term_404():
    response = client.get("/api/terms/does-not-exist")
    assert response.status_code == 404


def test_related_terms():
    response = client.get("/api/terms/related/recursion")
    assert response.status_code == 200
    data = response.json()
    assert data["term_id"] == "recursion"
    assert len(data["related"]) > 0


def test_ask_stream():
    with client.stream(
        "POST", "/api/ask", json={"query": "What is recursion?"}
    ) as response:
        assert response.status_code == 200
        body = "".join(response.iter_text())
    assert "event: meta" in body
    assert "recursion" in body.lower()
    assert "event: done" in body
    assert "event: related" in body


def test_predict_intent():
    response = client.post(
        "/api/intent", json={"text": "show me a diagram of recursion"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is True
    assert data["intent"] == "diagram"
    assert data["predicted_term_id"] == "recursion"
    assert data["intent_confidence"] > 0.5
