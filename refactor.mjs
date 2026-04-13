import fs from "fs";

let code = fs.readFileSync("frontend/petcare-jordan-client/src/App_old.jsx", "utf8");

// 1. Remove all subtitle=".*" props from SectionCard
code = code.replace(/ subtitle="[^"]+"/g, "");

// 2. Remove unnecessary <p> explanations in stat-card
code = code.replace(/<p>Accounts in the system\.<\/p>/g, "");
code = code.replace(/<p>Doctors available for follow-up\.<\/p>/g, "");
code = code.replace(/<p>Due within the next 30 days\.<\/p>/g, "");
code = code.replace(/<p>Pets currently listed\.<\/p>/g, "");
// 3. Admin summaries p tags
code = code.replace(/<p>All created requests\.<\/p>/g, "");
code = code.replace(/<p>Still waiting for vet action\.<\/p>/g, "");
code = code.replace(/<p>Confirmed or in progress\.<\/p>/g, "");
code = code.replace(/<p>Communication volume across cases\.<\/p>/g, "");

// Remove the BOM from start if present
if (code.charCodeAt(0) === 0xFEFF) {
  code = code.slice(1);
}

// 4. Update the activeTab router to use react-router-dom!
code = `import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";\n` + code;

code = code.replace(
  /\{tabs\.map\(\(tab\) => \(\s*<button key=\{tab\.id\} type="button" className=\{activeTab === tab\.id \? "tab active" : "tab"\} onClick=\{\(\) => setActiveTab\(tab\.id\)\}>\s*\{tab\.label\}\s*<\/button>\s*\)\)\}/g,
  `{tabs.map((tab) => (
    <Link key={tab.id} to={"/" + tab.id} className={location.pathname === "/" + tab.id || (location.pathname === "/" && tab.id === "home") ? "tab active" : "tab"} onClick={() => setActiveTab(tab.id)}>
      {tab.label}
    </Link>
  ))}`
);

// We still need useLocation in App
code = code.replace(/const \[activeTab, setActiveTab\] = useState[^;]+;/g, `const [activeTab, setActiveTab] = useState(() => getDefaultTab(JSON.parse(localStorage.getItem("petcareCurrentUser") || "null")));\n  const location = useLocation();\n  const navigate = useNavigate();`);

// Close all fragments before opening a new activeTab
code = code.replace(/\) : null\}\s*\{activeTab/g, `</>} />\n            {activeTab`);

// Remove old activeTab conditionals and wrap them in Routes
code = code.replace(/\{!loading && dashboard \? \(\s*<>/g, `{!loading && dashboard ? (\n            <Routes>`);
code = code.replace(/\{activeTab === "home" \? \(/g, `<Route path="/home" element={<>`);
code = code.replace(/\{activeTab === "appointments" && currentUser\?\.role === "User" \? \(/g, `<Route path="/appointments" element={currentUser?.role === "User" ? <>`);
code = code.replace(/\{activeTab === "appointments" && currentUser\?\.role === "Vet" \? \(/g, `<Route path="/appointments" element={currentUser?.role === "Vet" ? <>`);
code = code.replace(/\{activeTab === "admin" && currentUser\?\.role === "Admin" \? \(/g, `<Route path="/admin" element={currentUser?.role === "Admin" ? <>`);
code = code.replace(/\{activeTab === "adoption" \? \(/g, `<Route path="/adoption" element={<>`);
code = code.replace(/\{activeTab === "community" \? \(/g, `<Route path="/community" element={<>`);
code = code.replace(/\{activeTab === "health" \? \(/g, `<Route path="/health" element={<>`);
code = code.replace(/\{activeTab === "registry" \? \(/g, `<Route path="/registry" element={<>`);

// specifically replace the final chunk with exact text to avoid matching mid-file
code = code.replace(/<\/SectionCard>\s*\) : null\}\s*<\/>\s*\) : null\}\s*<\/main>/, `</SectionCard>\n            </>} />\n            <Route path="*" element={<HomeRedirect currentUser={currentUser} />} />\n            </Routes>\n        ) : null}\n      </main>`);

// HomeRedirect component to redirect to the proper path
code = code + `\nfunction HomeRedirect({ currentUser }) { const navigate = useNavigate(); useEffect(() => { navigate("/" + getDefaultTab(currentUser), { replace: true }); }, [currentUser, navigate]); return null; }\n`;

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", code);
