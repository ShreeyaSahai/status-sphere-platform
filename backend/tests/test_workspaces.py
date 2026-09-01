from uuid import uuid4

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_workspace_returns_usable_id(client: AsyncClient):
    response = await client.post("/api/v1/workspaces")
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "created_at" in data
    workspace_id = data["id"]

    # Verify we can fetch the workspace
    get_res = await client.get(f"/api/v1/workspaces/{workspace_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == workspace_id


@pytest.mark.asyncio
async def test_get_nonexistent_workspace_returns_404(client: AsyncClient):
    nonexistent_id = str(uuid4())
    response = await client.get(f"/api/v1/workspaces/{nonexistent_id}")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_workspace_isolation_applications(client: AsyncClient):
    # 1. Create Workspace A and Workspace B
    res_a = await client.post("/api/v1/workspaces")
    workspace_a_id = res_a.json()["id"]

    res_b = await client.post("/api/v1/workspaces")
    workspace_b_id = res_b.json()["id"]

    # 2. Create Application in Workspace A
    app_payload_a = {
        "name": "Service A",
        "url": "https://service-a.internal/health",
        "environment_slug": "production",
        "method": "GET",
        "expected_status_code": 200,
        "timeout_seconds": 10,
        "check_interval_seconds": 30,
        "tags": ["core", "payments"],
    }
    create_res_a = await client.post(
        f"/api/v1/workspaces/{workspace_a_id}/applications",
        json=app_payload_a,
    )
    assert create_res_a.status_code == 201
    app_a = create_res_a.json()
    assert app_a["name"] == "Service A"
    assert app_a["workspace_id"] == workspace_a_id

    # 3. Create Application in Workspace B
    app_payload_b = {
        "name": "Service B",
        "url": "https://service-b.internal/health",
        "environment_slug": "production",
        "method": "GET",
        "expected_status_code": 200,
        "timeout_seconds": 10,
        "check_interval_seconds": 30,
        "tags": ["auth"],
    }
    create_res_b = await client.post(
        f"/api/v1/workspaces/{workspace_b_id}/applications",
        json=app_payload_b,
    )
    assert create_res_b.status_code == 201
    app_b = create_res_b.json()
    assert app_b["name"] == "Service B"
    assert app_b["workspace_id"] == workspace_b_id

    # 4. Listing applications in Workspace A returns only Service A
    list_a = await client.get(f"/api/v1/workspaces/{workspace_a_id}/applications")
    assert list_a.status_code == 200
    list_a_data = list_a.json()
    assert len(list_a_data) == 1
    assert list_a_data[0]["id"] == app_a["id"]

    # 5. Listing applications in Workspace B returns only Service B
    list_b = await client.get(f"/api/v1/workspaces/{workspace_b_id}/applications")
    assert list_b.status_code == 200
    list_b_data = list_b.json()
    assert len(list_b_data) == 1
    assert list_b_data[0]["id"] == app_b["id"]

    # 6. Attempting to get/update/delete Workspace A's application via Workspace B returns 404
    get_cross = await client.get(
        f"/api/v1/workspaces/{workspace_b_id}/applications/{app_a['id']}"
    )
    assert get_cross.status_code == 404

    patch_cross = await client.patch(
        f"/api/v1/workspaces/{workspace_b_id}/applications/{app_a['id']}",
        json={"name": "Hacked Name"},
    )
    assert patch_cross.status_code == 404

    delete_cross = await client.delete(
        f"/api/v1/workspaces/{workspace_b_id}/applications/{app_a['id']}"
    )
    assert delete_cross.status_code == 404


@pytest.mark.asyncio
async def test_nonexistent_workspace_applications_returns_404(client: AsyncClient):
    nonexistent_id = str(uuid4())
    response = await client.get(f"/api/v1/workspaces/{nonexistent_id}/applications")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_application_crud_in_workspace(client: AsyncClient):
    res_w = await client.post("/api/v1/workspaces")
    workspace_id = res_w.json()["id"]

    # Create
    app_payload = {
        "name": "User Service",
        "url": "https://users.example.com/health",
        "environment_slug": "staging",
        "method": "GET",
        "expected_status_code": 200,
        "timeout_seconds": 5,
        "check_interval_seconds": 15,
        "tags": ["users"],
    }
    create_res = await client.post(
        f"/api/v1/workspaces/{workspace_id}/applications",
        json=app_payload,
    )
    assert create_res.status_code == 201
    app_id = create_res.json()["id"]

    # Get
    get_res = await client.get(
        f"/api/v1/workspaces/{workspace_id}/applications/{app_id}"
    )
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "User Service"

    # Update
    update_res = await client.patch(
        f"/api/v1/workspaces/{workspace_id}/applications/{app_id}",
        json={"name": "Updated User Service", "check_interval_seconds": 60},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated User Service"
    assert update_res.json()["check_interval_seconds"] == 60

    # Health checks list
    hc_res = await client.get(
        f"/api/v1/workspaces/{workspace_id}/applications/{app_id}/health-checks"
    )
    assert hc_res.status_code == 200
    assert isinstance(hc_res.json(), list)

    # Incidents list
    inc_res = await client.get(
        f"/api/v1/workspaces/{workspace_id}/applications/{app_id}/incidents"
    )
    assert inc_res.status_code == 200
    assert isinstance(inc_res.json(), list)

    # Deactivate / Delete
    del_res = await client.delete(
        f"/api/v1/workspaces/{workspace_id}/applications/{app_id}"
    )
    assert del_res.status_code == 204

    # Now listing active applications should be empty
    list_res = await client.get(
        f"/api/v1/workspaces/{workspace_id}/applications"
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) == 0


@pytest.mark.asyncio
async def test_cors_preflight_and_headers(client: AsyncClient):
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Accept",
    }
    response = await client.options("/api/v1/workspaces", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "POST" in response.headers.get("access-control-allow-methods", "")
    assert response.headers.get("access-control-allow-credentials") == "true"

