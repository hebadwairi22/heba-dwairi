import fs from "fs";

// 1. Define the top of the file
const head = `import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { translations, interpolate, formatDate, formatDateTime, getLocalizedText } from "./i18n";

const baseTabs = [
  { id: "home", label: "Home" },
  { id: "adoption", label: "Adoption" },
  { id: "community", label: "Community" },
  { id: "health", label: "Health" },
  { id: "registry", label: "Registry" }
];

const demoCredentials = [
  { role: "Admin", email: "loai.admin@petcare.jo", password: "Pass123!", name: "لؤي | Loai" },
  { role: "Vet", email: "safaa.vet@petcare.jo", password: "Pass123!", name: "د. صفاء | Dr. Safaa" },
  { role: "Owner", email: "yaqeen@petcare.jo", password: "Pass123!", name: "يقين | Yaqeen" }
];

const emptyRegisterForm = { fullName: "", email: "", password: "", phoneNumber: "", city: "", role: "User" };
const emptyAppointmentForm = { petId: "", vetId: "", preferredDateUtc: "", reason: "", ownerNotes: "" };
const emptyMedicalForm = { visitReason: "", diagnosis: "", treatment: "", visitDateUtc: "" };
const emptyVaccineForm = { vaccineName: "", givenOnUtc: "", dueDateUtc: "", isCompleted: false };
const emptyPetForm = {
  name: "", type: "Cat", breed: "", ageInMonths: "", gender: "Male", collarId: "", color: "", city: "", weightKg: "",
  isNeutered: false, description: "", photoUrl: "", publishForAdoption: false, adoptionStory: "", contactMethod: "Phone", contactDetails: ""
};
const emptyLostForm = {
  petName: "", petType: "Cat", description: "", approximateAgeInMonths: "", lastSeenPlace: "", lastSeenDateUtc: "", rewardAmount: "", photoUrl: "", contactName: "", contactPhone: ""
};
const emptyFoundForm = {
  petType: "Cat", description: "", foundPlace: "", foundDateUtc: "", photoUrl: "", contactName: "", contactPhone: ""
};

function getTabs(currentUser, t) {
  if (!currentUser) return baseTabs;
  if (currentUser.role === "Vet") return [{ id: "appointments", label: t.tabs.vetCases }, { id: "health", label: t.tabs.health }, { id: "registry", label: t.tabs.registry }, { id: "community", label: t.tabs.community }];
  if (currentUser.role === "Admin") return [{ id: "admin", label: t.tabs.admin }, { id: "community", label: t.tabs.community }, { id: "registry", label: t.tabs.registry }, { id: "adoption", label: t.tabs.adoption }];
  return [
    { id: "home", label: t.tabs.home },
    { id: "adoption", label: t.tabs.adoption },
    { id: "community", label: t.tabs.community },
    { id: "health", label: t.tabs.health },
    { id: "registry", label: t.tabs.registry },
    { id: "appointments", label: t.tabs.appointments }
  ];
}

function getDefaultTab(currentUser) {
  if (!currentUser) return "login";
  if (currentUser.role === "Vet") return "appointments";
  if (currentUser.role === "Admin") return "admin";
  return "home";
}

function SectionCard({ title, subtitle, actions, children }) {
  return (
    <section className="section-card">
      <div className="section-heading">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function AuthPanel({ currentUser, authMode, setAuthMode, loginForm, setLoginForm, registerForm, setRegisterForm, handleLogin, handleRegister, handleLogout, text, language, setLanguage }) {
  return (
    <div className="auth-panel">
      <div className="auth-header">
        <div className="meta-line">
          <span className="kicker">{text.common.account}</span>
          <button type="button" className="toggle active" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>{language === "ar" ? "EN" : "AR"}</button>
        </div>
        <strong>{currentUser ? getLocalizedText(currentUser.fullName, language) : text.auth.signInPrompt}</strong>
        <p>{currentUser ? interpolate(text.common.accountRole, {role: currentUser.role, city: currentUser.city}) : text.auth.samplePrompt}</p>
      </div>
      {!currentUser ? (
        <>
          <div className="auth-toggle">
            <button type="button" className={authMode === "login" ? "toggle active" : "toggle"} onClick={() => setAuthMode("login")}>{text.common.signIn}</button>
            <button type="button" className={authMode === "register" ? "toggle active" : "toggle"} onClick={() => setAuthMode("register")}>{text.common.register}</button>
          </div>
          {authMode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <input type="email" placeholder={text.auth.email} value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} />
              <input type="password" placeholder={text.auth.password} value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} />
              <button type="submit">{text.common.signIn}</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <input type="text" placeholder={text.auth.fullName} value={registerForm.fullName} onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))} />
              <input type="email" placeholder={text.auth.email} value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} />
              <input type="password" placeholder={text.auth.password} value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} />
              <input type="text" placeholder={text.auth.phone} value={registerForm.phoneNumber} onChange={(event) => setRegisterForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
              <input type="text" placeholder={text.auth.city} value={registerForm.city} onChange={(event) => setRegisterForm((current) => ({ ...current, city: event.target.value }))} />
              <select value={registerForm.role} onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}>
                <option value="User">{text.common.owner}</option>
                <option value="Vet">{text.common.vet}</option>
              </select>
              <button type="submit">{text.common.createAccount}</button>
            </form>
          )}
        </>
      ) : (
        <div className="signed-in-card">
          <div>
            <strong>{currentUser.email}</strong>
            <p>{currentUser.phoneNumber}</p>
          </div>
          <button type="button" onClick={handleLogout}>{text.common.signOut}</button>
        </div>
      )}
    </div>
  );
}

function AppointmentChat({ details, currentUser, messageDraft, setMessageDraft, onSendMessage, language, getLocalizedText, text, formatDateTime }) {
  if (!details) return <p className="empty-state">{text.common.selectAppointmentChat}</p>;
  return (
    <div className="list-stack">
      <article className="list-card">
        <strong>{getLocalizedText(details.appointment.petName, language)}</strong>
        <p>{getLocalizedText(details.appointment.reason, language)}</p>
        <div className="meta-line"><span>{getLocalizedText(details.appointment.ownerName, language)}</span><span>{getLocalizedText(details.appointment.vetName, language)}</span></div>
        <div className="meta-line"><span>{text.appointments["status" + details.appointment.status] || details.appointment.status}</span><span>{formatDateTime(details.appointment.preferredDateUtc, language)}</span></div>
        {details.appointment.ownerNotes ? <p>{text.common.ownerNote}: {getLocalizedText(details.appointment.ownerNotes, language)}</p> : null}
        {details.appointment.vetNotes ? <p>{text.common.vetNote}: {getLocalizedText(details.appointment.vetNotes, language)}</p> : null}
      </article>
      <div className="list-stack">
        {details.messages.map((item) => (
          <article key={item.id} className="list-card">
            <strong>{getLocalizedText(item.senderName, language)}</strong>
            <p>{item.message}</p>
            <div className="meta-line"><span>{text.common[item.senderRole.toLowerCase()] || item.senderRole}</span><span>{formatDateTime(item.sentAtUtc, language)}</span></div>
          </article>
        ))}
      </div>
      {currentUser ? (
        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); onSendMessage(); }}>
          <textarea value={messageDraft} placeholder={text.common.writeMessage} onChange={(event) => setMessageDraft(event.target.value)} style={{ minHeight: 100, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
          <button type="submit">{text.common.sendMessage}</button>
        </form>
      ) : null}
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem("petcareLanguage") || "en");
  const [activeTab, setActiveTab] = useState(() => getDefaultTab(JSON.parse(localStorage.getItem("petcareCurrentUser") || "null")));
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [pets, setPets] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [lostPets, setLostPets] = useState([]);
  const [foundPets, setFoundPets] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [vets, setVets] = useState([]);
  const [ownerAppointments, setOwnerAppointments] = useState([]);
  const [vetAppointments, setVetAppointments] = useState([]);
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [petDetails, setPetDetails] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointmentForm);
  const [messageDraft, setMessageDraft] = useState("");
  const [vetStatusForm, setVetStatusForm] = useState({ status: "Confirmed", vetNotes: "" });
  const [medicalForm, setMedicalForm] = useState(emptyMedicalForm);
  const [vaccineForm, setVaccineForm] = useState(emptyVaccineForm);
  const [petForm, setPetForm] = useState(emptyPetForm);
  const [lostForm, setLostForm] = useState(emptyLostForm);
  const [foundForm, setFoundForm] = useState(emptyFoundForm);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("petcareCurrentUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerChatListingId, setOwnerChatListingId] = useState(null);
  const [ownerMessages, setOwnerMessages] = useState([]);
  const [ownerMsgDraft, setOwnerMsgDraft] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: demoCredentials[0].email, password: demoCredentials[0].password });
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const text = translations[language];
  const tabs = useMemo(() => getTabs(currentUser, text), [currentUser, text]);
`;

