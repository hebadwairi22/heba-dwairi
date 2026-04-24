import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
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
  { role: "admin", email: "yaqeen@petcare.jo", pass: "Pass123!", name: "يقين | Yaqeen" },
  { role: "vet", email: "safaa.vet@petcare.jo", pass: "Pass123!", name: "د. صفاء | Dr. Safaa" },
  { role: "owner", email: "karam@petcare.jo", pass: "Pass123!", name: "كرم | Karam" }
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
const CHAT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function renderChatMessageBody(item, imageClassName = "chat-message-image") {
  const hasText = Boolean(item.message?.trim());
  const hasImage = Boolean(item.imageDataUrl);

  return (
    <>
      {hasText ? <p>{item.message}</p> : null}
      {hasImage ? <img className={imageClassName} src={item.imageDataUrl} alt="Chat attachment" /> : null}
    </>
  );
}

function getTabs(currentUser, t) {
  if (!currentUser) return baseTabs;
  if (currentUser.role === "Vet") return [{ id: "chatting", label: t.tabs.chatting }, { id: "health", label: t.tabs.health }, { id: "registry", label: t.tabs.registry }, { id: "community", label: t.tabs.community }];
  if (currentUser.role === "Admin") return [{ id: "admin", label: t.tabs.admin }, { id: "chatting", label: t.tabs.chatting }, { id: "community", label: t.tabs.community }, { id: "registry", label: t.tabs.registry }, { id: "adoption", label: t.tabs.adoption }];
  return [
    { id: "start-chat", label: t.tabs.startChat },
    { id: "home", label: t.tabs.home },
    { id: "adoption", label: t.tabs.adoption },
    { id: "community", label: t.tabs.community },
    { id: "health", label: t.tabs.health },
    { id: "registry", label: t.tabs.registry },
    { id: "chatting", label: t.tabs.chatting }
  ];
}

