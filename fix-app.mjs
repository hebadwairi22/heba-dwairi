import fs from 'fs';
let code = fs.readFileSync('frontend/petcare-jordan-client/src/App.jsx', 'utf8');

// Replace the end properly. The last block in the old App was:
//            ) : null}
//          </>
//        ) : null}
//      </main>
// We want to replace it with closing the <Route> for activeTab === "registry" and closing <Routes>.

code = code.replace(/\{activeTab === "registry" \? \(/g, `<Route path="/registry" element={<>`);

code = code.replace(
`            ) : null}
          </>
        ) : null}
      </main>`,
`            </>} />

            <Route path="*" element={<HomeRedirect currentUser={currentUser} />} />
            </Routes>
          </>
        ) : null}
      </main>`
);

fs.writeFileSync('frontend/petcare-jordan-client/src/App.jsx', code);
