const hourToSeconds = 3600;
const hourToMillis = hourToSeconds * 1000;
const minutesToMilis = 60 * 1000;

const urlExpiresHours = 24;
const jwtExpiresHours = 72;
const sendVerifyEmail = true;

const jwtCookieName = "carsJwt";
const userCookieName = "carsUser";

const perPageDefault = 5;
const minPerPage = 5;
const intervalDeleteLinksMinutes = 5;
const intervalCompleteAppointmentMinutes = 60;
const requestBodySizeLimitMb = 10;

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
  hourToSeconds,
  hourToMillis,
  urlExpiresHours,
  jwtExpiresHours,
  sendVerifyEmail,
  jwtCookieName,
  userCookieName,
  perPageDefault,
  minPerPage,
  intervalDeleteLinksMinutes,
  intervalCompleteAppointmentMinutes,
  minutesToMilis,
  requestBodySizeLimitMb,
  counties,
};
