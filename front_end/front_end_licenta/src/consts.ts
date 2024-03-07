const maxFileSize = 10000000;
const mbToKb = 1 / 10000000;
const userCookieName = "carsUser";

const validFileTypes = [".png", ".jpg", ".jpeg"];

const colors = [
  "alb",
  "galben",
  "portocaliu",
  "roşu",
  "violet",
  "albastru",
  "verde",
  "gri",
  "maro",
  "negru",
];

const counties = [
  "ALBA",
  "ARAD",
  "ARGEȘ",
  "BACĂU",
  "BIHOR",
  "BISTRIȚA-NĂSĂUD",
  "BOTOȘANI",
  "BRAȘOV",
  "BRĂILA",
  "BUZĂU",
  "CARAȘ-SEVERIN",
  "CĂLĂRAȘI",
  "CLUJ",
  "CONSTANȚA",
  "COVASNA",
  "DÂMBOVIȚA",
  "DOLJ",
  "GALAȚI",
  "GIURGIU",
  "GORJ",
  "HARGHITA",
  "HUNEDOARA",
  "IALOMIȚA",
  "IAȘI",
  "ILFOV",
  "MARAMUREȘ",
  "MEHEDINȚI",
  "MUREȘ",
  "NEAMȚ",
  "OLT",
  "PRAHOVA",
  "SATU MARE",
  "SĂLAJ",
  "SIBIU",
  "SUCEAVA",
  "TELEORMAN",
  "TIMIȘ",
  "TULCEA",
  "VASLUI",
  "VÂLCEA",
  "VRANCEA",
];

export {
  userCookieName,
  maxFileSize,
  mbToKb,
  validFileTypes,
  colors,
  counties,
};