function getDefaultTab(currentUser) {
  if (!currentUser) return "login";
  if (currentUser.role === "Vet") return "chatting";
  if (currentUser.role === "Admin") return "admin";
  return "start-chat";
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

function AppointmentChat({ details, currentUser, messageDraft, setMessageDraft, onSendMessage, quickReplies, language, getLocalizedText, text, formatDateTime }) {
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
      {quickReplies?.length ? (
        <div className="quick-replies">
          {quickReplies.map((reply) => (
            <button key={reply} type="button" className="secondary-button" onClick={() => setMessageDraft(reply)}>
              {reply}
            </button>
          ))}
        </div>
      ) : null}
      <div className="list-stack">
        {details.messages.length === 0 ? <p className="empty-state compact">{language === "ar" ? "ابدأ المحادثة مع الدكتور من هنا." : "Start the conversation with the vet from here."}</p> : null}
        {details.messages.map((item) => (
          <article key={item.id} className="list-card">
            <strong>{getLocalizedText(item.senderName, language)}</strong>
            <div className="chat-message-body">
              {renderChatMessageBody(item)}
            </div>
            <div className="meta-line"><span>{text.common[item.senderRole.toLowerCase()] || item.senderRole}</span><span>{formatDateTime(item.sentAtUtc, language)}</span></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ModernAppointmentChat({ details, currentUser, messageDraft, setMessageDraft, messageImageDraft, onPickImage, onClearImage, onSendMessage, quickReplies, language, getLocalizedText, text, formatDateTime, variant = "full", onClose, noticeMessage = "", fallbackCounterpartName = "" }) {
  const [composeLanguage, setComposeLanguage] = useState(language === "ar" ? "ar" : "en");

  if (!details && variant !== "inline") {
    return (
      <div className="chat-empty-state modern">
        <strong>{language === "ar" ? "اختر دكتور أو محادثة لبدء المتابعة" : "Choose a doctor or conversation to begin"}</strong>
        <p>{text.common.selectAppointmentChat}</p>
      </div>
    );
  }

  const counterpartName = details
    ? currentUser?.role === "Vet"
      ? getLocalizedText(details.appointment.ownerName, language)
      : getLocalizedText(details.appointment.vetName, language)
    : fallbackCounterpartName;

  const counterpartRole = currentUser?.role === "Vet"
    ? (language === "ar" ? "صاحب الحيوان" : "Pet owner")
    : (language === "ar" ? "الطبيب البيطري" : "Veterinarian");

  if (variant === "inline") {
    return (
      <div className="inline-chat-panel">
        {details?.messages?.length ? (
          <div className="inline-message-list">
            {details.messages.map((item) => {
              const senderLabel = getLocalizedText(item.senderName, language);
              return (
                <div key={item.id} className="inline-message-item">
                  <strong>{senderLabel}</strong>
                  <div className="chat-message-body inline">
                    {renderChatMessageBody(item, "chat-message-image inline")}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="chat-inline-placeholder">
            <strong>{language === "ar" ? "لا توجد رسائل لعرضها" : "No messages to display"}</strong>
          </div>
        )}
        {messageImageDraft ? (
          <div className="inline-chat-image-preview">
            <img src={messageImageDraft} alt="Selected chat attachment" />
            <button type="button" className="inline-chat-image-clear" onClick={onClearImage}>×</button>
          </div>
        ) : null}
        <form className="inline-chat-form" onSubmit={(event) => { event.preventDefault(); onSendMessage(); }}>
          <label className="inline-chat-attach">
            <input type="file" accept="image/*" className="inline-chat-file-input" onChange={onPickImage} />
            {language === "ar" ? "صورة +" : "Image +"}
          </label>
          <input
            className={composeLanguage === "ar" ? "inline-chat-input is-rtl" : "inline-chat-input is-ltr"}
            type="text"
            value={messageDraft}
            dir={composeLanguage === "ar" ? "rtl" : "ltr"}
            lang={composeLanguage}
            placeholder={composeLanguage === "ar" ? `اكتب رسالة إلى ${counterpartName}` : `Send a message to ${counterpartName}`}
            onChange={(event) => setMessageDraft(event.target.value)}
          />
          <div className="inline-chat-toggle-group">
            <button
              type="button"
              className={composeLanguage === "ar" ? "inline-chat-toggle active" : "inline-chat-toggle"}
              onClick={() => setComposeLanguage("ar")}
            >
              AR
            </button>
            <button
              type="button"
              className={composeLanguage === "en" ? "inline-chat-toggle active" : "inline-chat-toggle"}
              onClick={() => setComposeLanguage("en")}
            >
              EN
            </button>
          </div>
          <button type="submit" className="inline-chat-send" disabled={!messageDraft.trim() && !messageImageDraft}>
            {language === "ar" ? "إرسال" : "Send"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-shell">
      <div className="chat-topbar">
        <div className="chat-persona">
          <div className="chat-avatar">{counterpartName?.charAt(0) || "D"}</div>
          <div>
            <strong>{counterpartName}</strong>
            <p>{counterpartRole}</p>
          </div>
        </div>
        <div className="chat-session-meta">
          <span>{getLocalizedText(details.appointment.petName, language)}</span>
          <span>{text.appointments["status" + details.appointment.status] || details.appointment.status}</span>
          <span>{formatDateTime(details.appointment.preferredDateUtc, language)}</span>
        </div>
      </div>
      <div className="chat-case-banner">
        <strong>{getLocalizedText(details.appointment.reason, language)}</strong>
        {details.appointment.ownerNotes ? <p>{text.common.ownerNote}: {getLocalizedText(details.appointment.ownerNotes, language)}</p> : null}
        {details.appointment.vetNotes ? <p>{text.common.vetNote}: {getLocalizedText(details.appointment.vetNotes, language)}</p> : null}
      </div>
      {quickReplies?.length ? (
        <div className="quick-replies modern">
          {quickReplies.map((reply) => (
            <button key={reply} type="button" className="secondary-button dark" onClick={() => setMessageDraft(reply)}>
              {reply}
            </button>
          ))}
        </div>
      ) : null}
      <div className="chat-messages modern">
        {details.messages.length === 0 ? <p className="empty-state compact dark">{language === "ar" ? "ابدأ المحادثة مع الدكتور من هنا." : "Start the conversation with the vet from here."}</p> : null}
        {details.messages.map((item) => {
          const isMine = item.senderId === currentUser?.id;
          return (
            <div key={item.id} className={isMine ? "msg-wrapper mine" : "msg-wrapper theirs"}>
              <div className={isMine ? "msg-bubble mine" : "msg-bubble theirs"}>
                <strong>{getLocalizedText(item.senderName, language)}</strong>
                <div className="chat-message-body modern">
                  {renderChatMessageBody(item)}
                </div>
                <div className="msg-meta">
                  <span>{text.common[item.senderRole.toLowerCase()] || item.senderRole}</span>
                  <span>{formatDateTime(item.sentAtUtc, language)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {noticeMessage ? <p className="inline-chat-notice chat-notice-modern">{noticeMessage}</p> : null}
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
  const [adminAppointments, setAdminAppointments] = useState([]);
  const [adminSummary, setAdminSummary] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [selectedVetId, setSelectedVetId] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [chatNotice, setChatNotice] = useState("");
  const [showInlineChatComposer, setShowInlineChatComposer] = useState(false);
  const [messageImageDraft, setMessageImageDraft] = useState("");
  const [vetMessageCounts, setVetMessageCounts] = useState({});
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState({});
  const [petDetails, setPetDetails] = useState(null);
  const chatFocusRef = useRef(null);
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
  const [loginForm, setLoginForm] = useState({ email: demoCredentials[0].email, password: demoCredentials[0].pass });
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const text = translations[language];
  const tabs = useMemo(() => getTabs(currentUser, text), [currentUser, text]);
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const chatRouteAppointmentId = pathSegments[0] === "chatting" && pathSegments[1] ? Number(pathSegments[1]) : null;
  const isChatConversationPage = Number.isInteger(chatRouteAppointmentId) && chatRouteAppointmentId > 0;
  const remoteChatLabel = language === "ar" ? "ما قدرت توصل للعيادة؟" : "Can't reach the clinic?";
  const remoteChatHint = language === "ar" ? "افتح المحادثة مع الطبيب وأرسل تحديثك مباشرة." : "Open the vet chat and send your update right away.";
  const openChatLabel = language === "ar" ? "فتح الشات" : "Open chat";
  const remoteChatActionLabel = language === "ar" ? "التواصل مع الدكتور" : "Message the vet";
  const remoteChatEmptyState = language === "ar" ? "احجز موعدًا أو افتح موعدًا موجودًا حتى تبدأ المحادثة مع الدكتور." : "Book or open an appointment first to start chatting with the vet.";
  const remoteQuickReplies = language === "ar"
    ? [
        "مرحبا دكتور، ما قدرت أوصل للعيادة. ممكن نكمل المتابعة هون بالشات؟",
        "أنا متأخر بالطريق وما رح أقدر أوصل بموعدي. شو بتنصحني أعمل الآن؟",
        "ممكن نحول الموعد لمتابعة كتابية مؤقتًا لحد ما أقدر أوصل؟"
      ]
    : [
        "Hello doctor, I could not make it to the clinic. Can we continue here in chat?",
        "I am delayed and will miss the appointment. What do you recommend I do now?",
        "Can we switch this visit to a written follow-up until I can arrive?"
      ];
  const appointmentHubTitle = language === "ar" ? "غرف المحادثة" : "Chat Rooms";
  const doctorListTitle = language === "ar" ? "الأطباء المتاحون" : "Available Vets";
  const doctorListHint = language === "ar" ? "اختر الطبيب الذي تريد بدء المحادثة معه." : "Choose the veterinarian you want to chat with.";
  const conversationListTitle = language === "ar" ? "المحادثات الحالية" : "Current Conversations";
  const conversationListHint = language === "ar" ? "كل دكتور له محادثاته الخاصة." : "Each doctor has their own conversation thread.";
  const startChatLabel = language === "ar" ? "ابدأ شات" : "Start Chat";
  const noDoctorChatsLabel = language === "ar" ? "لا توجد محادثات مع هذا الدكتور بعد." : "No conversations with this vet yet.";
  const activeNowLabel = language === "ar" ? "متاح الآن" : "Available now";

  useEffect(() => {
    localStorage.setItem("petcareLanguage", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    if (!tabs.some((item) => item.id === activeTab)) setActiveTab(tabs[0].id);
  }, [tabs, activeTab]);

  useEffect(() => {
    if (!currentUser) {
      setDismissedNotificationIds({});
      return;
    }

    const storageKey = `petcareDismissedChatNotifications:${currentUser.id}`;
    const stored = localStorage.getItem(storageKey);
    setDismissedNotificationIds(stored ? JSON.parse(stored) : {});
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`petcareDismissedChatNotifications:${currentUser.id}`, JSON.stringify(dismissedNotificationIds));
  }, [currentUser, dismissedNotificationIds]);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Use allSettled to prevent one failing endpoint from crashing the entire app
        const results = await Promise.allSettled([
          api.getDashboard(),
          api.getPets(),
          api.getAdoptions(),
          api.getLostPets(),
          api.getFoundPets(),
          api.getUpcomingVaccines(),
          api.getVets()
        ]);

        const [dashboardData, petsData, adoptionData, lostData, foundData, vaccineData, vetUsers] = results.map(res => 
          res.status === "fulfilled" ? res.value : null
        );

        setDashboard(dashboardData);
        setPets(petsData || []);
        setAdoptions(adoptionData || []);
        setLostPets(lostData || []);
        setFoundPets(foundData || []);
        setVaccines(vaccineData || []);
        setVets(vetUsers || []);
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
      setAdminAppointments([]);
      setAdminSummary(null);
      setAppointmentDetails(null);
      setPetDetails(null);
      setSelectedAppointmentId(null);
      setShowInlineChatComposer(false);
      setMessageImageDraft("");
      setShowBellMenu(false);
      setDismissedNotificationIds({});
      setChatNotice("");
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
      api.getVets()
        .then(async (vetUsers) => {
          setVets(vetUsers || []);
          const appointmentGroups = await Promise.all(
            (vetUsers || []).map((vet) => api.getVetAppointments(vet.id).catch(() => []))
          );
          const mergedAppointments = appointmentGroups.flat().sort((a, b) => new Date(b.updatedAtUtc || b.createdAtUtc) - new Date(a.updatedAtUtc || a.createdAtUtc));
          setAdminAppointments(mergedAppointments);
        })
        .catch(() => setAdminAppointments([]));
    }
  }, [currentUser, selectedAppointmentId]);

  async function loadAppointmentDetails(appointmentId, { includePet = true } = {}) {
    const data = await api.getAppointmentDetails(appointmentId);
    setAppointmentDetails(data);
    setVetStatusForm({ status: data.appointment.status, vetNotes: data.appointment.vetNotes || "" });

    if (includePet) {
      const pet = await api.getPetDetails(data.appointment.petId);
      setPetDetails(pet);
    }

    return data;
  }

  useEffect(() => {
    if (!selectedAppointmentId) {
      setAppointmentDetails(null);
      setPetDetails(null);
      return;
    }

    loadAppointmentDetails(selectedAppointmentId).catch(() => {
      setAppointmentDetails(null);
      setPetDetails(null);
    });
  }, [selectedAppointmentId]);

  useEffect(() => {
    if (!selectedAppointmentId || !currentUser) return undefined;

    const intervalId = window.setInterval(() => {
      loadAppointmentDetails(selectedAppointmentId, { includePet: false }).catch(() => {});
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [selectedAppointmentId, currentUser]);

  useEffect(() => {
    if (!["User", "Admin"].includes(currentUser?.role)) return;
    if (!vets.length) return;
    if (!selectedVetId || !vets.some((item) => item.id === selectedVetId)) {
      setSelectedVetId(vets[0].id);
    }
  }, [currentUser, vets, selectedVetId]);

  useEffect(() => {
    if (!["User", "Admin"].includes(currentUser?.role) || !selectedVetId) return;
    const sourceAppointments = currentUser?.role === "Admin" ? adminAppointments : ownerAppointments;
    const doctorThreads = sourceAppointments.filter((item) => item.vetId === selectedVetId);
    if (!doctorThreads.length) return;
    if (!selectedAppointmentId || !doctorThreads.some((item) => item.id === selectedAppointmentId)) {
      const latestThread = [...doctorThreads].sort((a, b) => new Date(b.updatedAtUtc || b.createdAtUtc) - new Date(a.updatedAtUtc || a.createdAtUtc))[0];
      setSelectedAppointmentId(latestThread.id);
    }
  }, [currentUser, ownerAppointments, adminAppointments, selectedVetId, selectedAppointmentId]);

  useEffect(() => {
    if (["User", "Admin"].includes(currentUser?.role) && appointmentDetails?.appointment?.vetId) {
      setSelectedVetId(appointmentDetails.appointment.vetId);
    }
  }, [currentUser, appointmentDetails]);

  useEffect(() => {
    if (currentUser?.role !== "Vet" || !vetAppointments.length) {
      setVetMessageCounts({});
      return;
    }

    let cancelled = false;

    Promise.all(
      vetAppointments.map(async (item) => {
        try {
          const data = await api.getAppointmentDetails(item.id);
          const incomingCount = (data.messages || []).filter((message) => message.senderId !== currentUser.id).length;
          return [item.id, incomingCount];
        } catch {
          return [item.id, 0];
        }
      })
    ).then((entries) => {
      if (!cancelled) {
        setVetMessageCounts(Object.fromEntries(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentUser, vetAppointments]);

  useEffect(() => {
    if (isChatConversationPage && chatRouteAppointmentId && selectedAppointmentId !== chatRouteAppointmentId) {
      setSelectedAppointmentId(chatRouteAppointmentId);
    }
  }, [isChatConversationPage, chatRouteAppointmentId, selectedAppointmentId]);

  useEffect(() => {
    if (!appointmentDetails) return;

    const timer = window.setTimeout(() => {
      chatFocusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [appointmentDetails]);

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const name = pet.name || pet.Name || "";
      const breed = pet.breed || pet.Breed || "";
      const city = pet.city || pet.City || "";
      const collarId = pet.collarId || pet.CollarId || "";
      const target = `${name} ${breed} ${city} ${collarId}`.toLowerCase();
      return target.includes(searchTerm.toLowerCase());
    });
  }, [pets, searchTerm]);

  const ownPets = useMemo(() => {
    return pets.filter((pet) => {
      const ownerId = pet.ownerId || pet.OwnerId;
      return ownerId?.toString() === currentUser?.id?.toString();
    });
  }, [pets, currentUser]);
  const ownerConversationThreads = useMemo(() => {
    const sourceAppointments = currentUser?.role === "Admin" ? adminAppointments : ownerAppointments;
    return [...sourceAppointments].sort((a, b) => new Date(b.updatedAtUtc || b.createdAtUtc) - new Date(a.updatedAtUtc || a.createdAtUtc));
  }, [currentUser, ownerAppointments, adminAppointments]);
  const visibleOwnerThreads = useMemo(() => {
    if (!selectedVetId) return ownerConversationThreads;
    return ownerConversationThreads.filter((item) => item.vetId === selectedVetId);
  }, [ownerConversationThreads, selectedVetId]);
  const selectedVet = useMemo(() => vets.find((item) => item.id === selectedVetId) || null, [vets, selectedVetId]);
  const sidebarChatItems = useMemo(() => {
    if (currentUser?.role === "Vet") {
      return vetAppointments
        .map((item) => {
          const count = vetMessageCounts[item.id] ?? 0;
          return {
            id: item.id,
            senderName: getLocalizedText(item.ownerName, language),
            preview: getLocalizedText(item.reason, language),
            count,
            sortDate: item.updatedAtUtc || item.createdAtUtc || ""
          };
        })
        .filter((item) => item.count > 0 && !dismissedNotificationIds[item.id])
        .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
    }

    if (["User", "Admin"].includes(currentUser?.role)) {
      return ownerConversationThreads
        .map((item) => {
          const count = item.messageCount ?? 0;
          return {
            id: item.id,
            senderName: getLocalizedText(item.vetName, language),
            preview: getLocalizedText(item.reason, language),
            count,
            sortDate: item.updatedAtUtc || item.createdAtUtc || ""
          };
        })
        .filter((item) => item.count > 0 && !dismissedNotificationIds[item.id])
        .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
    }

    return [];
  }, [currentUser, vetAppointments, ownerConversationThreads, vetMessageCounts, language, dismissedNotificationIds]);
  const totalSidebarMessages = useMemo(
    () => sidebarChatItems.reduce((sum, item) => sum + (item.count || 0), 0),
    [sidebarChatItems]
  );
  const featuredAdoptions = adoptions.slice(0, 3);
  const cityCoverage = dashboard ? Object.entries(dashboard.petsByCity || dashboard.PetsByCity || {}) : [];
  const typeCoverage = dashboard ? Object.entries(dashboard.petsByType || dashboard.PetsByType || {}) : [];

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const user = await api.login(loginForm.email, loginForm.password);
      setCurrentUser(user);
      localStorage.setItem("petcareCurrentUser", JSON.stringify(user));
      setAuthMode("login");
      setActiveTab(getDefaultTab(user));
      navigate("/" + getDefaultTab(user));
      setError(""); // مسح الأخطاء السابقة
    } catch (e) { 
      setError(e.message); 
    }
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

  function openAppointmentChat(appointmentId, prefilledMessage = "", prefilledImageDataUrl = "") {
    const allAppointments = [...ownerAppointments, ...vetAppointments];
    const matchingAppointment = allAppointments.find((item) => item.id === appointmentId);
    if (matchingAppointment?.vetId) {
      setSelectedVetId(matchingAppointment.vetId);
    }
    setSelectedAppointmentId(appointmentId);
    setShowInlineChatComposer(true);
    setChatNotice("");
    setActiveTab("chatting");
    navigate("/chatting");
    setDismissedNotificationIds((current) => ({ ...current, [appointmentId]: true }));
    setMessageDraft(prefilledMessage);
    setMessageImageDraft(prefilledImageDataUrl);
  }

  function openNotificationChat(chatItem) {
    if (!chatItem) return;
    setDismissedNotificationIds((current) => ({ ...current, [chatItem.id]: true }));
    openAppointmentChat(chatItem.id);
  }

  function returnToChatList() {
    setActiveTab("chatting");
    navigate("/chatting");
  }

  function startChatWithVet(vetId, prefilledMessage = "") {
    setSelectedVetId(vetId);
    setShowInlineChatComposer(true);
    setChatNotice("");
    const existingThread = [...ownerAppointments]
      .filter((item) => item.vetId === vetId)
      .sort((a, b) => new Date(b.updatedAtUtc || b.createdAtUtc) - new Date(a.updatedAtUtc || a.createdAtUtc))[0];

    if (existingThread) {
      openAppointmentChat(existingThread.id, prefilledMessage);
      return;
    }

    handleQuickConsult(vetId);
  }

  function openVetMessageRoll(vetId) {
    const existingThread = [...ownerAppointments]
      .filter((item) => item.vetId === vetId)
      .sort((a, b) => new Date(b.updatedAtUtc || b.createdAtUtc) - new Date(a.updatedAtUtc || a.createdAtUtc))[0];

    setSelectedVetId(vetId);
    setShowInlineChatComposer(true);
    setChatNotice("");

    if (existingThread) {
      openAppointmentChat(existingThread.id);
    }
  }

  async function handleCreateAppointment(event) {
    event.preventDefault();
    if (!appointmentForm.petId || !appointmentForm.vetId || !appointmentForm.preferredDateUtc) return;
    try {
      const created = await api.createAppointment({ ...appointmentForm, ownerId: currentUser.id });
      setOwnerAppointments(prev => [created, ...prev]);
      setAppointmentForm(emptyAppointmentForm);
      openAppointmentChat(created.id);
    } catch (e) { setError(e.message); }
  }

  function handleChatImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(language === "ar" ? "يرجى اختيار صورة فقط" : "Please choose an image file");
      return;
    }

    if (file.size > CHAT_IMAGE_MAX_BYTES) {
      setError(language === "ar" ? "حجم الصورة كبير، اختر صورة أصغر من 2MB" : "Image is too large. Choose one smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setMessageImageDraft(reader.result);
        setChatNotice("");
        setError("");
      }
    };
    reader.onerror = () => {
      setError(language === "ar" ? "تعذر قراءة الصورة" : "Could not read the image");
    };
    reader.readAsDataURL(file);
  }

  function clearChatImageDraft() {
    setMessageImageDraft("");
    setChatNotice("");
  }

  async function handleSendMessage() {
    const trimmedMessage = messageDraft.trim();
    if (!selectedAppointmentId && selectedVetId && ["User", "Admin"].includes(currentUser?.role) && (trimmedMessage || messageImageDraft)) {
      await handleQuickConsult(selectedVetId, trimmedMessage, messageImageDraft, true);
      return;
    }
    if (!selectedAppointmentId || (!trimmedMessage && !messageImageDraft)) return;
    try {
      await api.sendAppointmentMessage(selectedAppointmentId, {
        senderId: currentUser.id,
        message: trimmedMessage,
        imageDataUrl: messageImageDraft || null
      });
      setMessageDraft("");
      setMessageImageDraft("");
      setChatNotice(language === "ar" ? "تم ارسال المسج بنجاح" : "Message sent successfully");
      loadAppointmentDetails(selectedAppointmentId, { includePet: false }).catch(() => {});
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

  async function handleQuickConsult(vetId, initialMessage = "", initialImageDataUrl = "", sendImmediately = false) {
    if (!currentUser) { setAuthMode("login"); return; }
    try {
      const payload = {
        petId: ownPets[0]?.id || "", // Default to first pet if available
        vetId,
        preferredDateUtc: new Date().toISOString(),
        reason: "تعذر الوصول للعيادة | Could not reach the clinic",
        ownerNotes: "أحتاج متابعة مع الدكتور عبر الشات لأنني لم أتمكن من الوصول للعيادة. | I need to continue with the vet in chat because I could not reach the clinic.",
        ownerId: currentUser.id
      };
      if (!payload.petId) {
        setError(language === "ar" ? "يرجى تسجيل حيوان أليف أولاً لبدء استشارة" : "Please register a pet first to start a consultation");
        return;
      }
      const created = await api.createAppointment(payload);
      setOwnerAppointments(prev => [created, ...prev]);
      if (sendImmediately && (initialMessage || initialImageDataUrl)) {
        openAppointmentChat(created.id);
        await api.sendAppointmentMessage(created.id, {
          senderId: currentUser.id,
          message: initialMessage,
          imageDataUrl: initialImageDataUrl || null
        });
        setMessageDraft("");
        setMessageImageDraft("");
        setChatNotice(language === "ar" ? "تم ارسال المسج بنجاح" : "Message sent successfully");
        loadAppointmentDetails(created.id, { includePet: false }).catch(() => {});
        return;
      }

      openAppointmentChat(created.id, initialMessage || remoteQuickReplies[0], initialImageDataUrl);
    } catch (e) { setError(e.message); }
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
          <div className="sidebar-brand-row">
            <p className="brand-mark">{text.shell.appName}</p>
            {currentUser ? (
              <div className="sidebar-bell-wrap">
                <button
                  type="button"
                  className="sidebar-bell-button"
                  onClick={() => setShowBellMenu((current) => !current)}
                >
                  <span className="sidebar-bell-icon" aria-hidden="true">🔔</span>
                  <span className="sidebar-bell-badge">{totalSidebarMessages}</span>
                </button>
                {showBellMenu ? (
                  <div className="sidebar-bell-menu">
                    {sidebarChatItems.length === 0 ? (
                      <p className="sidebar-bell-empty">{language === "ar" ? "لا توجد رسائل" : "No messages"}</p>
                    ) : (
                      sidebarChatItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="sidebar-bell-item"
                          onClick={() => {
                            setShowBellMenu(false);
                            openNotificationChat(item);
                          }}
                        >
                          <div className="sidebar-message-row">
                            <strong>{item.senderName}</strong>
                            <span>{item.count}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
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
                setLoginForm({ email: item.email, password: item.pass });
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
                      {(featuredAdoptions || []).map((item) => (
                        <article key={item.id} className="pet-card">
                          <img src={item.photoUrl} alt={getLocalizedText(item.petName || item.PetName, language)} />
                          <div className="pet-card-body">
                            <h4>{getLocalizedText(item.petName || item.PetName, language)}</h4>
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
                          <div className="bar-track"><div className="bar-fill" style={{ width: `${(value / (dashboard?.totalPets || 1)) * 100}%` }} /></div>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>
            </>} />

            <Route path="/start-chat" element={<>
              <div className="chat-dashboard single">
                <SectionCard title={doctorListTitle} subtitle={doctorListHint}>
                  <div className="doctor-list">
                    {vets.map((vet) => {
                      const isActive = selectedVetId === vet.id;
                      return (
                        <article key={vet.id} className={isActive ? "doctor-card active" : "doctor-card"} onClick={() => setSelectedVetId(vet.id)}>
                          <div className="doctor-card-head">
                            <div className="doctor-avatar">{getLocalizedText(vet.fullName, language)?.charAt(0) || "D"}</div>
                            <div>
                              <strong>{getLocalizedText(vet.fullName, language)}</strong>
                              <p>{getLocalizedText(vet.city, language)}</p>
                            </div>
                          </div>
                          <div className="doctor-card-meta">
                            <span>{activeNowLabel}</span>
                            <span>{language === "ar" ? "اختر الطبيب" : "Choose doctor"}</span>
                          </div>
                          <button type="button" className="doctor-card-action" onClick={(event) => { event.stopPropagation(); startChatWithVet(vet.id, ""); }}>
                            {language === "ar" ? "ابدأ محادثة" : "Start Conversation"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </SectionCard>
              </div>
            </>} />

<Route path="/chatting" element={<>
              <div className={["User", "Admin"].includes(currentUser?.role) ? "chat-dashboard single" : "chat-dashboard"}>
                {["User", "Admin"].includes(currentUser?.role) ? (
                  <>
                    <SectionCard title={doctorListTitle} subtitle={doctorListHint}>
                      <div className="doctor-list">
                        {vets.map((vet) => {
                          const isActive = selectedVetId === vet.id;
                          const threadCount = ownerConversationThreads.filter((item) => item.vetId === vet.id).length;
                          return (
                          <article key={vet.id} className={isActive ? "doctor-card active" : "doctor-card"} onClick={() => { setSelectedVetId(vet.id); setShowInlineChatComposer(false); setChatNotice(""); setMessageDraft(""); setMessageImageDraft(""); }}>
                              <div className="doctor-card-head">
                                <div className="doctor-avatar">{getLocalizedText(vet.fullName, language)?.charAt(0) || "D"}</div>
                                <div>
                                  <strong>{getLocalizedText(vet.fullName, language)}</strong>
                                  <p>{getLocalizedText(vet.city, language)}</p>
                                </div>
                              </div>
                              <div className="doctor-card-meta">
                                <span>{activeNowLabel}</span>
                                <button type="button" className="doctor-message-count" onClick={(event) => { event.stopPropagation(); openVetMessageRoll(vet.id); }}>
                                  {interpolate(text.common.messagesCount, { n: threadCount })}
                                </button>
                              </div>
                              <button type="button" className="doctor-card-action" onClick={(event) => { event.stopPropagation(); startChatWithVet(vet.id, ""); }}>
                                {startChatLabel}
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </SectionCard>

                    <div ref={chatFocusRef}>
                    <SectionCard title={selectedVet ? getLocalizedText(selectedVet.fullName, language) : appointmentHubTitle} subtitle={selectedVet ? (language === "ar" ? "اضغط ابدأ شات ليظهر صندوق الرسالة هنا" : "Press Start Chat to show the message box here") : remoteChatHint}>
                        {showInlineChatComposer ? (
                          <ModernAppointmentChat details={appointmentDetails} currentUser={currentUser} messageDraft={messageDraft} setMessageDraft={(value) => { setMessageDraft(value); setChatNotice(""); }} messageImageDraft={messageImageDraft} onPickImage={handleChatImagePick} onClearImage={clearChatImageDraft} onSendMessage={handleSendMessage} quickReplies={[]} language={language} getLocalizedText={getLocalizedText} text={text} formatDateTime={formatDateTime} variant="inline" noticeMessage={chatNotice} fallbackCounterpartName={selectedVet ? getLocalizedText(selectedVet.fullName, language) : ""} onClose={() => { setSelectedAppointmentId(null); setAppointmentDetails(null); setMessageDraft(""); setMessageImageDraft(""); setShowInlineChatComposer(false); setChatNotice(""); }} />
                      ) : (
                        <div className="chat-inline-placeholder">
                          <strong>{language === "ar" ? "اختر دكتور ثم اضغط ابدأ شات" : "Choose a doctor, then press Start Chat"}</strong>
                        </div>
                      )}
                    </SectionCard>
                    </div>
                  </>
                ) : (
                  <>
                    <SectionCard title={text.appointments.vetCasesTitle} subtitle={text.appointments.vetCasesSubtitle}>
                      <div className="thread-list">
                        {vetAppointments.map((item) => (
                          <button key={item.id} type="button" className={selectedAppointmentId === item.id ? "thread-card active" : "thread-card"} onClick={() => openAppointmentChat(item.id)}>
                            <div className="thread-card-top">
                              <strong>{getLocalizedText(item.ownerName, language)}</strong>
                              <span>{formatDateTime(item.preferredDateUtc, language)}</span>
                            </div>
                            <p>{getLocalizedText(item.reason, language)}</p>
                            <div className="thread-card-meta">
                              <span>{getLocalizedText(item.petName, language)}</span>
                              <span>{language === "ar" ? `${vetMessageCounts[item.id] ?? 0} رسائل` : `${vetMessageCounts[item.id] ?? 0} messages`}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </SectionCard>
                  </>
                )}
              </div>
            </>} />

<Route path="/chatting/:appointmentId" element={<HomeRedirect currentUser={currentUser} forcedPath="/chatting" />} />

            <Route path="/appointments" element={<HomeRedirect currentUser={{ ...currentUser, role: currentUser?.role === "Admin" ? "Admin" : currentUser?.role }} forcedPath="/chatting" />} />

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
                      <textarea value={petForm.description} placeholder={text.adoption.descPh} onChange={e => setPetForm(c => ({ ...c, description: e.target.value }))} style={{ minHeight: 100, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
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
                   <div className="pet-grid">
                     {lostPets.map(item => (
                       <article key={item.id} className="pet-card">
                         <img src={item.photoUrl} alt={getLocalizedText(item.petName, language)} />
                         <div className="pet-card-body">
                           <h4>{getLocalizedText(item.petName, language)}</h4>
                           <p>{getLocalizedText(item.description, language)}</p>
                           <div className="meta-line"><span>{item.lastSeenPlace}</span></div>
                         </div>
                       </article>
                     ))}
                   </div>
                </SectionCard>
                <SectionCard title={text.community.foundTitle}>
                   <div className="pet-grid">
                     {foundPets.map(item => (
                       <article key={item.id} className="pet-card">
                         <img src={item.photoUrl} alt={text.petTypes[item.petType]} />
                         <div className="pet-card-body">
                           <h4>{text.petTypes[item.petType] || item.petType}</h4>
                           <p>{getLocalizedText(item.description, language)}</p>
                           <div className="meta-line"><span>{item.foundPlace}</span></div>
                         </div>
                       </article>
                     ))}
                   </div>
                </SectionCard>
              </div>
            </>} />

            <Route path="/health" element={<>
              <div className="split-grid">
                <SectionCard title={text.health.title}>
                  <div className="list-stack">
                    {(vaccines || []).map(item => (
                      <article key={item.id} className="list-card">
                        <strong>{getLocalizedText(item.petName || item.PetName, language)}</strong>
                        <p>{getLocalizedText(item.vaccineName || item.VaccineName, language)}</p>
                      </article>
                    ))}
                    {vaccines.length === 0 && <p className="empty-state">{text.common.noData}</p>}
                  </div>
                </SectionCard>

                <SectionCard title={language === "ar" ? "خبرائنا البيطريين" : "Our Veterinary Specialists"}>
                  <div className="pet-grid">
                    {vets.map(vet => (
                      <article key={vet.id} className="pet-card">
                        <div className="avatar-circle" style={{ width: "100%", height: 180, borderRadius: 0, fontSize: "4rem" }}>
                          {getLocalizedText(vet.fullName || vet.FullName || "User", language).charAt(0)}
                        </div>
                        <div className="pet-card-body">
                          <h4>{getLocalizedText(vet.fullName || vet.FullName, language)}</h4>
                          <span>{vet.city || vet.City}</span>
                          <button className="btn-consult" onClick={() => handleQuickConsult(vet.id)}>
                            {language === "ar" ? "ابدأ شات مع الدكتور" : "Start Chat with Vet"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </>} />

            <Route path="/registry" element={<>
               <SectionCard title={text.registry.title}>
                 <div className="search-row"><input type="search" placeholder={text.registry.searchPh} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                 <div className="registry-grid">
                   {filteredPets.map(pet => (
                      <article key={pet.id} className="registry-card">
                        <img src={pet.photoUrl || pet.PhotoUrl} alt={getLocalizedText(pet.name || pet.Name, language)} />
                        <div className="pet-card-body">
                          <h4>{getLocalizedText(pet.name || pet.Name, language)}</h4>
                          <span>{text.petTypes[pet.type || pet.Type]} | {getLocalizedText(pet.breed || pet.Breed, language)}</span>
                          <div className="meta-line"><span>{pet.city || pet.City}</span><span>{pet.collarId || pet.CollarId}</span></div>
                          {pet.role === "Vet" && (
                            <button className="btn-consult" onClick={() => handleQuickConsult(pet.id)}>
                              {language === "ar" ? "ابدأ شات سريع" : "Start Quick Chat"}
                            </button>
                          )}
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

    </div>
  );
}

function HomeRedirect({ currentUser, forcedPath }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(forcedPath || ("/" + getDefaultTab(currentUser)), { replace: true });
  }, [currentUser, forcedPath]);
  return null;
}

export default App;
