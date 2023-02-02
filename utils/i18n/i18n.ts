export const fallback = "en";
import preval from "preval.macro";

export const {
  LOCALE_BASE_PATH,
  supportedLocales,
  namespaces,
  locales,
} = preval`
const fs = require("fs");
const path = require("path");
const LOCALE_BASE_PATH = path.resolve("./assets/locales")
const supportedLocales = fs.readdirSync(LOCALE_BASE_PATH);
const namespaces = fs.readdirSync(path.join(LOCALE_BASE_PATH, supportedLocales[0])).map((x) => x.slice(0, x.length - 5));
const locales = {};
supportedLocales.forEach((locale) => {
  locales[locale] = {};
  namespaces.forEach((namespace) => {
    locales[locale][namespace] = require(path.join(LOCALE_BASE_PATH, locale, namespace + ".json"))
  });
});
module.exports = { LOCALE_BASE_PATH, supportedLocales, namespaces, locales };
`;

// FIXME: android fails to import because of the expression
// export const tryImportMomentLocale = (locale: string) => {

//   // the default is already en_US, and there is no locale file for it, so just return.
//   if (locale === "en") return Promise.resolve();

//   try {
//     // try to import the moment locale.
//     return import(locales[locale].moment);
//   } catch (e) {
//     // fallback to the default
//     return Promise.resolve();
//   }
// };
