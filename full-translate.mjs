import fs from "fs";

let code = fs.readFileSync("frontend/petcare-jordan-client/src/App.jsx", "utf8");

// ===== COMPREHENSIVE TRANSLATION PATCH =====
// Replace every hardcoded English string with a translation token

const replacements = [
  // --- AuthPanel ---
  ['`${currentUser.role} account in ${currentUser.city}`', 'interpolate(text.common.accountRole, {role: currentUser.role, city: currentUser.city})'],

  // --- AppointmentChat component ---
  ['Select an appointment to open the case details and chat.', '{text.common.selectAppointmentChat}'],
  ['<p>Owner note: {details.appointment.ownerNotes}</p>', '<p>{text.common.ownerNote}: {details.appointment.ownerNotes}</p>'],
  ['<p>Vet note: {details.appointment.vetNotes}</p>', '<p>{text.common.vetNote}: {details.appointment.vetNotes}</p>'],
  ['placeholder="Write a message..."', 'placeholder={text.common.writeMessage}'],
  ['>Send message</button>', '>{text.common.sendMessage}</button>'],

  // --- Landing page hero ---
  ['<span className="kicker">PetCare Jordan</span>', '<span className="kicker">{text.landing.kicker}</span>'],
  ['<div><strong>Owner</strong><span>pets, adoption, reports, appointments</span></div>', '<div><strong>{text.landing.roleOwner}</strong><span>{text.landing.roleOwnerDesc}</span></div>'],
  ['<div><strong>Vet</strong><span>cases, chat, medical records, vaccines</span></div>', '<div><strong>{text.landing.roleVet}</strong><span>{text.landing.roleVetDesc}</span></div>'],
  ['<div><strong>Admin</strong><span>users, roles, reports, workflow oversight</span></div>', '<div><strong>{text.landing.roleAdmin}</strong><span>{text.landing.roleAdminDesc}</span></div>'],

  // --- Dashboard hero stats ---
  ['<div><strong>{dashboard.totalPets}</strong><span>registered pets</span></div>', '<div><strong>{dashboard.totalPets}</strong><span>{text.common.registeredPets}</span></div>'],
  ['<div><strong>{notifications.length}</strong><span>notifications for this account</span></div>', '<div><strong>{notifications.length}</strong><span>{text.common.notificationsForAccount}</span></div>'],
  ['{language === "ar" ? "الواجهة الحالية" : "current view"}', '{text.common.currentView}'],

  // --- Loading ---
  ['>Loading project data...</div>', '>{text.common.loadingData}</div>'],

  // --- Home overview stats ---
  ['<article className="stat-card"><strong>{dashboard.totalUsers}</strong><span>owners and admins</span></article>', '<article className="stat-card"><strong>{dashboard.totalUsers}</strong><span>{text.common.ownersAndAdmins}</span></article>'],
  ['<article className="stat-card"><strong>{dashboard.totalVets}</strong><span>veterinarians</span></article>', '<article className="stat-card"><strong>{dashboard.totalVets}</strong><span>{text.common.veterinarians}</span></article>'],
  ['<article className="stat-card"><strong>{dashboard.upcomingVaccines}</strong><span>upcoming vaccines</span></article>', '<article className="stat-card"><strong>{dashboard.upcomingVaccines}</strong><span>{text.common.upcomingVaccines}</span></article>'],
  ['<article className="stat-card"><strong>{dashboard.petsForAdoption}</strong><span>adoption cases</span></article>', '<article className="stat-card"><strong>{dashboard.petsForAdoption}</strong><span>{text.common.adoptionCases}</span></article>'],

  // --- Notifications empty ---
  ['>Sign in to view account-specific updates.</p>', '>{text.common.signInForUpdates}</p>'],

  // --- City coverage ---
  ['<span>{value} pets</span>', '<span>{interpolate(text.common.petsInCity, {count: value})}</span>'],

  // --- Appointment form (owner) ---
  ['<option value="">Select pet</option>', '<option value="">{text.common.selectPet}</option>'],
  ['<option value="">Select vet</option>', '<option value="">{text.common.selectVet}</option>'],
  ['placeholder="Reason for visit"', 'placeholder={text.appointments.reasonPlaceholder}'],
  ['placeholder="Extra notes for the vet"', 'placeholder={text.appointments.notesPlaceholder}'],
  ['>Send request</button>', '>{text.appointments.sendRequest}</button>'],

  // --- Messages count ---
  ['<span>{item.messageCount} messages</span>', '<span>{interpolate(text.common.messagesCount, {n: item.messageCount})}</span>'],

  // --- Case chat title ---
  ['SectionCard title="Case chat"', 'SectionCard title={text.appointments.chatTitle}'],

  // --- Vet sections ---
  ['SectionCard title="Assigned cases"', 'SectionCard title={text.appointments.vetCasesTitle}'],
  ['SectionCard title="Update case status"', 'SectionCard title={text.appointments.statusTitle}'],

  // --- Vet status options ---
  ['<option value="Pending">Pending</option>', '<option value="Pending">{text.appointments.statusPending}</option>'],
  ['<option value="Confirmed">Confirmed</option>', '<option value="Confirmed">{text.appointments.statusConfirmed}</option>'],
  ['<option value="InProgress">In Progress</option>', '<option value="InProgress">{text.appointments.statusInProgress}</option>'],
  ['<option value="Completed">Completed</option>', '<option value="Completed">{text.appointments.statusCompleted}</option>'],
  ['<option value="Cancelled">Cancelled</option>', '<option value="Cancelled">{text.appointments.statusCancelled}</option>'],

  // --- Vet notes and buttons ---
  ['placeholder="Vet notes"', 'placeholder={text.appointments.vetNotesPlaceholder}'],
  ['>Update appointment</button>', '>{text.common.updateAppointment}</button>'],

  // --- Select a case first ---
  ['>Select a case first.</p>', '>{text.common.selectCaseFirst}</p>'],

  // --- Medical history ---
  ['>No medical history yet for this pet.</p>', '>{text.common.noMedicalHistory}</p>'],

  // --- Medical form ---
  ['placeholder="Visit reason"', 'placeholder={text.appointments.visitReasonPh}'],
  ['placeholder="Diagnosis"', 'placeholder={text.appointments.diagnosisPh}'],
  ['placeholder="Treatment"', 'placeholder={text.appointments.treatmentPh}'],
  ['>Add medical record</button>', '>{text.common.addMedicalRecord}</button>'],

  // --- Vaccine status ---
  ['{item.isCompleted ? "Completed" : "Pending"}', '{item.isCompleted ? text.common.completed : text.common.pending}'],

  // --- Vaccine due date ---
  ['<span>Due {formatDate(item.dueDateUtc, language)}</span>', '<span>{text.common.due} {formatDate(item.dueDateUtc, language)}</span>'],

  // --- No vaccines ---
  ['>No vaccines recorded yet for this pet.</p>', '>{text.common.noVaccinesRecorded}</p>'],

  // --- Vaccine form ---
  ['placeholder="Vaccine name"', 'placeholder={text.appointments.vaccineNamePh}'],
  ['Mark as completed', '{text.appointments.markCompleted}'],
  ['>Add vaccination</button>', '>{text.common.addVaccination}</button>'],

  // --- Admin stats ---
  ['<article className="stat-card"><strong>{adminSummary?.totalAppointments ?? 0}</strong><span>total appointments</span></article>', '<article className="stat-card"><strong>{adminSummary?.totalAppointments ?? 0}</strong><span>{text.admin.totalAppt}</span></article>'],
  ['<article className="stat-card"><strong>{adminSummary?.pendingAppointments ?? 0}</strong><span>pending requests</span></article>', '<article className="stat-card"><strong>{adminSummary?.pendingAppointments ?? 0}</strong><span>{text.admin.pendingAppt}</span></article>'],
  ['<article className="stat-card"><strong>{adminSummary?.activeVetCases ?? 0}</strong><span>active cases</span></article>', '<article className="stat-card"><strong>{adminSummary?.activeVetCases ?? 0}</strong><span>{text.admin.activeCases}</span></article>'],
  ['<article className="stat-card"><strong>{adminSummary?.totalMessages ?? 0}</strong><span>chat messages</span></article>', '<article className="stat-card"><strong>{adminSummary?.totalMessages ?? 0}</strong><span>{text.admin.totalMsg}</span></article>'],

  // --- Admin user info ---
  ['<span>{item.ownedPetCount} pets</span><span>{item.ownerAppointmentCount + item.vetAppointmentCount} appointments</span>', '<span>{interpolate(text.admin.userPets, {n: item.ownedPetCount})}</span><span>{interpolate(text.admin.userAppts, {n: item.ownerAppointmentCount + item.vetAppointmentCount})}</span>'],

  // --- Admin role options ---
  ['<option value="User">User</option>', '<option value="User">{text.common.user}</option>'],
  ['<option value="Vet">Vet</option>', '<option value="Vet">{text.common.vet}</option>'],
  ['<option value="Admin">Admin</option>', '<option value="Admin">{text.common.admin}</option>'],

  // --- Admin report status options ---
  ['<option value="Active">Active</option>', '<option value="Active">{text.admin.reportActive}</option>'],
  ['<option value="Resolved">Resolved</option>', '<option value="Resolved">{text.admin.reportResolved}</option>'],

  // --- Adoption form ---
  ['placeholder="Pet name"', 'placeholder={text.adoption.namePh}'],
  ['<option value="Cat">Cat</option>', '<option value="Cat">{text.petTypes.Cat}</option>'],
  ['<option value="Dog">Dog</option>', '<option value="Dog">{text.petTypes.Dog}</option>'],
  ['<option value="Bird">Bird</option>', '<option value="Bird">{text.petTypes.Bird}</option>'],
  ['<option value="Rabbit">Rabbit</option>', '<option value="Rabbit">{text.petTypes.Rabbit}</option>'],
  ['<option value="Other">Other</option>', '<option value="Other">{text.petTypes.Other}</option>'],
  ['<option value="Male">Male</option>', '<option value="Male">{text.petGender.Male}</option>'],
  ['<option value="Female">Female</option>', '<option value="Female">{text.petGender.Female}</option>'],
  ['placeholder="Breed"', 'placeholder={text.adoption.breedPh}'],
  ['placeholder="Age in months"', 'placeholder={text.adoption.agePh}'],
  ['placeholder="Weight in kg"', 'placeholder={text.adoption.weightPh}'],
  ['placeholder="Collar ID"', 'placeholder={text.adoption.collarPh}'],
  ['placeholder="Color"', 'placeholder={text.adoption.colorPh}'],
  ['placeholder="City"', 'placeholder={text.adoption.cityPh}'],
  ['placeholder="Photo URL"', 'placeholder={text.adoption.photoPh}'],
  ['placeholder="Description"', 'placeholder={text.adoption.descPh}'],

  // --- Neutered / Publish for adoption labels ---
  // These are plain text inside JSX so we'll deal with them specially below

  ['placeholder="Adoption story"', 'placeholder={text.adoption.storyPh}'],
  ['<option value="Phone">Phone</option>', '<option value="Phone">{text.adoption.contactPhone}</option>'],
  ['<option value="Email">Email</option>', '<option value="Email">{text.adoption.contactEmail}</option>'],
  ['placeholder="Contact details"', 'placeholder={text.adoption.contactDetailsPh}'],
  ['>Save pet</button>', '>{text.common.savePet}</button>'],

  // --- Adoption listings ---
  ['{item.status === "Available" ? "pill success" : "pill warning"}>{item.status}', '{item.status === "Available" ? "pill success" : "pill warning"}>{item.status === "Available" ? text.adoption.statusAvailable : text.adoption.statusPending}'],

  // --- Adoption card: add adopt button ---
  ['<div className="meta-line"><span>{item.city}</span><span>{item.contactDetails}</span></div>', '<div className="meta-line"><span>{item.city}</span><button type="button" onClick={() => alert(text.adoption.adoptContact + "\\n\\n" + item.contactDetails)} style={{padding:"6px 14px",fontSize:"0.85rem",background:"rgba(59,130,246,0.1)",color:"#3b82f6",borderRadius:"8px",fontWeight:"bold"}}>{text.adoption.adoptBtn}</button></div>'],

  // --- Community forms ---
  ['<strong>Lost pet report</strong>', '<strong>{text.community.lostHeading}</strong>'],
  ['<strong>Found pet report</strong>', '<strong>{text.community.foundHeading}</strong>'],
  ['placeholder="Approx age in months"', 'placeholder={text.community.approxAgePh}'],
  ['placeholder="Reward amount"', 'placeholder={text.community.rewardPh}'],
  ['placeholder="Last seen place"', 'placeholder={text.community.lastSeenPh}'],
  ['placeholder="Found place"', 'placeholder={text.community.foundPlacePh}'],
  ['placeholder="Contact name"', 'placeholder={text.community.contactNamePh}'],
  ['placeholder="Contact phone"', 'placeholder={text.community.contactPhonePh}'],
  ['>Post lost report</button>', '>{text.common.postLost}</button>'],
  ['>Post found report</button>', '>{text.common.postFound}</button>'],

  // --- Lost pets reward ---
  ['{item.rewardAmount ? `${item.rewardAmount} JOD reward` : "No reward listed"}', '{item.rewardAmount ? interpolate(text.common.jodReward, {amount: item.rewardAmount}) : text.common.noRewardListed}'],

  // --- Health section ---
  // Due dates already handled above with "Due {formatDate..."

  // --- Registry search ---
  ['placeholder="Try rabbit, Amman, or PCJ-1001"', 'placeholder={text.registry.searchPh}'],

  // --- Registry adoption status ---
  ['{pet.adoptionStatus ?? "Not listed for adoption"}', '{pet.adoptionStatus ?? text.common.notListedForAdoption}'],
];

let count = 0;
for (const [search, replace] of replacements) {
  if (code.includes(search)) {
    code = code.split(search).join(replace);
    count++;
  } else {
    console.warn("MISS:", search.slice(0, 80));
  }
}

// Special: handle the "Neutered" and "Publish for adoption" labels (plain text in JSX)
code = code.replace(
  /(<input type="checkbox" checked=\{petForm\.isNeutered\}[^/]+\/>\s*)\n\s*Neutered/,
  '$1\n                        {text.adoption.neutered}'
);
code = code.replace(
  /(<input type="checkbox" checked=\{petForm\.publishForAdoption\}[^/]+\/>\s*)\n\s*Publish for adoption/,
  '$1\n                        {text.adoption.publishAdoption}'
);

console.log(`Applied ${count} replacements.`);

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", code);
console.log("Done! App.jsx fully translated.");
