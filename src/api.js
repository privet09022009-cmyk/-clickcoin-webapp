// ====================== API CONFIG ======================
const API_URL = "http://localhost:4000/api";

// ====================== AUTH ======================
export async function apiAuth(userId, referrerId = null) {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, referrerId }),
  });
  return res.json();
}

// ====================== CLICK ======================
export async function apiClick(userId) {
  const res = await fetch(`${API_URL}/click`, {
    method: "POST",
    headers: { "x-user-id": userId },
  });
  return res.json();
}

// ====================== ENERGY ======================
export async function apiEnergyTick(userId) {
  const res = await fetch(`${API_URL}/energy/tick`, {
    method: "POST",
    headers: { "x-user-id": userId },
  });
  return res.json();
}

// ====================== TASKS ======================
export async function apiGetTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

export async function apiCompleteTask(userId, taskId) {
  const res = await fetch(`${API_URL}/tasks/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({ taskId }),
  });
  return res.json();
}

// ====================== FRIENDS ======================
export async function apiGetFriends(userId) {
  const res = await fetch(`${API_URL}/friends`, {
    headers: { "x-user-id": userId },
  });
  return res.json();
}

// ====================== ADMIN: MAINTENANCE ======================
export async function apiAdminSetMaintenance(userId, value) {
  const res = await fetch(`${API_URL}/admin/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({ value }),
  });
  return res.json();
}

// ====================== ADMIN: CREATE TASK ======================
export async function apiAdminAddTask(userId, task) {
  const res = await fetch(`${API_URL}/admin/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify(task),
  });
  return res.json();
}

// ====================== ADMIN: DELETE TASK ======================
export async function apiAdminDeleteTask(userId, id) {
  const res = await fetch(`${API_URL}/admin/tasks/${id}`, {
    method: "DELETE",
    headers: { "x-user-id": userId },
  });
  return res.json();
}

// ====================== ADMIN: GRANT STARS ======================
export async function apiAdminGrantStars(userId, targetId, stars) {
  const res = await fetch(`${API_URL}/admin/grant-stars`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({ userId: targetId, stars }),
  });
  return res.json();
}
