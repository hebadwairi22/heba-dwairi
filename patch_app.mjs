import fs from "fs";

let code = fs.readFileSync("frontend/petcare-jordan-client/src/App.jsx", "utf8");

// 1. Import getLocalizedText
code = code.replace(
  'import { translations, interpolate, formatDate, formatDateTime } from "./i18n";',
  'import { translations, interpolate, formatDate, formatDateTime, getLocalizedText } from "./i18n";'
);

// 2. Update demo credentials
code = code.replace(
  '{ role: "Admin", email: "alaa@petcare.jo", password: "Pass123!" },',
  '{ role: "Admin", email: "loai.admin@petcare.jo", password: "Pass123!", name: "لؤي | Loai" },'
);
code = code.replace(
  '{ role: "Vet", email: "noor.vet@petcare.jo", password: "Pass123!" },',
  '{ role: "Vet", email: "safaa.vet@petcare.jo", password: "Pass123!", name: "د. صفاء | Dr. Safaa" },'
);
code = code.replace(
  '{ role: "Owner", email: "lina@petcare.jo", password: "Pass123!" }',
  '{ role: "Owner", email: "yaqeen@petcare.jo", password: "Pass123!", name: "يقين | Yaqeen" }'
);

// 3. Update sidebar to show the translated name
code = code.replace(
  '<strong>{item.role}</strong>',
  '<strong>{getLocalizedText(item.name, language)}</strong>'
);

// 4. Merge Appointments Routes
// Search for the Appointments routes and replace with a merged one
const appointmentsRoute = `
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
            </>} />`;

// Regex to replace both duplicate appointment routes with the new one
code = code.replace(/<Route path="\/appointments" element=\{currentUser\?\.role === "User" \? <>[\s\S]*?<\/Route>[\s\S]*?<Route path="\/appointments" element=\{currentUser\?\.role === "Vet" \? <>[\s\S]*?<\/Route>/, appointmentsRoute);

// 5. Update Pet and Adoption List items to use getLocalizedText
code = code.replace(/<h4>\{item\.petName\}<\/h4>/g, '<h4>{getLocalizedText(item.petName, language)}</h4>');
code = code.replace(/<span>\{item\.petType\} \| \{item\.breed\}<\/span>/g, '<span>{text.petTypes[item.petType]} | {getLocalizedText(item.breed, language)}</span>');
code = code.replace(/<p>\{item\.description\}<\/p>/g, '<p>{getLocalizedText(item.description, language)}</p>');

// Adoption stories
code = code.replace(/<p>\{item\.story\}<\/p>/g, '<p>{getLocalizedText(item.story, language)}</p>');

// Registry
code = code.replace(/<strong>\{pet\.name\}<\/strong>/g, '<strong>{getLocalizedText(pet.name, language)}</strong>');
code = code.replace(/<span>\{pet\.type\} \| \{pet\.breed\}<\/span>/g, '<span>{text.petTypes[pet.type]} | {getLocalizedText(pet.breed, language)}</span>');
code = code.replace(/<p>\{pet\.description\}<\/p>/g, '<p>{getLocalizedText(pet.description, language)}</p>');

// 6. Update AppointmentChat component to use localized text
// Find the component definition and update its rendering
// This part is easier to do via a separate regex since I modified the call too.

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", code);
console.log("App.jsx update completed!");
