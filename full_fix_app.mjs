import fs from "fs";

const fullContent = `
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
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

  useEffect(() => {
    localStorage.setItem("petcareLanguage", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    if (!tabs.some((item) => item.id === activeTab)) setActiveTab(tabs[0].id);
  }, [tabs, activeTab]);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [dashboardData, petsData, adoptionData, lostData, foundData, vaccineData, vetUsers] = await Promise.all([
          api.getDashboard(),
          api.getPets(),
          api.getAdoptions(),
          api.getLostPets(),
          api.getFoundPets(),
          api.getUpcomingVaccines(),
          api.getVets()
        ]);
        setDashboard(dashboardData);
        setPets(petsData);
        setAdoptions(adoptionData);
        setLostPets(lostData);
        setFoundPets(foundData);
        setVaccines(vaccineData);
        setVets(vetUsers);
      } catch {
        setError("Could not load the API.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem("petcareCurrentUser");
      setNotifications([]);
      setOwnerAppointments([]);
      setVetAppointments([]);
      setAdminSummary(null);
      setAppointmentDetails(null);
      setPetDetails(null);
      setSelectedAppointmentId(null);
      return;
    }
    localStorage.setItem("petcareCurrentUser", JSON.stringify(currentUser));
    api.getNotifications(currentUser.id).then(setNotifications).catch(() => setNotifications([]));
    if (currentUser.role === "User") {
      api.getOwnerAppointments(currentUser.id).then(setOwnerAppointments).catch(() => setOwnerAppointments([]));
    }
    if (currentUser.role === "Vet") {
      api.getVetAppointments(currentUser.id).then((items) => {
        setVetAppointments(items);
        if (items.length > 0 && !selectedAppointmentId) setSelectedAppointmentId(items[0].id);
      }).catch(() => setVetAppointments([]));
    }
    if (currentUser.role === "Admin") {
      api.getAdminAppointmentSummary().then(setAdminSummary).catch(() => setAdminSummary(null));
      api.getAdminUsers().then(setAdminUsers).catch(() => setAdminUsers([]));
      api.getAdminReports().then(setAdminReports).catch(() => setAdminReports([]));
    }
  }, [currentUser, selectedAppointmentId]);

  useEffect(() => {
    if (!selectedAppointmentId) {
      setAppointmentDetails(null);
      setPetDetails(null);
      return;
    }
    api.getAppointmentDetails(selectedAppointmentId).then((data) => {
      setAppointmentDetails(data);
      setVetStatusForm({ status: data.appointment.status, vetNotes: data.appointment.vetNotes || "" });
      return api.getPetDetails(data.appointment.petId);
    }).then((pet) => {
      setPetDetails(pet);
    }).catch(() => {
      setAppointmentDetails(null);
      setPetDetails(null);
    });
  }, [selectedAppointmentId]);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const target = \`\${pet.name} \${pet.breed} \${pet.city} \${pet.collarId}\`.toLowerCase();
      return target.includes(searchTerm.toLowerCase());
    });
  }, [pets, searchTerm]);

  const ownPets = useMemo(() => pets.filter((pet) => pet.ownerId === currentUser?.id), [pets, currentUser]);
  const featuredAdoptions = adoptions.slice(0, 3);
  const cityCoverage = dashboard ? Object.entries(dashboard.petsByCity) : [];
  const typeCoverage = dashboard ? Object.entries(dashboard.petsByType) : [];

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const user = await api.login(loginForm.email, loginForm.password);
      setCurrentUser(user);
      setActiveTab(getDefaultTab(user));
    } catch (e) { setError(e.message); }
  }

  async function handleRegister(event) {
    event.preventDefault();
    try {
      const user = await api.register(registerForm);
      setCurrentUser(user);
      setActiveTab(getDefaultTab(user));
    } catch (e) { setError(e.message); }
  }

  function handleLogout() { setCurrentUser(null); navigate("/login"); }

  async function handleCreateAppointment(event) {
    event.preventDefault();
    try {
      const created = await api.createAppointment({ ...appointmentForm, ownerId: currentUser.id });
      setOwnerAppointments(prev => [created, ...prev]);
      setAppointmentForm(emptyAppointmentForm);
    } catch (e) { setError(e.message); }
  }

  async function handleSendMessage() {
    if (!selectedAppointmentId || !messageDraft.trim()) return;
    try {
      await api.sendAppointmentMessage(selectedAppointmentId, { senderId: currentUser.id, message: messageDraft });
      setMessageDraft("");
      api.getAppointmentDetails(selectedAppointmentId).then(setAppointmentDetails);
    } catch (e) { setError(e.message); }
  }

  async function handleUpdateAppointmentStatus(event) {
    event.preventDefault();
    try {
      await api.updateAppointmentStatus(selectedAppointmentId, vetStatusForm);
      api.getAppointmentDetails(selectedAppointmentId).then(setAppointmentDetails);
    } catch (e) { setError(e.message); }
  }

  async function handleAdminRoleChange(userId, role) {
    api.updateAdminUserRole(userId, { role }).then(() => api.getAdminUsers().then(setAdminUsers));
  }

  async function handleAdminReportStatus(kind, id, status) {
    api.updateAdminReportStatus(kind, id, { status }).then(() => api.getAdminReports().then(setAdminReports));
  }

  async function handleCreateMedicalRecord(event) {
    event.preventDefault();
    api.createMedicalRecord({ ...medicalForm, petId: appointmentDetails.appointment.petId, vetId: currentUser.id })
      .then(() => { setMedicalForm(emptyMedicalForm); api.getPetDetails(appointmentDetails.appointment.petId).then(setPetDetails); });
  }

  async function handleCreateVaccination(event) {
    event.preventDefault();
    api.createVaccination({ ...vaccineForm, petId: appointmentDetails.appointment.petId, vetId: currentUser.id })
      .then(() => { setVaccineForm(emptyVaccineForm); api.getPetDetails(appointmentDetails.appointment.petId).then(setPetDetails); });
  }

  async function handleCreatePet(event) {
    event.preventDefault();
    api.createPet({ ...petForm, ownerId: currentUser.id }).then(() => { setPetForm(emptyPetForm); api.getPets().then(setPets); api.getAdoptions().then(setAdoptions); });
  }

  async function handleCreateLostReport(event) {
    event.preventDefault();
    api.createLostPet(lostForm).then(() => { setLostForm(emptyLostForm); api.getLostPets().then(setLostPets); });
  }

  async function handleCreateFoundReport(event) {
    event.preventDefault();
    api.createFoundPet(foundForm).then(() => { setFoundForm(emptyFoundForm); api.getFoundPets().then(setFoundPets); });
  }

  async function loadOwnerChat(listingId) {
    setOwnerChatListingId(listingId);
    api.getOwnerMessages(listingId).then(setOwnerMessages).catch(() => setOwnerMessages([]));
  }

  async function handleSendOwnerMessage(event) {
    event.preventDefault();
    if (!ownerMsgDraft.trim()) return;
    api.sendOwnerMessage({ adoptionListingId: ownerChatListingId, message: ownerMsgDraft }).then(() => {
        setOwnerMsgDraft("");
        loadOwnerChat(ownerChatListingId);
    });
  }

  if (!currentUser) {
    return (
      <div className="app-shell" style={{ gridTemplateColumns: "1fr" }}>
        <main className="main-content">
          <header className="hero" style={{ gridTemplateColumns: "1.2fr 420px", minHeight: "calc(100vh - 56px)", alignItems: "center" }}>
            <div className="hero-copy">
              <span className="kicker">{text.landing.kicker}</span>
              <h2>{text.landing.title}</h2>
              <p>{text.landing.subtitle}</p>
              <div className="hero-notes">
                <div><strong>{text.landing.roleOwner}</strong><span>{text.landing.roleOwnerDesc}</span></div>
                <div><strong>{text.landing.roleVet}</strong><span>{text.landing.roleVetDesc}</span></div>
                <div><strong>{text.landing.roleAdmin}</strong><span>{text.landing.roleAdminDesc}</span></div>
              </div>
            </div>

            <AuthPanel
              currentUser={currentUser} authMode={authMode} setAuthMode={setAuthMode}
              loginForm={loginForm} setLoginForm={setLoginForm}
              registerForm={registerForm} setRegisterForm={setRegisterForm}
              handleLogin={handleLogin} handleRegister={handleRegister} handleLogout={handleLogout}
              text={text} language={language} setLanguage={setLanguage}
            />
          </header>
          {error ? <div className="alert">{error}</div> : null}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-block">
          <p className="brand-mark">{text.shell.appName}</p>
          <h1>{text.shell.mainTitle}</h1>
          <p className="sidebar-copy">{text.shell.mainSubtitle}</p>
        </div>

        <nav className="tab-list">
          {tabs.map((tab) => (
            <Link key={tab.id} to={"/" + tab.id} className={location.pathname === "/" + tab.id || (location.pathname === "/" && tab.id === "home") ? "tab active" : "tab"} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-block">
          <span className="kicker">{text.common.quickSignIn}</span>
          <div className="credential-list">
            {demoCredentials.map((item) => (
              <button key={item.role} type="button" className="credential-chip" onClick={() => {
                setAuthMode("login");
                setLoginForm({ email: item.email, password: item.password });
              }}>
                <strong>{getLocalizedText(item.name, language)}</strong>
                <span>{item.email}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="hero">
          <div className="hero-copy">
            <span className="kicker">{text.common.workflow}</span>
            <h2>{text.shell.heroTitle}</h2>
            <p>{text.shell.heroSubtitle}</p>
            {dashboard ? (
              <div className="hero-notes">
                <div><strong>{dashboard.totalPets}</strong><span>{text.common.registeredPets}</span></div>
                <div><strong>{notifications.length}</strong><span>{text.common.notificationsForAccount}</span></div>
                <div><strong>{currentUser?.role ?? text.common.guest}</strong><span>{text.common.currentView}</span></div>
              </div>
            ) : null}
          </div>

          <AuthPanel
            currentUser={currentUser} authMode={authMode} setAuthMode={setAuthMode}
            loginForm={loginForm} setLoginForm={setLoginForm}
            registerForm={registerForm} setRegisterForm={setRegisterForm}
            handleLogin={handleLogin} handleRegister={handleRegister} handleLogout={handleLogout}
            text={text} language={language} setLanguage={setLanguage}
          />
        </header>

        {error ? <div className="alert">{error}</div> : null}

        {loading ? <div className="loading-state">{text.common.loading}</div> : (
          <Routes>
            <Route path="/home" element={<>
              <div className="content-grid">
                <div className="split-grid">
                  <SectionCard title={text.home.featuredTitle}>
                    <div className="pet-grid">
                      {featuredAdoptions.map((item) => (
                        <article key={item.id} className="pet-card">
                          <img src={item.photoUrl} alt={getLocalizedText(item.petName, language)} />
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
                          <div className="bar-track"><div className="bar-fill" style={{ width: \`\${(value / (dashboard?.totalPets || 1)) * 100}%\` }} /></div>
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
                      <select value={appointmentForm.petId} onChange={(event) => setAppointmentForm(c => ({ ...c, petId: event.target.value }))}>
                        <option value="">{text.common.selectPet}</option>
                        {ownPets.map(pet => <option key={pet.id} value={pet.id}>{getLocalizedText(pet.name, language)} | {pet.collarId}</option>)}
                      </select>
                      <select value={appointmentForm.vetId} onChange={(event) => setAppointmentForm(c => ({ ...c, vetId: event.target.value }))}>
                        <option value="">{text.common.selectVet}</option>
                        {vets.map(vet => <option key={vet.id} value={vet.id}>{getLocalizedText(vet.fullName, language)} | {vet.city}</option>)}
                      </select>
                      <input type="datetime-local" value={appointmentForm.preferredDateUtc} onChange={e => setAppointmentForm(c => ({ ...c, preferredDateUtc: e.target.value }))} />
                      <input type="text" placeholder={text.appointments.reasonPlaceholder} value={appointmentForm.reason} onChange={e => setAppointmentForm(c => ({ ...c, reason: e.target.value }))} />
                      <textarea value={appointmentForm.ownerNotes} placeholder={text.appointments.notesPlaceholder} onChange={e => setAppointmentForm(c => ({ ...c, ownerNotes: e.target.value }))} style={{ minHeight: 110, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                      <button type="submit">{text.appointments.sendRequest}</button>
                    </form>
                  </SectionCard>
                )}

                {currentUser?.role === "Vet" && (
                  <SectionCard title={text.appointments.vetCasesTitle}>
                    <div className="list-stack">
                      {vetAppointments.map(item => (
                        <article key={item.id} className="list-card" onClick={() => setSelectedAppointmentId(item.id)} style={{ cursor: "pointer" }}>
                          <strong>{getLocalizedText(item.petName, language)}</strong>
                          <p>{getLocalizedText(item.reason, language)}</p>
                          <div className="meta-line"><span>{getLocalizedText(item.ownerName, language)}</span><span>{text.appointments["status" + item.status] || item.status}</span></div>
                        </article>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {currentUser?.role === "User" && (
                  <SectionCard title={text.appointments.mineTitle}>
                    <div className="list-stack">
                      {ownerAppointments.map(item => (
                        <article key={item.id} className="list-card" onClick={() => setSelectedAppointmentId(item.id)} style={{ cursor: "pointer" }}>
                          <strong>{getLocalizedText(item.petName, language)}</strong>
                          <p>{getLocalizedText(item.reason, language)}</p>
                          <div className="meta-line"><span>{getLocalizedText(item.vetName, language)}</span><span>{text.appointments["status" + item.status] || item.status}</span></div>
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
                <SectionCard title={text.admin.summaryTitle}>
                  <div className="stats-grid">
                    <article className="stat-card"><strong>{adminSummary?.totalAppointments ?? 0}</strong><span>{text.admin.totalAppt}</span></article>
                    <article className="stat-card"><strong>{adminSummary?.pendingAppointments ?? 0}</strong><span>{text.admin.pendingAppt}</span></article>
                  </div>
                </SectionCard>
                <SectionCard title={text.admin.usersTitle}>
                    <div className="list-stack">
                      {adminUsers.map(item => (
                        <article key={item.id} className="list-card">
                          <strong>{getLocalizedText(item.fullName, language)}</strong>
                          <p>{item.email}</p>
                          <select value={item.role} onChange={e => handleAdminRoleChange(item.id, e.target.value)}>
                            <option value="User">{text.common.user}</option>
                            <option value="Vet">{text.common.vet}</option>
                            <option value="Admin">{text.common.admin}</option>
                          </select>
                        </article>
                      ))}
                    </div>
                </SectionCard>
            </> : null} />

            <Route path="/adoption" element={<>
              <div className="split-grid">
                {currentUser?.role === "User" ? (
                  <SectionCard title={text.adoption.addTitle}>
                    <form className="auth-form" onSubmit={handleCreatePet}>
                      <input type="text" placeholder={text.adoption.namePh} value={petForm.name} onChange={e => setPetForm(c => ({ ...c, name: e.target.value }))} />
                      <select value={petForm.type} onChange={e => setPetForm(c => ({ ...c, type: e.target.value }))}>
                        <option value="Cat">{text.petTypes.Cat}</option>
                        <option value="Dog">{text.petTypes.Dog}</option>
                        <option value="Bird">{text.petTypes.Bird}</option>
                        <option value="Rabbit">{text.petTypes.Rabbit}</option>
                        <option value="Hamster">{text.petTypes.Hamster}</option>
                        <option value="Turtle">{text.petTypes.Turtle}</option>
                        <option value="Other">{text.petTypes.Other}</option>
                      </select>
                      <input type="text" placeholder={text.adoption.breedPh} value={petForm.breed} onChange={e => setPetForm(c => ({ ...c, breed: e.target.value }))} />
                      <textarea value={petForm.description} placeholder={text.adoption.descPh} onChange={e => setPetForm(c => ({ ...c, description: e.target.value }))} />
                      <button type="submit">{text.common.savePet}</button>
                    </form>
                  </SectionCard>
                ) : null}

                <SectionCard title={text.adoption.listingsTitle}>
                  <div className="pet-grid">
                    {adoptions.map(item => (
                      <article key={item.id} className="pet-card">
                        <img src={item.photoUrl} alt={getLocalizedText(item.petName, language)} />
                        <div className="pet-card-body">
                          <h4>{getLocalizedText(item.petName, language)}</h4>
                          <p>{getLocalizedText(item.story, language)}</p>
                          <div className="meta-line">
                            <button onClick={() => loadOwnerChat(item.id)}>{language === "ar" ? "محادثة" : "Chat"}</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </>} />

            <Route path="/community" element={<>
              <div className="split-grid">
                <SectionCard title={text.community.lostTitle}>
                   <div className="list-stack">
                     {lostPets.map(item => (
                       <article key={item.id} className="community-card">
                         <strong>{getLocalizedText(item.petName, language)}</strong>
                         <p>{getLocalizedText(item.description, language)}</p>
                       </article>
                     ))}
                   </div>
                </SectionCard>
                <SectionCard title={text.community.foundTitle}>
                   <div className="list-stack">
                     {foundPets.map(item => (
                       <article key={item.id} className="community-card">
                         <strong>{text.petTypes[item.petType] || item.petType}</strong>
                         <p>{getLocalizedText(item.description, language)}</p>
                       </article>
                     ))}
                   </div>
                </SectionCard>
              </div>
            </>} />

            <Route path="/health" element={<>
              <SectionCard title={text.health.title}>
                <div className="list-stack">
                  {vaccines.map(item => (
                    <article key={item.id} className="list-card">
                      <strong>{getLocalizedText(item.petName, language)}</strong>
                      <p>{getLocalizedText(item.vaccineName, language)}</p>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </>} />

            <Route path="/registry" element={<>
               <SectionCard title={text.registry.title}>
                 <div className="search-row"><input type="search" placeholder={text.registry.searchPh} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                 <div className="registry-grid">
                   {filteredPets.map(pet => (
                     <article key={pet.id} className="registry-card">
                       <img src={pet.photoUrl} alt={getLocalizedText(pet.name, language)} />
                       <div>
                         <h4>{getLocalizedText(pet.name, language)}</h4>
                         <span>{text.petTypes[pet.type]} | {getLocalizedText(pet.breed, language)}</span>
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

function HomeRedirect({ currentUser }) {
  const navigate = useNavigate();
  useEffect(() => { navigate("/" + getDefaultTab(currentUser), { replace: true }); }, [currentUser]);
  return null;
}

export default App;
\`;

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", fullContent);
console.log("App.jsx has been FULLY RECONSTRUCTED and fixed!");
