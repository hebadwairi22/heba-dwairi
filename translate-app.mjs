import fs from "fs";

let code = fs.readFileSync("frontend/petcare-jordan-client/src/App.jsx", "utf8");

// Remove hardcoded translations from App.jsx and import them from i18n
code = code.replace(/const translations = \{\s*en: \{[^+]+};\s*function getTabs/s, `import { translations, interpolate, formatDate, formatDateTime } from "./i18n";\n\nfunction getTabs`);

// Remove formatDate and formatDateTime functions from App.jsx since we imported them
code = code.replace(/function formatDate\([^)]+\)\s*\{[^}]+\}\);\s*\}/, "");
code = code.replace(/function formatDateTime\([^)]+\)\s*\{[^}]+\}\);\s*\}/, "");

// Pass language to formatDate and formatDateTime calls
code = code.replace(/formatDate\(([^)]+)\)/g, "formatDate($1, language)");
code = code.replace(/formatDateTime\(([^)]+)\)/g, "formatDateTime($1, language)");

// Map hardcoded titles to text tokens
const replaces = [
  ['SectionCard title="Project overview"', 'SectionCard title={text.home.overviewTitle}'],
  ['SectionCard title="Latest adoption cases"', 'SectionCard title={text.home.adoptionsTitle}'],
  ['SectionCard title="Notifications"', 'SectionCard title={text.home.notifyTitle}'],
  ['SectionCard title="Coverage by city"', 'SectionCard title={text.home.cityTitle}'],
  ['SectionCard title="Pet types"', 'SectionCard title={text.home.typesTitle}'],
  ['SectionCard title="Request a vet appointment"', 'SectionCard title={text.appointments.requestTitle}'],
  ['SectionCard title="My appointments"', 'SectionCard title={text.appointments.mineTitle}'],
  ['SectionCard title="Add a pet"', 'SectionCard title={text.adoption.addTitle}'],
  ['SectionCard title="Adoption listings"', 'SectionCard title={text.adoption.listingsTitle}'],
  ['SectionCard title="Create community report"', 'SectionCard title={text.community.createTitle}'],
  ['SectionCard title="Lost pets"', 'SectionCard title={text.community.lostTitle}'],
  ['SectionCard title="Found pets"', 'SectionCard title={text.community.foundTitle}'],
  ['SectionCard title="Upcoming vaccines"', 'SectionCard title={text.health.title}'],
  ['SectionCard title="Pet registry"', 'SectionCard title={text.registry.title}'],
  ['SectionCard title="Admin workflow summary"', 'SectionCard title={text.admin.summaryTitle}'],
  ['SectionCard title="Recent appointments"', 'SectionCard title={text.admin.recentTitle}'],
  ['SectionCard title="Users and roles"', 'SectionCard title={text.admin.usersTitle}'],
  ['SectionCard title="Community reports"', 'SectionCard title={text.admin.reportsTitle}'],
  ['SectionCard title="Medical history"', 'SectionCard title={text.appointments.medicalHistoryTitle}'],
  ['SectionCard title="Add medical record"', 'SectionCard title={text.appointments.addMedicalTitle}'],
  ['SectionCard title="Vaccinations"', 'SectionCard title={text.appointments.vaccinesTitle}'],
  ['SectionCard title="Add vaccination"', 'SectionCard title={text.appointments.addVaccineTitle}']
];

for (const [en, token] of replaces) {
  code = code.replace(new RegExp(en, 'g'), token);
}

fs.writeFileSync("frontend/petcare-jordan-client/src/App.jsx", code);
