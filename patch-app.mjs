import fs from "fs";

let code = fs.readFileSync("frontend/petcare-jordan-client/src/App.jsx", "utf8");

code = code.replace(/<\/>\}\ \/>\s*<Route path="\/appointments" element=\{currentUser\?\.role === "Vet"/, `</> : null} />\n            <Route path="/appointments" element={currentUser?.role === "Vet"`);

code = code.replace(/<\/>\}\ \/>\s*<Route path="\/admin" element=\{currentUser\?\.role === "Admin"/, `</> : null} />\n            <Route path="/admin" element={currentUser?.role === "Admin"`);

code = code.replace(/<\/>\}\ \/>\s*<Route path="\/adoption"/, `</> : null} />\n            <Route path="/adoption"`);

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", code);