const rawCode = fs.readFileSync("frontend/petcare-jordan-client/src/App.jsx", "utf8");
// Extract handlers block from rawCode
// We'll search for things like "useEffect(() => { localStorage.setItem..."
// and "async function handleLogin"
const handlersMatch = rawCode.match(/(useEffect\([\s\S]*?)Route path=/);
let handlers = handlersMatch ? handlersMatch[1] : "";

// Cleanup handlers from common corruption patterns (like extra imports dumped in)
handlers = handlers.replace(/import { Routes[\s\S]*?const authMode = "login";/g, '');

const routes = `
        {loading ? <div className="loading-state">{text.common.loading}</div> : (
          <Routes>
            <Route path="/home" element={<>
              <div className="content-grid">
                <div className="split-grid">
                  <SectionCard title={text.home.featuredTitle}>
                    <div className="pet-grid">
                      {featuredAdoptions.map((item) => (
                        <article key={item.id} className="pet-card">
                          <img src={item.photoUrl} alt={item.petName} />
                          <div className="pet-card-body">
                            <h4>{getLocalizedText(item.petName, language)}</h4>
                            <span>{item.city} | {item.contactDetails}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title={text.home.notifyTitle}>
                    {notifications.length > 0 ? (
                      <div className="list-stack">
                        {notifications.map((item) => (
                          <article key={item.id} className="list-card">
                            <strong>{item.title}</strong>
                            <p>{item.message}</p>
                            <span>{formatDate(item.triggerDateUtc, language)}</span>
                          </article>
                        ))}
                      </div>
                    ) : <p className="empty-state">{text.common.signInForUpdates}</p>}
                  </SectionCard>
                </div>

                <div className="split-grid">
                  <SectionCard title={text.home.cityTitle}>
                    <div className="city-grid">
                      {cityCoverage.map(([city, value]) => <article key={city} className="city-card"><strong>{city}</strong><span>{interpolate(text.common.petsInCity, {count: value})}</span></article>)}
                    </div>
                  </SectionCard>
                  <SectionCard title={text.home.typesTitle}>
                    <div className="bar-list">
                      {typeCoverage.map(([label, value]) => (
                        <div key={label} className="bar-row">
                          <span>{text.petTypes[label] || label}</span>
                          <div className="bar-track"><div className="bar-fill" style={{ width: \`\${(value / dashboard.totalPets) * 100}%\` }} /></div>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>
            </>} />

            <Route path="/appointments" element={<>
              <div className="split-grid">
                {currentUser?.role === "User" && (
                  <SectionCard title={text.appointments.requestTitle}>
                    <form className="auth-form" onSubmit={handleCreateAppointment}>
                      <select value={appointmentForm.petId} onChange={(event) => setAppointmentForm((current) => ({ ...current, petId: event.target.value }))}>
                        <option value="">{text.common.selectPet}</option>
                        {ownPets.map((pet) => <option key={pet.id} value={pet.id}>{getLocalizedText(pet.name, language)} | {pet.collarId}</option>)}
                      </select>
                      <select value={appointmentForm.vetId} onChange={(event) => setAppointmentForm((current) => ({ ...current, vetId: event.target.value }))}>
                        <option value="">{text.common.selectVet}</option>
                        {vets.map((vet) => <option key={vet.id} value={vet.id}>{getLocalizedText(vet.fullName, language)} | {vet.city}</option>)}
                      </select>
                      <input type="datetime-local" value={appointmentForm.preferredDateUtc} onChange={(event) => setAppointmentForm((current) => ({ ...current, preferredDateUtc: event.target.value }))} />
                      <input type="text" placeholder={text.appointments.reasonPlaceholder} value={appointmentForm.reason} onChange={(event) => setAppointmentForm((current) => ({ ...current, reason: event.target.value }))} />
                      <textarea value={appointmentForm.ownerNotes} placeholder={text.appointments.notesPlaceholder} onChange={(event) => setAppointmentForm((current) => ({ ...current, ownerNotes: event.target.value }))} style={{ minHeight: 110, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                      <button type="submit">{text.appointments.sendRequest}</button>
                    </form>
                  </SectionCard>
                )}

                {currentUser?.role === "Vet" && (
                  <SectionCard title={text.appointments.vetCasesTitle}>
                    <div className="list-stack">
                      {vetAppointments.map((item) => (
                        <article key={item.id} className="list-card" onClick={() => setSelectedAppointmentId(item.id)} style={{ cursor: "pointer" }}>
                          <strong>{getLocalizedText(item.petName, language)}</strong>
                          <p>{getLocalizedText(item.reason, language)}</p>
                          <div className="meta-line"><span>{getLocalizedText(item.ownerName, language)}</span><span>{text.appointments["status" + item.status] || item.status}</span></div>
                          <div className="meta-line"><span>{formatDateTime(item.preferredDateUtc, language)}</span><span>{interpolate(text.common.messagesCount, {n: item.messageCount})}</span></div>
                        </article>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {currentUser?.role === "User" && (
                  <SectionCard title={text.appointments.mineTitle}>
                    <div className="list-stack">
                      {ownerAppointments.map((item) => (
                        <article key={item.id} className="list-card" onClick={() => setSelectedAppointmentId(item.id)} style={{ cursor: "pointer" }}>
                          <strong>{getLocalizedText(item.petName, language)}</strong>
                          <p>{getLocalizedText(item.reason, language)}</p>
                          <div className="meta-line"><span>{getLocalizedText(item.vetName, language)}</span><span>{text.appointments["status" + item.status] || item.status}</span></div>
                          <div className="meta-line"><span>{formatDateTime(item.preferredDateUtc, language)}</span><span>{interpolate(text.common.messagesCount, {n: item.messageCount})}</span></div>
                        </article>
                      ))}
                    </div>
                  </SectionCard>
                )}

                <SectionCard title={text.appointments.chatTitle}>
                  <AppointmentChat details={appointmentDetails} currentUser={currentUser} messageDraft={messageDraft} setMessageDraft={setMessageDraft} onSendMessage={handleSendMessage} language={language} getLocalizedText={getLocalizedText} text={text} formatDateTime={formatDateTime} />
                </SectionCard>
              </div>
            </>} />

            <Route path="/admin" element={currentUser?.role === "Admin" ? <>
              <div className="content-grid">
                <SectionCard title={text.admin.summaryTitle}>
                  <div className="stats-grid">
                    <article className="stat-card"><strong>{adminSummary?.totalAppointments ?? 0}</strong><span>{text.admin.totalAppt}</span></article>
                    <article className="stat-card"><strong>{adminSummary?.pendingAppointments ?? 0}</strong><span>{text.admin.pendingAppt}</span></article>
                    <article className="stat-card"><strong>{adminSummary?.activeVetCases ?? 0}</strong><span>{text.admin.activeCases}</span></article>
                    <article className="stat-card"><strong>{adminSummary?.totalMessages ?? 0}</strong><span>{text.admin.totalMsg}</span></article>
                  </div>
                </SectionCard>

                <SectionCard title={text.admin.recentTitle}>
                  <div className="list-stack">
                    {(adminSummary?.recentAppointments ?? []).map((item) => (
                      <article key={item.id} className="list-card">
                        <strong>{getLocalizedText(item.petName, language)}</strong>
                        <p>{getLocalizedText(item.reason, language)}</p>
                        <div className="meta-line"><span>{getLocalizedText(item.ownerName, language)}</span><span>{getLocalizedText(item.vetName, language)}</span></div>
                        <div className="meta-line"><span>{item.status}</span><span>{formatDateTime(item.preferredDateUtc, language)}</span></div>
                      </article>
                    ))}
                  </div>
                </SectionCard>

                <div className="split-grid">
                  <SectionCard title={text.admin.usersTitle}>
                    <div className="list-stack">
                      {adminUsers.map((item) => (
                        <article key={item.id} className="list-card">
                          <strong>{getLocalizedText(item.fullName, language)}</strong>
                          <p>{item.email}</p>
                          <div className="meta-line"><span>{item.city}</span><span>{item.phoneNumber}</span></div>
                          <div className="meta-line"><span>{interpolate(text.admin.userPets, {n: item.ownedPetCount})}</span><span>{interpolate(text.admin.userAppts, {n: item.ownerAppointmentCount + item.vetAppointmentCount})}</span></div>
                          <select value={item.role} onChange={(event) => handleAdminRoleChange(item.id, event.target.value)}>
                            <option value="User">{text.common.user}</option>
                            <option value="Vet">{text.common.vet}</option>
                            <option value="Admin">{text.common.admin}</option>
                          </select>
                        </article>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title={text.admin.reportsTitle}>
                    <div className="list-stack">
                      {adminReports.map((item) => (
                        <article key={\`\${item.reportKind}-\${item.id}\`} className="list-card">
                          <strong>{item.reportKind} | {item.title}</strong>
                          <p>{getLocalizedText(item.description, language)}</p>
                          <div className="meta-line"><span>{item.place}</span><span>{formatDate(item.reportDateUtc, language)}</span></div>
                          <div className="meta-line"><span>{item.contactName}</span><span>{item.contactPhone}</span></div>
                        </article>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>
            </> : null} />

            <Route path="/adoption" element={<>
              <div className="split-grid">
                {currentUser?.role === "User" ? (
                  <SectionCard title={text.adoption.addTitle}>
                    <form className="auth-form" onSubmit={handleCreatePet}>
                      <input type="text" placeholder={text.adoption.namePh} value={petForm.name} onChange={(event) => setPetForm((current) => ({ ...current, name: event.target.value }))} />
                      <div className="split-grid">
                        <select value={petForm.type} onChange={(event) => setPetForm((current) => ({ ...current, type: event.target.value }))}>
                          <option value="Cat">{text.petTypes.Cat}</option>
                          <option value="Dog">{text.petTypes.Dog}</option>
                          <option value="Bird">{text.petTypes.Bird}</option>
                          <option value="Rabbit">{text.petTypes.Rabbit}</option>
                          <option value="Hamster">{text.petTypes.Hamster}</option>
                          <option value="Turtle">{text.petTypes.Turtle}</option>
                          <option value="Other">{text.petTypes.Other}</option>
                        </select>
                        <select value={petForm.gender} onChange={(event) => setPetForm((current) => ({ ...current, gender: event.target.value }))}>
                          <option value="Male">{text.petGender.Male}</option>
                          <option value="Female">{text.petGender.Female}</option>
                        </select>
                      </div>
                      <input type="text" placeholder={text.adoption.breedPh} value={petForm.breed} onChange={(event) => setPetForm((current) => ({ ...current, breed: event.target.value }))} />
                      <div className="split-grid">
                        <input type="number" placeholder={text.adoption.agePh} value={petForm.ageInMonths} onChange={(event) => setPetForm((current) => ({ ...current, ageInMonths: event.target.value }))} />
                        <input type="number" step="0.1" placeholder={text.adoption.weightPh} value={petForm.weightKg} onChange={(event) => setPetForm((current) => ({ ...current, weightKg: event.target.value }))} />
                      </div>
                      <input type="text" placeholder={text.adoption.collarPh} value={petForm.collarId} onChange={(event) => setPetForm((current) => ({ ...current, collarId: event.target.value }))} />
                      <div className="split-grid">
                        <input type="text" placeholder={text.adoption.colorPh} value={petForm.color} onChange={(event) => setPetForm((current) => ({ ...current, color: event.target.value }))} />
                        <input type="text" placeholder={text.adoption.cityPh} value={petForm.city} onChange={(event) => setPetForm((current) => ({ ...current, city: event.target.value }))} />
                      </div>
                      <input type="text" placeholder={text.adoption.photoPh} value={petForm.photoUrl} onChange={(event) => setPetForm((current) => ({ ...current, photoUrl: event.target.value }))} />
                      <textarea value={petForm.description} placeholder={text.adoption.descPh} onChange={(event) => setPetForm((current) => ({ ...current, description: event.target.value }))} style={{ minHeight: 100, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                      <label style={{ color: "#5d6b78", display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" checked={petForm.isNeutered} onChange={(event) => setPetForm((current) => ({ ...current, isNeutered: event.target.checked }))} />
                        {text.adoption.neutered}
                      </label>
                      <label style={{ color: "#5d6b78", display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" checked={petForm.publishForAdoption} onChange={(event) => setPetForm((current) => ({ ...current, publishForAdoption: event.target.checked }))} />
                        {text.adoption.publishAdoption}
                      </label>
                      {petForm.publishForAdoption ? (
                        <>
                          <textarea value={petForm.adoptionStory} placeholder={text.adoption.storyPh} onChange={(event) => setPetForm((current) => ({ ...current, adoptionStory: event.target.value }))} style={{ minHeight: 90, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                          <div className="split-grid">
                            <select value={petForm.contactMethod} onChange={(event) => setPetForm((current) => ({ ...current, contactMethod: event.target.value }))}>
                              <option value="Phone">{text.adoption.contactPhone}</option>
                              <option value="Email">{text.adoption.contactEmail}</option>
                            </select>
                            <input type="text" placeholder={text.adoption.contactDetailsPh} value={petForm.contactDetails} onChange={(event) => setPetForm((current) => ({ ...current, contactDetails: event.target.value }))} />
                          </div>
                        </>
                      ) : null}
                      <button type="submit">{text.common.savePet}</button>
                    </form>
                  </SectionCard>
                ) : null}

                <SectionCard title={text.adoption.listingsTitle}>
                  <div className="pet-grid">
                    {adoptions.map((item) => (
                      <article key={item.id} className="pet-card">
                        <img src={item.photoUrl} alt={getLocalizedText(item.petName, language)} />
                        <div className="pet-card-body">
                          <div className="pet-card-head">
                            <div>
                              <h4>{getLocalizedText(item.petName, language)}</h4>
                              <span>{text.petTypes[item.petType]} | {getLocalizedText(item.breed, language)}</span>
                            </div>
                            <span className={item.status === "Available" ? "pill success" : "pill warning"}>{item.status === "Available" ? text.adoption.statusAvailable : text.adoption.statusPending}</span>
                          </div>
                          <p>{getLocalizedText(item.story, language)}</p>
                          <div className="meta-line"><span>{item.city}</span><button type="button" onClick={() => alert(text.adoption.adoptContact + "\\n\\n" + item.contactDetails)} style={{padding:"6px 14px",fontSize:"0.85rem",background:"rgba(59,130,246,0.1)",color:"#3b82f6",borderRadius:"8px",fontWeight:"bold"}}>{text.adoption.adoptBtn}</button><button type="button" onClick={() => loadOwnerChat(item.id)} style={{padding:"6px 14px",fontSize:"0.85rem",background:"rgba(16,185,129,0.1)",color:"#10b981",borderRadius:"8px",fontWeight:"bold"}}>{language === "ar" ? "محادثة" : "Chat"}</button></div>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </>} />

            <Route path="/community" element={<>
              <div className="split-grid">
                {currentUser?.role === "User" ? (
                  <SectionCard title={text.community.createTitle}>
                    <div className="list-stack">
                      <form className="auth-form" onSubmit={handleCreateLostReport}>
                        <strong>{text.community.lostHeading}</strong>
                        <input type="text" placeholder={text.adoption.namePh} value={lostForm.petName} onChange={(event) => setLostForm((current) => ({ ...current, petName: event.target.value }))} />
                        <select value={lostForm.petType} onChange={(event) => setLostForm((current) => ({ ...current, petType: event.target.value }))}>
                          <option value="Cat">{text.petTypes.Cat}</option>
                          <option value="Dog">{text.petTypes.Dog}</option>
                          <option value="Bird">{text.petTypes.Bird}</option>
                          <option value="Rabbit">{text.petTypes.Rabbit}</option>
                          <option value="Hamster">{text.petTypes.Hamster}</option>
                          <option value="Turtle">{text.petTypes.Turtle}</option>
                          <option value="Other">{text.petTypes.Other}</option>
                        </select>
                        <textarea value={lostForm.description} placeholder={text.adoption.descPh} onChange={(event) => setLostForm((current) => ({ ...current, description: event.target.value }))} style={{ minHeight: 90, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                        <div className="split-grid">
                          <input type="number" placeholder={text.community.approxAgePh} value={lostForm.approximateAgeInMonths} onChange={(event) => setLostForm((current) => ({ ...current, approximateAgeInMonths: event.target.value }))} />
                          <input type="number" placeholder={text.community.rewardPh} value={lostForm.rewardAmount} onChange={(event) => setLostForm((current) => ({ ...current, rewardAmount: event.target.value }))} />
                        </div>
                        <input type="text" placeholder={text.community.lastSeenPh} value={lostForm.lastSeenPlace} onChange={(event) => setLostForm((current) => ({ ...current, lastSeenPlace: event.target.value }))} />
                        <input type="datetime-local" value={lostForm.lastSeenDateUtc} onChange={(event) => setLostForm((current) => ({ ...current, lastSeenDateUtc: event.target.value }))} />
                        <input type="text" placeholder={text.adoption.photoPh} value={lostForm.photoUrl} onChange={(event) => setLostForm((current) => ({ ...current, photoUrl: event.target.value }))} />
                        <div className="split-grid">
                          <input type="text" placeholder={text.community.contactNamePh} value={lostForm.contactName} onChange={(event) => setLostForm((current) => ({ ...current, contactName: event.target.value }))} />
                          <input type="text" placeholder={text.community.contactPhonePh} value={lostForm.contactPhone} onChange={(event) => setLostForm((current) => ({ ...current, contactPhone: event.target.value }))} />
                        </div>
                        <button type="submit">{text.common.postLost}</button>
                      </form>

                      <form className="auth-form" onSubmit={handleCreateFoundReport}>
                        <strong>{text.community.foundHeading}</strong>
                        <select value={foundForm.petType} onChange={(event) => setFoundForm((current) => ({ ...current, petType: event.target.value }))}>
                          <option value="Cat">{text.petTypes.Cat}</option>
                          <option value="Dog">{text.petTypes.Dog}</option>
                          <option value="Bird">{text.petTypes.Bird}</option>
                          <option value="Rabbit">{text.petTypes.Rabbit}</option>
                          <option value="Hamster">{text.petTypes.Hamster}</option>
                          <option value="Turtle">{text.petTypes.Turtle}</option>
                          <option value="Other">{text.petTypes.Other}</option>
                        </select>
                        <textarea value={foundForm.description} placeholder={text.adoption.descPh} onChange={(event) => setFoundForm((current) => ({ ...current, description: event.target.value }))} style={{ minHeight: 90, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                        <input type="text" placeholder={text.community.foundPlacePh} value={foundForm.foundPlace} onChange={(event) => setFoundForm((current) => ({ ...current, foundPlace: event.target.value }))} />
                        <input type="datetime-local" value={foundForm.foundDateUtc} onChange={(event) => setFoundForm((current) => ({ ...current, foundDateUtc: event.target.value }))} />
                        <input type="text" placeholder={text.adoption.photoPh} value={foundForm.photoUrl} onChange={(event) => setFoundForm((current) => ({ ...current, photoUrl: event.target.value }))} />
                        <div className="split-grid">
                          <input type="text" placeholder={text.community.contactNamePh} value={foundForm.contactName} onChange={(event) => setFoundForm((current) => ({ ...current, contactName: event.target.value }))} />
                          <input type="text" placeholder={text.community.contactPhonePh} value={foundForm.contactPhone} onChange={(event) => setFoundForm((current) => ({ ...current, contactPhone: event.target.value }))} />
                        </div>
                        <button type="submit">{text.common.postFound}</button>
                      </form>
                    </div>
                  </SectionCard>
                ) : null}

                <SectionCard title={text.community.lostTitle}>
                  <div className="list-stack">
                    {lostPets.map((item) => (
                      <article key={item.id} className="community-card">
                        <img src={item.photoUrl} alt={getLocalizedText(item.petName, language)} />
                        <div>
                          <strong>{getLocalizedText(item.petName, language)}</strong>
                          <p>{getLocalizedText(item.description, language)}</p>
                          <div className="meta-line"><span>{item.lastSeenPlace}</span><span>{formatDate(item.lastSeenDateUtc, language)}</span></div>
                          <div className="meta-line"><span>{item.rewardAmount ? interpolate(text.common.jodReward, {amount: item.rewardAmount}) : text.common.noRewardListed}</span><span>{item.contactPhone}</span></div>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title={text.community.foundTitle}>
                  <div className="list-stack">
                    {foundPets.map((item) => (
                      <article key={item.id} className="community-card">
                        <img src={item.photoUrl} alt={text.petTypes[item.petType]} />
                        <div>
                          <strong>{text.petTypes[item.petType]}</strong>
                          <p>{getLocalizedText(item.description, language)}</p>
                          <div className="meta-line"><span>{item.foundPlace}</span><span>{formatDate(item.foundDateUtc, language)}</span></div>
                          <div className="meta-line"><span>{item.contactName}</span><span>{item.contactPhone}</span></div>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </>} />

            <Route path="/health" element={<>
              <SectionCard title={text.health.title}>
                <div className="list-stack">
                  {vaccines.map((item) => (
                    <article key={item.id} className="list-card">
                      <strong>{getLocalizedText(item.petName, language)}</strong>
                      <p>{getLocalizedText(item.vaccineName, language)}</p>
                      <div className="meta-line"><span>{getLocalizedText(item.ownerName, language)}</span><span>{item.ownerPhone}</span></div>
                      <span>{text.common.due} {formatDate(item.dueDateUtc, language)}</span>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </>} />

            <Route path="/registry" element={<>
              <SectionCard title={text.registry.title}>
                <div className="search-row">
                  <input type="search" placeholder={text.registry.searchPh} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>
                <div className="registry-grid">
                  {filteredPets.map((pet) => (
                    <article key={pet.id} className="registry-card">
                      <img src={pet.photoUrl} alt={getLocalizedText(pet.name, language)} />
                      <div>
                        <div className="pet-card-head">
                          <div>
                            <h4>{getLocalizedText(pet.name, language)}</h4>
                            <span>{text.petTypes[pet.type]} | {getLocalizedText(pet.breed, language)}</span>
                          </div>
                          <span className="registry-code">{pet.collarId}</span>
                        </div>
                        <p>{getLocalizedText(pet.ownerName, language)}</p>
                        <div className="meta-line"><span>{pet.city}</span><span>{pet.adoptionStatus ?? text.common.notListedForAdoption}</span></div>
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </>} />
            <Route path="*" element={<HomeRedirect currentUser={currentUser} />} />
          </Routes>
        )}
      </main>
      <div className={ownerChatListingId ? "chat-overlay active" : "chat-overlay"} onClick={() => setOwnerChatListingId(null)}>
        <div className="chat-modal" onClick={e => e.stopPropagation()}>
          <div className="chat-modal-head">
            <h3>{language === "ar" ? "محادثة المالك" : "Chat with Owner"}</h3>
            <button onClick={() => setOwnerChatListingId(null)}>×</button>
          </div>
          <div className="chat-modal-body">
            {ownerMessages.map(m => (
              <div key={m.id} className={m.senderId === currentUser?.id ? "msg-bubble mine" : "msg-bubble"}>
                <strong>{m.senderName}</strong>
                <p>{m.message}</p>
                <span>{formatDateTime(m.sentAtUtc, language)}</span>
              </div>
            ))}
          </div>
          <form className="chat-modal-foot" onSubmit={handleSendOwnerMessage}>
            <input value={ownerMsgDraft} onChange={e => setOwnerMsgDraft(e.target.value)} placeholder={text.common.writeMessage} />
            <button type="submit">{text.common.sendMessage}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function HomeRedirect({ currentUser }) { const navigate = useNavigate(); useEffect(() => { navigate("/" + getDefaultTab(currentUser), { replace: true }); }, [currentUser, navigate]); return null; }

export default App;
`;

const finalCode = head + handlers + routes;
fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", finalCode);
console.log("App.jsx reconstructed successfully!");
