import fs from "fs";

let code = fs.readFileSync("frontend/petcare-jordan-client/src/App.jsx", "utf8");

// 1. Add owner chat state variables after searchTerm
code = code.replace(
  'const [searchTerm, setSearchTerm] = useState("");',
  `const [searchTerm, setSearchTerm] = useState("");
  const [ownerChatListingId, setOwnerChatListingId] = useState(null);
  const [ownerMessages, setOwnerMessages] = useState([]);
  const [ownerMsgDraft, setOwnerMsgDraft] = useState("");`
);

// 2. Add owner chat handler functions before "if (!currentUser)"
const chatHandlers = `
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

`;
code = code.replace(
  '  if (!currentUser) {',
  chatHandlers + '  if (!currentUser) {'
);

// 3. Add chat button + chat panel after adoption cards
// Find the adoption meta-line with the adopt button and add a chat button
code = code.replace(
  `>{text.adoption.adoptBtn}</button></div>`,
  `>{text.adoption.adoptBtn}</button><button type="button" onClick={() => loadOwnerChat(item.id)} style={{padding:"6px 14px",fontSize:"0.85rem",background:"rgba(16,185,129,0.1)",color:"#10b981",borderRadius:"8px",fontWeight:"bold"}}>{language === "ar" ? "محادثة" : "Chat"}</button></div>`
);

// 4. Add the chat section after the adoption listings SectionCard closing
const chatSection = `

                <SectionCard title={language === "ar" ? "محادثة التبنّي" : "Adoption Chat"}>
                  {ownerChatListingId ? (
                    <div className="list-stack">
                      {ownerMessages.length > 0 ? ownerMessages.map((m) => (
                        <article key={m.id} className="list-card">
                          <strong>{m.senderName}</strong>
                          <p>{m.message}</p>
                          <span>{formatDateTime(m.sentAtUtc, language)}</span>
                        </article>
                      )) : <p className="empty-state">{language === "ar" ? "لا توجد رسائل بعد. ابدأ المحادثة!" : "No messages yet. Start the conversation!"}</p>}
                      {currentUser ? (
                        <form className="auth-form" onSubmit={handleSendOwnerMessage}>
                          <textarea value={ownerMsgDraft} placeholder={language === "ar" ? "اكتب رسالتك للمالك..." : "Write a message to the owner..."} onChange={(e) => setOwnerMsgDraft(e.target.value)} style={{ minHeight: 80, borderRadius: 14, border: "1px solid rgba(93, 107, 120, 0.2)", padding: 12, background: "rgba(255,255,255,0.85)" }} />
                          <button type="submit">{language === "ar" ? "إرسال" : "Send"}</button>
                        </form>
                      ) : null}
                    </div>
                  ) : <p className="empty-state">{language === "ar" ? "اضغط 'محادثة' على أي حيوان للتواصل مع المالك." : "Click 'Chat' on any pet to message the owner."}</p>}
                </SectionCard>`;

code = code.replace(
  `                </SectionCard>
              </div>
            </>} />
            <Route path="/community"`,
  `                </SectionCard>${chatSection}
              </div>
            </>} />
            <Route path="/community"`
);

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", code);
console.log("Owner chat UI added!");
