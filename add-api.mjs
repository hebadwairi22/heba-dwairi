import fs from 'fs';
let c = fs.readFileSync('frontend/petcare-jordan-client/src/api.js', 'utf8');
c = c.replace(
  /    \}\)\r?\n\};\s*$/,
  `    }),\r\n  getOwnerMessages: (adoptionListingId) => request(\`/ownerchat/\${adoptionListingId}\`),\r\n  sendOwnerMessage: (payload) =>\r\n    request("/ownerchat", {\r\n      method: "POST",\r\n      headers: { "Content-Type": "application/json" },\r\n      body: JSON.stringify(payload)\r\n    })\r\n};\r\n`
);
fs.writeFileSync('frontend/petcare-jordan-client/src/api.js', c);
console.log("done");
