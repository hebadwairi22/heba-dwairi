import fs from "fs";
const p = "src/App.jsx";
let s = fs.readFileSync(p, "utf8");
const reps = [
  [
    'SectionCard title="Medical history" subtitle="Records linked to the pet in this case."',
    "SectionCard title={text.appointments.medicalHistoryTitle} subtitle={text.appointments.medicalHistorySubtitle}"
  ],
  [
    '<p className="empty-state">No medical history yet for this pet.</p>',
    '<p className="empty-state">{text.appointments.noMedical}</p>'
  ],
  ['SectionCard title="Add medical record" subtitle="Create a visit note directly from the case."', "SectionCard title={text.appointments.addMedicalTitle} subtitle={text.appointments.addMedicalSubtitle}"],
  ['placeholder="Visit reason"', "placeholder={text.appointments.visitReasonPh}"],
  ['placeholder="Diagnosis"', "placeholder={text.appointments.diagnosisPh}"],
  ['placeholder="Treatment"', "placeholder={text.appointments.treatmentPh}"],
  ['<button type="submit">Add medical record</button>', "<button type=\"submit\">{text.common.addMedicalRecord}</button>"],
  [
    'SectionCard title="Vaccinations" subtitle="Track due dates and completed shots."',
    "SectionCard title={text.appointments.vaccinesTitle} subtitle={text.appointments.vaccinesSubtitle}"
  ],
  [
    '<p>{item.isCompleted ? "Completed" : "Pending"}</p>',
    "<p>{item.isCompleted ? text.common.completed : text.common.pending}</p>"
  ],
  ["<span>Due {loc.date(item.dueDateUtc)}</span>", "<span>{text.common.due} {loc.date(item.dueDateUtc)}</span>"],
  [
    '<p className="empty-state">No vaccines recorded yet for this pet.</p>',
    '<p className="empty-state">{text.appointments.noVaccines}</p>'
  ],
  [
    'SectionCard title="Add vaccination" subtitle="Create a vaccine entry for the selected pet."',
    "SectionCard title={text.appointments.addVaccineTitle} subtitle={text.appointments.addVaccineSubtitle}"
  ],
  ['placeholder="Vaccine name"', "placeholder={text.appointments.vaccineNamePh}"],
  ["Mark as completed", "{text.appointments.markCompleted}"],
  ['<button type="submit">Add vaccination</button>', "<button type=\"submit\">{text.common.addVaccination}</button>"],
  [
    'SectionCard title="Admin workflow summary" subtitle="What the admin should watch in the care pipeline."',
    "SectionCard title={text.admin.summaryTitle} subtitle={text.admin.summarySubtitle}"
  ],
  [
    '<article className="stat-card"><strong>{adminSummary?.totalAppointments ?? 0}</strong><span>total appointments</span><p>All created requests.</p></article>',
    '<article className="stat-card"><strong>{adminSummary?.totalAppointments ?? 0}</strong><span>{text.admin.totalAppt}</span><p>{text.admin.totalApptHint}</p></article>'
  ],
  [
    '<article className="stat-card"><strong>{adminSummary?.pendingAppointments ?? 0}</strong><span>pending requests</span><p>Still waiting for vet action.</p></article>',
    '<article className="stat-card"><strong>{adminSummary?.pendingAppointments ?? 0}</strong><span>{text.admin.pendingAppt}</span><p>{text.admin.pendingApptHint}</p></article>'
  ],
  [
    '<article className="stat-card"><strong>{adminSummary?.activeVetCases ?? 0}</strong><span>active cases</span><p>Confirmed or in progress.</p></article>',
    '<article className="stat-card"><strong>{adminSummary?.activeVetCases ?? 0}</strong><span>{text.admin.activeCases}</span><p>{text.admin.activeCasesHint}</p></article>'
  ],
  [
    '<article className="stat-card"><strong>{adminSummary?.totalMessages ?? 0}</strong><span>chat messages</span><p>Communication volume across cases.</p></article>',
    '<article className="stat-card"><strong>{adminSummary?.totalMessages ?? 0}</strong><span>{text.admin.totalMsg}</span><p>{text.admin.totalMsgHint}</p></article>'
  ],
  ['SectionCard title="Recent appointments" subtitle="Latest owner-vet cases inside the system."', "SectionCard title={text.admin.recentTitle} subtitle={text.admin.recentSubtitle}"],
  ['SectionCard title="Users and roles" subtitle="Manage owners, vets, and admin access."', "SectionCard title={text.admin.usersTitle} subtitle={text.admin.usersSubtitle}"],
  [
    '<div className="meta-line"><span>{item.ownedPetCount} pets</span><span>{item.ownerAppointmentCount + item.vetAppointmentCount} appointments</span></div>',
    '<div className="meta-line"><span>{interpolate(text.admin.userPets, { n: item.ownedPetCount })}</span><span>{interpolate(text.admin.userAppts, { n: item.ownerAppointmentCount + item.vetAppointmentCount })}</span></div>'
  ],
  ['<option value="User">User</option>', '<option value="User">{text.common.owner}</option>'],
  ['<option value="Vet">Vet</option>', '<option value="Vet">{text.common.vet}</option>'],
  ['<option value="Admin">Admin</option>', '<option value="Admin">{text.common.admin}</option>'],
  [
    'SectionCard title="Community reports" subtitle="Resolve lost and found reports from one place."',
    "SectionCard title={text.admin.reportsTitle} subtitle={text.admin.reportsSubtitle}"
  ],
  ['<option value="Active">Active</option>', '<option value="Active">{text.admin.reportActive}</option>'],
  ['<option value="Resolved">Resolved</option>', '<option value="Resolved">{text.admin.reportResolved}</option>']
];
for (const [a, b] of reps) {
  if (!s.includes(a)) console.warn("MISSING:", a.slice(0, 70));
  else s = s.split(a).join(b);
}
s = s.split('<p className="empty-state">Select a case first.</p>').join('<p className="empty-state">{text.common.selectCaseFirst}</p>');
fs.writeFileSync(p, s);
console.log("patch 1 ok");
