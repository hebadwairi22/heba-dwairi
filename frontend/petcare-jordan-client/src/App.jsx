import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const baseTabs = [
  { id: "home", label: "Home" },
  { id: "adoption", label: "Adoption" },
  { id: "community", label: "Community" },
  { id: "health", label: "Health" },
  { id: "registry", label: "Registry" }
];

const demoCredentials = [
  { role: "Admin", email: "alaa@petcare.jo", password: "Pass123!" },
  { role: "Vet", email: "noor.vet@petcare.jo", password: "Pass123!" },
  { role: "Owner", email: "lina@petcare.jo", password: "Pass123!" }
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

import { translations, interpolate, formatDate, formatDateTime } from "./i18n";

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
        <strong>{currentUser ? currentUser.fullName : text.auth.signInPrompt}</strong>
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

function AppointmentChat({ details, currentUser, messageDraft, setMessageDraft, onSendMessage }) {
  if (!details) return <p className="empty-state">{text.common.selectAppointmentChat}</p>;
  return (
    <div className="list-stack">
      <article className="list-card">
        <strong>{details.appointment.petName}</strong>
        <p>{details.appointment.reason}</p>
        <div className="meta-line"><span>{details.appointment.ownerName}</span><span>{details.appointment.vetName}</span></div>
        <div className="meta-line"><span>{details.appointment.status}</span><span>{formatDateTime(details.appointment.preferredDateUtc, language)}</span></div>
        {details.appointment.ownerNotes ? <p>{text.common.ownerNote}: {details.appointment.ownerNotes}</p> : null}
        {details.appointment.vetNotes ? <p>{text.common.vetNote}: {details.appointment.vetNotes}</p> : null}
      </article>
      <div className="list-stack">
        {details.messages.map((item) => (
          <article key={item.id} className="list-card">
            <strong>{item.senderName}</strong>
            <p>{item.message}</p>
            <div className="meta-line"><span>{item.senderRole}</span><span>{formatDateTime(item.sentAtUtc, language)}</span></div>
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
    
  // Owner chat
  async function loadOwnerChat(listingId) {
    setOwnerChatListingId(listingId);
    try { const msgs = await api.getOwnerMessages(listingId); setOwnerMessages(msgs); } catch { setOwnerMessages([]); }
  }
  async function handleSendOwnerMessage(event) {
    event.preventDefault();
    if (!ownerMsgDraft.trim() || !ownerChatListingId) return;
    try { await api.sendOwnerMessage({ adoptionListingId: ownerChatListingId, message: ownerMsgDraft }); setOwnerMsgDraft(""); loadOwnerChat(ownerChatListingId); } catch { setError(text.errors?.messageSend || "Could not send message."); }
  }

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
        setError("Could not load the API. Start the backend, then refresh this page.");
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
      const target = `${pet.name} ${pet.breed} ${pet.city} ${pet.collarId}`.toLowerCase();
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
      localStorage.setItem("petcareCurrentUser", JSON.stringify(user));
      setCurrentUser(user);
      setActiveTab(getDefaultTab(user));
      setError("");
    } catch (loginError) {
      setError(loginError.message || "Login failed.");
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    try {
      const user = await api.register(registerForm);
      localStorage.setItem("petcareCurrentUser", JSON.stringify(user));
      setCurrentUser(user);
      setActiveTab(getDefaultTab(user));
      setRegisterForm(emptyRegisterForm);
      setError("");
    } catch (registerError) {
      setError(registerError.message || "Registration failed.");
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setAuthMode("login");
    setActiveTab("login");
  }

  async function handleCreateAppointment(event) {
    event.preventDefault();
    try {
      const created = await api.createAppointment({
        petId: Number(appointmentForm.petId),
        ownerId: currentUser.id,
        vetId: Number(appointmentForm.vetId),
        preferredDateUtc: appointmentForm.preferredDateUtc,
        reason: appointmentForm.reason,
        ownerNotes: appointmentForm.ownerNotes
      });
      setOwnerAppointments((current) => [created, ...current]);
      setSelectedAppointmentId(created.id);
      setAppointmentForm(emptyAppointmentForm);
      setActiveTab("appointments");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not create appointment.");
    }
  }

  async function handleSendMessage() {
    if (!selectedAppointmentId || !currentUser || !messageDraft.trim()) return;
    try {
      await api.sendAppointmentMessage(selectedAppointmentId, { senderId: currentUser.id, message: messageDraft });
      const refreshed = await api.getAppointmentDetails(selectedAppointmentId);
      setAppointmentDetails(refreshed);
      setMessageDraft("");
    } catch (requestError) {
      setError(requestError.message || "Could not send the message.");
    }
  }

  async function handleUpdateAppointmentStatus(event) {
    event.preventDefault();
    if (!selectedAppointmentId) return;
    try {
      const updated = await api.updateAppointmentStatus(selectedAppointmentId, vetStatusForm);
      setVetAppointments((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      const refreshed = await api.getAppointmentDetails(selectedAppointmentId);
      setAppointmentDetails(refreshed);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not update the appointment.");
    }
  }

  async function handleAdminRoleChange(userId, role) {
    try {
      const updated = await api.updateAdminUserRole(userId, { role });
      setAdminUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (currentUser?.id === updated.id) {
        setCurrentUser((current) => current ? { ...current, role: updated.role } : current);
      }
    } catch (requestError) {
      setError(requestError.message || "Could not update user role.");
    }
  }

  async function handleAdminReportStatus(reportKind, reportId, status) {
    try {
      const updated = await api.updateAdminReportStatus(reportKind.toLowerCase(), reportId, { status });
      setAdminReports((current) => current.map((item) => (
        item.id === updated.id && item.reportKind === updated.reportKind ? updated : item
      )));
    } catch (requestError) {
      setError(requestError.message || "Could not update report status.");
    }
  }

  async function handleCreateMedicalRecord(event) {
    event.preventDefault();
    if (!appointmentDetails || !currentUser) return;

    try {
      await api.createMedicalRecord({
        petId: appointmentDetails.appointment.petId,
        vetId: currentUser.id,
        visitReason: medicalForm.visitReason,
        diagnosis: medicalForm.diagnosis,
        treatment: medicalForm.treatment,
        visitDateUtc: medicalForm.visitDateUtc
      });

      const refreshedPet = await api.getPetDetails(appointmentDetails.appointment.petId);
      setPetDetails(refreshedPet);
      setMedicalForm(emptyMedicalForm);
    } catch (requestError) {
      setError(requestError.message || "Could not create the medical record.");
    }
  }

  async function handleCreateVaccination(event) {
    event.preventDefault();
    if (!appointmentDetails || !currentUser) return;

    try {
      await api.createVaccination({
        petId: appointmentDetails.appointment.petId,
        vetId: currentUser.id,
        vaccineName: vaccineForm.vaccineName,
        givenOnUtc: vaccineForm.givenOnUtc || null,
        dueDateUtc: vaccineForm.dueDateUtc,
        isCompleted: vaccineForm.isCompleted
      });

      const refreshedPet = await api.getPetDetails(appointmentDetails.appointment.petId);
      setPetDetails(refreshedPet);
      setVaccineForm(emptyVaccineForm);
    } catch (requestError) {
      setError(requestError.message || "Could not create the vaccination record.");
    }
  }

  async function handleCreatePet(event) {
    event.preventDefault();
    if (!currentUser) return;

    try {
      await api.createPet({
        ...petForm,
        ageInMonths: Number(petForm.ageInMonths),
        weightKg: Number(petForm.weightKg),
        ownerId: currentUser.id
      });

      const refreshedPets = await api.getPets();
      const refreshedAdoptions = await api.getAdoptions();
      setPets(refreshedPets);
      setAdoptions(refreshedAdoptions);
      setPetForm(emptyPetForm);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not add the pet.");
    }
  }

  async function handleCreateLostReport(event) {
    event.preventDefault();
    try {
      const created = await api.createLostPet({
        ...lostForm,
        approximateAgeInMonths: Number(lostForm.approximateAgeInMonths),
        rewardAmount: lostForm.rewardAmount ? Number(lostForm.rewardAmount) : null
      });
      setLostPets((current) => [created, ...current]);
      setLostForm(emptyLostForm);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not create the lost pet report.");
    }
  }

  async function handleCreateFoundReport(event) {
    event.preventDefault();
    try {
      const created = await api.createFoundPet(foundForm);
      setFoundPets((current) => [created, ...current]);
      setFoundForm(emptyFoundForm);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not create the found pet report.");
    }
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
              currentUser={currentUser}
              authMode={authMode}
              setAuthMode={setAuthMode}
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              registerForm={registerForm}
              setRegisterForm={setRegisterForm}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
              handleLogout={handleLogout}
              text={text}
              language={language}
              setLanguage={setLanguage}
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
                <strong>{item.role}</strong>
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
            currentUser={currentUser}
            authMode={authMode}
            setAuthMode={setAuthMode}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            handleLogout={handleLogout}
            text={text}
            language={language}
            setLanguage={setLanguage}
          />
        </header>

        {error ? <div className="alert">{error}</div> : null}
        {loading ? <div className="section-card">{text.common.loadingData}</div> : null}

        {!loading && dashboard ? (
          <Routes>
            <Route path="/home" element={<>
              <div className="content-grid">
                <SectionCard title={text.home.overviewTitle}>
                  <div className="stats-grid">
                    <article className="stat-card"><strong>{dashboard.totalUsers}</strong><span>{text.common.ownersAndAdmins}</span></article>
                    <article className="stat-card"><strong>{dashboard.totalVets}</strong><span>{text.common.veterinarians}</span></article>
                    <article className="stat-card"><strong>{dashboard.upcomingVaccines}</strong><span>{text.common.upcomingVaccines}</span></article>
                    <article className="stat-card"><strong>{dashboard.petsForAdoption}</strong><span>{text.common.adoptionCases}</span></article>
                  </div>
                </SectionCard>

                <div className="split-grid">
                  <SectionCard title={text.home.adoptionsTitle}>
                    <div className="mini-card-list">
                      {featuredAdoptions.map((item) => (
                        <article key={item.id} className="mini-card">
                          <img src={item.photoUrl} alt={item.petName} />
                          <div>
                            <strong>{item.petName}</strong>
                            <p>{item.story}</p>
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
                          <span>{label}</span>
                          <div className="bar-track"><div className="bar-fill" style={{ width: `${(value / dashboard.totalPets) * 100}%` }} /></div>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>
            </>} />
            <Route path="/appointments" element={currentUser?.role === "User" ? <>
              <div className="split-grid">
                <SectionCard title={text.appointments.requestTitle}>
                  <form className="auth-form" onSubmit={handleCreateAppointment}>
                    <select value={appointmentForm.petId} onChange={(event) => setAppointmentForm((current) => ({ ...current, petId: event.target.value }))}>
                      <option value="">{text.common.selectPet}</option>
                      {ownPets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} | {pet.collarId}</option>)}
                    </select>
                    <select value={appointmentForm.vetId} onChange={(event) => setAppointmentForm((current) => ({ ...current, vetId: event.target.value }))}>
                      <option value="">{text.common.selectVet}</option>
                      {vets.map((vet) => <option key={vet.id} value={vet.id}>{vet.fullName} | {vet.city}</option>)}
                    </select>
                    <input type="datetime-local" value={appointmentForm.preferredDateUtc} onChange={(event) => setAppointmentForm((current) => ({ ...current, preferredDateUtc: event.target.value }))} />
                    <input type="text" placeholder={text.appointments.reasonPlaceholder} value={appointmentForm.reason} onChange={(event) => setAppointmentForm((current) => ({ ...current, reason: event.target.value }))} />
                    <textarea value={appointmentForm.ownerNotes} placeholder={text.appointments.notesPlaceholder} onChange={(event) => setAppointmentForm((current) => ({ ...current, ownerNotes: event.target.value }))} style={{ minHeight: 110, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                    <button type="submit">{text.appointments.sendRequest}</button>
                  </form>
                </SectionCard>

                <SectionCard title={text.appointments.mineTitle}>
                  <div className="list-stack">
                    {ownerAppointments.map((item) => (
                      <article key={item.id} className="list-card" onClick={() => setSelectedAppointmentId(item.id)} style={{ cursor: "pointer" }}>
                        <strong>{item.petName}</strong>
                        <p>{item.reason}</p>
                        <div className="meta-line"><span>{item.vetName}</span><span>{item.status}</span></div>
                        <div className="meta-line"><span>{formatDateTime(item.preferredDateUtc, language)}</span><span>{interpolate(text.common.messagesCount, {n: item.messageCount})}</span></div>
                      </article>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title={text.appointments.chatTitle}>
                  <AppointmentChat details={appointmentDetails} currentUser={currentUser} messageDraft={messageDraft} setMessageDraft={setMessageDraft} onSendMessage={handleSendMessage} />
                </SectionCard>
              </div>
            </> : null} />
            <Route path="/appointments" element={currentUser?.role === "Vet" ? <>
              <div className="split-grid">
                <SectionCard title={text.appointments.vetCasesTitle}>
                  <div className="list-stack">
                    {vetAppointments.map((item) => (
                      <article key={item.id} className="list-card" onClick={() => setSelectedAppointmentId(item.id)} style={{ cursor: "pointer" }}>
                        <strong>{item.petName}</strong>
                        <p>{item.reason}</p>
                        <div className="meta-line"><span>{item.ownerName}</span><span>{item.status}</span></div>
                        <div className="meta-line"><span>{formatDateTime(item.preferredDateUtc, language)}</span><span>{interpolate(text.common.messagesCount, {n: item.messageCount})}</span></div>
                      </article>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title={text.appointments.statusTitle}>
                  {appointmentDetails ? (
                    <form className="auth-form" onSubmit={handleUpdateAppointmentStatus}>
                      <select value={vetStatusForm.status} onChange={(event) => setVetStatusForm((current) => ({ ...current, status: event.target.value }))}>
                        <option value="Pending">{text.appointments.statusPending}</option>
                        <option value="Confirmed">{text.appointments.statusConfirmed}</option>
                        <option value="InProgress">{text.appointments.statusInProgress}</option>
                        <option value="Completed">{text.appointments.statusCompleted}</option>
                        <option value="Cancelled">{text.appointments.statusCancelled}</option>
                      </select>
                      <textarea value={vetStatusForm.vetNotes} placeholder={text.appointments.vetNotesPlaceholder} onChange={(event) => setVetStatusForm((current) => ({ ...current, vetNotes: event.target.value }))} style={{ minHeight: 120, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                      <button type="submit">{text.common.updateAppointment}</button>
                    </form>
                  ) : <p className="empty-state">{text.common.selectCaseFirst}</p>}
                </SectionCard>

                <SectionCard title={text.appointments.chatTitle}>
                  <AppointmentChat details={appointmentDetails} currentUser={currentUser} messageDraft={messageDraft} setMessageDraft={setMessageDraft} onSendMessage={handleSendMessage} />
                </SectionCard>

                <SectionCard title={text.appointments.medicalHistoryTitle}>
                  {petDetails ? (
                    <div className="list-stack">
                      {petDetails.medicalHistory.map((item) => (
                        <article key={item.id} className="list-card">
                          <strong>{item.visitReason}</strong>
                          <p>{item.diagnosis}</p>
                          <div className="meta-line"><span>{item.vetName}</span><span>{formatDate(item.visitDateUtc, language)}</span></div>
                          <span>{item.treatment}</span>
                        </article>
                      ))}
                      {petDetails.medicalHistory.length === 0 ? <p className="empty-state">{text.common.noMedicalHistory}</p> : null}
                    </div>
                  ) : <p className="empty-state">{text.common.selectCaseFirst}</p>}
                </SectionCard>

                <SectionCard title={text.appointments.addMedicalTitle}>
                  {petDetails ? (
                    <form className="auth-form" onSubmit={handleCreateMedicalRecord}>
                      <input type="text" placeholder={text.appointments.visitReasonPh} value={medicalForm.visitReason} onChange={(event) => setMedicalForm((current) => ({ ...current, visitReason: event.target.value }))} />
                      <input type="text" placeholder={text.appointments.diagnosisPh} value={medicalForm.diagnosis} onChange={(event) => setMedicalForm((current) => ({ ...current, diagnosis: event.target.value }))} />
                      <textarea value={medicalForm.treatment} placeholder={text.appointments.treatmentPh} onChange={(event) => setMedicalForm((current) => ({ ...current, treatment: event.target.value }))} style={{ minHeight: 110, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                      <input type="datetime-local" value={medicalForm.visitDateUtc} onChange={(event) => setMedicalForm((current) => ({ ...current, visitDateUtc: event.target.value }))} />
                      <button type="submit">{text.common.addMedicalRecord}</button>
                    </form>
                  ) : <p className="empty-state">{text.common.selectCaseFirst}</p>}
                </SectionCard>

                <SectionCard title={text.appointments.vaccinesTitle}>
                  {petDetails ? (
                    <div className="list-stack">
                      {petDetails.vaccines.map((item) => (
                        <article key={item.id} className="list-card">
                          <strong>{item.vaccineName}</strong>
                          <p>{item.isCompleted ? text.common.completed : text.common.pending}</p>
                          <div className="meta-line"><span>{item.vetName}</span><span>{text.common.due} {formatDate(item.dueDateUtc, language)}</span></div>
                        </article>
                      ))}
                      {petDetails.vaccines.length === 0 ? <p className="empty-state">{text.common.noVaccinesRecorded}</p> : null}
                    </div>
                  ) : <p className="empty-state">{text.common.selectCaseFirst}</p>}
                </SectionCard>

                <SectionCard title={text.appointments.addVaccineTitle}>
                  {petDetails ? (
                    <form className="auth-form" onSubmit={handleCreateVaccination}>
                      <input type="text" placeholder={text.appointments.vaccineNamePh} value={vaccineForm.vaccineName} onChange={(event) => setVaccineForm((current) => ({ ...current, vaccineName: event.target.value }))} />
                      <input type="datetime-local" value={vaccineForm.givenOnUtc} onChange={(event) => setVaccineForm((current) => ({ ...current, givenOnUtc: event.target.value }))} />
                      <input type="datetime-local" value={vaccineForm.dueDateUtc} onChange={(event) => setVaccineForm((current) => ({ ...current, dueDateUtc: event.target.value }))} />
                      <label style={{ color: "#5d6b78", display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" checked={vaccineForm.isCompleted} onChange={(event) => setVaccineForm((current) => ({ ...current, isCompleted: event.target.checked }))} />
                        {text.appointments.markCompleted}
                      </label>
                      <button type="submit">{text.common.addVaccination}</button>
                    </form>
                  ) : <p className="empty-state">{text.common.selectCaseFirst}</p>}
                </SectionCard>
              </div>
            </> : null} />
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
                        <strong>{item.petName}</strong>
                        <p>{item.reason}</p>
                        <div className="meta-line"><span>{item.ownerName}</span><span>{item.vetName}</span></div>
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
                          <strong>{item.fullName}</strong>
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
                        <article key={`${item.reportKind}-${item.id}`} className="list-card">
                          <strong>{item.reportKind} | {item.title}</strong>
                          <p>{item.description}</p>
                          <div className="meta-line"><span>{item.place}</span><span>{formatDate(item.reportDateUtc, language)}</span></div>
                          <div className="meta-line"><span>{item.contactName}</span><span>{item.contactPhone}</span></div>
                          <select value={item.status} onChange={(event) => handleAdminReportStatus(item.reportKind, item.id, event.target.value)}>
                            <option value="Active">{text.admin.reportActive}</option>
                            <option value="Resolved">{text.admin.reportResolved}</option>
                          </select>
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
                        <img src={item.photoUrl} alt={item.petName} />
                        <div className="pet-card-body">
                          <div className="pet-card-head">
                            <div>
                              <h4>{item.petName}</h4>
                              <span>{item.petType} | {item.breed}</span>
                            </div>
                            <span className={item.status === "Available" ? "pill success" : "pill warning"}>{item.status === "Available" ? text.adoption.statusAvailable : text.adoption.statusPending}</span>
                          </div>
                          <p>{item.story}</p>
                          <div className="meta-line"><span>{item.city}</span><button type="button" onClick={() => alert(text.adoption.adoptContact + "\n\n" + item.contactDetails)} style={{padding:"6px 14px",fontSize:"0.85rem",background:"rgba(59,130,246,0.1)",color:"#3b82f6",borderRadius:"8px",fontWeight:"bold"}}>{text.adoption.adoptBtn}</button><button type="button" onClick={() => loadOwnerChat(item.id)} style={{padding:"6px 14px",fontSize:"0.85rem",background:"rgba(16,185,129,0.1)",color:"#10b981",borderRadius:"8px",fontWeight:"bold"}}>{language === "ar" ? "محادثة" : "Chat"}</button></div>
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
                        <img src={item.photoUrl} alt={item.petName} />
                        <div>
                          <strong>{item.petName}</strong>
                          <p>{item.description}</p>
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
                        <img src={item.photoUrl} alt={item.petType} />
                        <div>
                          <strong>{item.petType}</strong>
                          <p>{item.description}</p>
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
                      <strong>{item.petName}</strong>
                      <p>{item.vaccineName}</p>
                      <div className="meta-line"><span>{item.ownerName}</span><span>{item.ownerPhone}</span></div>
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
                      <img src={pet.photoUrl} alt={pet.name} />
                      <div>
                        <div className="pet-card-head">
                          <div>
                            <h4>{pet.name}</h4>
                            <span>{pet.type} | {pet.breed}</span>
                          </div>
                          <span className="registry-code">{pet.collarId}</span>
                        </div>
                        <p>{pet.ownerName}</p>
                        <div className="meta-line"><span>{pet.city}</span><span>{pet.adoptionStatus ?? text.common.notListedForAdoption}</span></div>
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </>} />
            <Route path="*" element={<HomeRedirect currentUser={currentUser} />} />
          </Routes>
        ) : null}
      </main>
    </div>
  );
}

export default App;

function HomeRedirect({ currentUser }) { const navigate = useNavigate(); useEffect(() => { navigate("/" + getDefaultTab(currentUser), { replace: true }); }, [currentUser, navigate]); return null; }
