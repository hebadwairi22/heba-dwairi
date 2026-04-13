const API_BASE_URL = "http://localhost:5031/api";

function getAuthHeaders() {
  const storedUser = localStorage.getItem("petcareCurrentUser");
  if (!storedUser) {
    return {};
  }

  const user = JSON.parse(storedUser);
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed for ${path}`);
  }

  return response.json();
}

export const api = {
  getDashboard: () => request("/dashboard/summary"),
  getPets: () => request("/pets"),
  getPetDetails: (petId) => request(`/pets/${petId}`),
  createPet: (payload) =>
    request("/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getAdoptions: () => request("/adoptions"),
  createAdoption: (payload) =>
    request("/adoptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getLostPets: () => request("/community/lost"),
  createLostPet: (payload) =>
    request("/community/lost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getFoundPets: () => request("/community/found"),
  createFoundPet: (payload) =>
    request("/community/found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getUpcomingVaccines: () => request("/medical/upcoming-vaccines"),
  getNotifications: (userId) => request(`/community/notifications/${userId}`),
  getVets: () => request("/auth/vets"),
  getOwnerAppointments: (ownerId) => request(`/appointments/owner/${ownerId}`),
  getVetAppointments: (vetId) => request(`/appointments/vet/${vetId}`),
  getAppointmentDetails: (appointmentId) => request(`/appointments/${appointmentId}`),
  getAdminAppointmentSummary: () => request("/appointments/admin/summary"),
  getAdminUsers: () => request("/admin/users"),
  updateAdminUserRole: (userId, payload) =>
    request(`/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getAdminReports: () => request("/admin/reports"),
  updateAdminReportStatus: (reportKind, reportId, payload) =>
    request(`/admin/reports/${reportKind}/${reportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  createAppointment: (payload) =>
    request("/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  updateAppointmentStatus: (appointmentId, payload) =>
    request(`/appointments/${appointmentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  sendAppointmentMessage: (appointmentId, payload) =>
    request(`/appointments/${appointmentId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  createMedicalRecord: (payload) =>
    request("/medical/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  createVaccination: (payload) =>
    request("/medical/vaccinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }),
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getOwnerMessages: (adoptionListingId) => request(`/ownerchat/${adoptionListingId}`),
  sendOwnerMessage: (payload) =>
    request("/ownerchat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
};
