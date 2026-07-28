/**
 * Nearby star catalog with equatorial coordinates and physical properties.
 * Distances in light-years. RA in hours, Dec in degrees.
 * Positions are converted to Cartesian (1 unit = 1 ly) with Y = north.
 */

export type SpectralClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "L" | "T" | "WD";

export interface Star {
  id: string;
  name: string;
  /** Distance from the Sun in light-years */
  distanceLy: number;
  /** Right ascension in hours (0–24) */
  raHours: number;
  /** Declination in degrees (−90–90) */
  decDeg: number;
  spectralType: string;
  /** Absolute visual magnitude */
  absMag: number;
  /** Optional common name highlight */
  notable?: boolean;
}

/** Spectral-type base color (hex) */
export function spectralColor(type: string): string {
  const c = type.charAt(0).toUpperCase();
  switch (c) {
    case "O":
      return "#9bb0ff";
    case "B":
      return "#aabfff";
    case "A":
      return "#cad7ff";
    case "F":
      return "#f8f7ff";
    case "G":
      return "#fff4ea";
    case "K":
      return "#ffd2a1";
    case "M":
      return "#ffcc6f";
    case "L":
      return "#ff6b4a";
    case "T":
      return "#c44";
    case "D": // white dwarf
      return "#d0e0ff";
    default:
      return "#ffffff";
  }
}

/**
 * Convert equatorial (RA, Dec, dist) → Cartesian.
 * Y-up, +X toward RA=0 on the celestial equator.
 * Units: light-years.
 */
export function equatorialToCartesian(
  raHours: number,
  decDeg: number,
  distLy: number,
): [number, number, number] {
  const ra = (raHours * 15 * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const cosDec = Math.cos(dec);
  const x = distLy * cosDec * Math.cos(ra);
  const y = distLy * Math.sin(dec);
  const z = distLy * cosDec * Math.sin(ra);
  return [x, y, z];
}

/** Visual radius from absolute magnitude (exaggerated for visibility). */
export function visualRadius(absMag: number, isSun = false): number {
  if (isSun) return 0.22;
  // Brighter (lower absMag) → larger. Clamp for red dwarfs.
  const lumScale = Math.pow(10, (-absMag + 4.83) / 5); // relative to Sun
  const r = 0.08 + Math.sqrt(Math.max(lumScale, 0.0001)) * 0.18;
  return Math.min(Math.max(r, 0.05), 0.55);
}

/**
 * Stars within ~20 ly of the Sun (single systems / primary components).
 * Coordinates approximate Gaia/Hipparcos consensus values.
 */
export const NEARBY_STARS: Star[] = [
  {
    id: "sun",
    name: "Sun",
    distanceLy: 0,
    raHours: 0,
    decDeg: 0,
    spectralType: "G2V",
    absMag: 4.83,
    notable: true,
  },
  {
    id: "proxima",
    name: "Proxima Centauri",
    distanceLy: 4.246,
    raHours: 14.49598,
    decDeg: -62.67948,
    spectralType: "M5.5Ve",
    absMag: 15.6,
    notable: true,
  },
  {
    id: "alpha-cen-a",
    name: "Alpha Centauri A",
    distanceLy: 4.37,
    raHours: 14.66076,
    decDeg: -60.83398,
    spectralType: "G2V",
    absMag: 4.38,
    notable: true,
  },
  {
    id: "alpha-cen-b",
    name: "Alpha Centauri B",
    distanceLy: 4.37,
    raHours: 14.66076,
    decDeg: -60.83398,
    spectralType: "K1V",
    absMag: 5.71,
    notable: true,
  },
  {
    id: "barnard",
    name: "Barnard's Star",
    distanceLy: 5.96,
    raHours: 17.96374,
    decDeg: 4.69339,
    spectralType: "M4.0V",
    absMag: 13.22,
    notable: true,
  },
  {
    id: "wolf-359",
    name: "Wolf 359",
    distanceLy: 7.86,
    raHours: 10.93636,
    decDeg: 7.08072,
    spectralType: "M6.0V",
    absMag: 16.55,
    notable: true,
  },
  {
    id: "lalande-21185",
    name: "Lalande 21185",
    distanceLy: 8.31,
    raHours: 11.05572,
    decDeg: 35.96988,
    spectralType: "M2.0V",
    absMag: 10.44,
    notable: true,
  },
  {
    id: "sirius",
    name: "Sirius",
    distanceLy: 8.6,
    raHours: 6.75248,
    decDeg: -16.71612,
    spectralType: "A1V",
    absMag: 1.42,
    notable: true,
  },
  {
    id: "luyten-726-8",
    name: "Luyten 726-8",
    distanceLy: 8.73,
    raHours: 1.65136,
    decDeg: -17.95014,
    spectralType: "M5.5Ve",
    absMag: 15.4,
  },
  {
    id: "ross-154",
    name: "Ross 154",
    distanceLy: 9.69,
    raHours: 18.83109,
    decDeg: -23.83615,
    spectralType: "M3.5Ve",
    absMag: 13.07,
    notable: true,
  },
  {
    id: "ross-248",
    name: "Ross 248",
    distanceLy: 10.32,
    raHours: 23.69708,
    decDeg: 44.33434,
    spectralType: "M5.5V",
    absMag: 14.79,
  },
  {
    id: "eps-eri",
    name: "Epsilon Eridani",
    distanceLy: 10.5,
    raHours: 3.548,
    decDeg: -9.45826,
    spectralType: "K2V",
    absMag: 6.19,
    notable: true,
  },
  {
    id: "lacaille-9352",
    name: "Lacaille 9352",
    distanceLy: 10.74,
    raHours: 23.09867,
    decDeg: -35.85307,
    spectralType: "M0.5V",
    absMag: 9.75,
    notable: true,
  },
  {
    id: "ross-128",
    name: "Ross 128",
    distanceLy: 11.01,
    raHours: 11.79505,
    decDeg: 0.80455,
    spectralType: "M4.0V",
    absMag: 13.51,
  },
  {
    id: "ez-aqr",
    name: "EZ Aquarii",
    distanceLy: 11.27,
    raHours: 22.64586,
    decDeg: -15.29566,
    spectralType: "M5.0Ve",
    absMag: 15.64,
  },
  {
    id: "61-cyg-a",
    name: "61 Cygni A",
    distanceLy: 11.4,
    raHours: 21.11536,
    decDeg: 38.74492,
    spectralType: "K5.0V",
    absMag: 7.49,
    notable: true,
  },
  {
    id: "procyon",
    name: "Procyon",
    distanceLy: 11.46,
    raHours: 7.65503,
    decDeg: 5.22499,
    spectralType: "F5IV-V",
    absMag: 2.66,
    notable: true,
  },
  {
    id: "struve-2398",
    name: "Struve 2398",
    distanceLy: 11.52,
    raHours: 18.71131,
    decDeg: 59.56358,
    spectralType: "M3.0V",
    absMag: 11.16,
    notable: true,
  },
  {
    id: "groombridge-34",
    name: "Groombridge 34",
    distanceLy: 11.62,
    raHours: 0.30527,
    decDeg: 44.02547,
    spectralType: "M1.5V",
    absMag: 10.32,
    notable: true,
  },
  {
    id: "dx-cnc",
    name: "DX Cancri",
    distanceLy: 11.83,
    raHours: 8.49821,
    decDeg: 26.78231,
    spectralType: "M6.5V",
    absMag: 16.98,
  },
  {
    id: "eps-ind",
    name: "Epsilon Indi",
    distanceLy: 11.87,
    raHours: 22.05614,
    decDeg: -56.78625,
    spectralType: "K5V",
    absMag: 6.89,
    notable: true,
  },
  {
    id: "tau-ceti",
    name: "Tau Ceti",
    distanceLy: 11.91,
    raHours: 1.73447,
    decDeg: -15.93748,
    spectralType: "G8.5V",
    absMag: 5.69,
    notable: true,
  },
  {
    id: "gj-1061",
    name: "GJ 1061",
    distanceLy: 12.04,
    raHours: 3.59989,
    decDeg: -44.51436,
    spectralType: "M5.5V",
    absMag: 15.26,
  },
  {
    id: "yz-ceti",
    name: "YZ Ceti",
    distanceLy: 12.11,
    raHours: 1.20739,
    decDeg: -16.99927,
    spectralType: "M4.5V",
    absMag: 14.17,
  },
  {
    id: "luyten",
    name: "Luyten's Star",
    distanceLy: 12.2,
    raHours: 7.45484,
    decDeg: 5.22579,
    spectralType: "M3.5V",
    absMag: 11.94,
  },
  {
    id: "teegarden",
    name: "Teegarden's Star",
    distanceLy: 12.5,
    raHours: 2.88307,
    decDeg: 16.88074,
    spectralType: "M7.0V",
    absMag: 17.21,
  },
  {
    id: "kapteyn",
    name: "Kapteyn's Star",
    distanceLy: 12.83,
    raHours: 5.19415,
    decDeg: -45.01842,
    spectralType: "M1.5V",
    absMag: 10.87,
    notable: true,
  },
  {
    id: "lacaille-8760",
    name: "Lacaille 8760",
    distanceLy: 12.87,
    raHours: 21.28874,
    decDeg: -38.86764,
    spectralType: "M0V",
    absMag: 8.69,
    notable: true,
  },
  {
    id: "kruger-60",
    name: "Kruger 60",
    distanceLy: 13.15,
    raHours: 22.46673,
    decDeg: 57.69697,
    spectralType: "M3.0V",
    absMag: 11.58,
  },
  {
    id: "den-1048",
    name: "DEN 1048−3956",
    distanceLy: 13.19,
    raHours: 10.80847,
    decDeg: -39.94028,
    spectralType: "M8.5V",
    absMag: 16.96,
  },
  {
    id: "ross-614",
    name: "Ross 614",
    distanceLy: 13.35,
    raHours: 6.49004,
    decDeg: -2.81472,
    spectralType: "M4.5V",
    absMag: 13.09,
  },
  {
    id: "van-miseen",
    name: "Van Maanen's Star",
    distanceLy: 14.07,
    raHours: 0.82475,
    decDeg: 5.39206,
    spectralType: "DZ7",
    absMag: 14.21,
  },
  {
    id: "gliese-1",
    name: "Gliese 1",
    distanceLy: 14.17,
    raHours: 0.08528,
    decDeg: -37.51825,
    spectralType: "M1.5V",
    absMag: 10.35,
  },
  {
    id: "wolf-424",
    name: "Wolf 424",
    distanceLy: 14.3,
    raHours: 12.55639,
    decDeg: 9.01958,
    spectralType: "M5.5Ve",
    absMag: 14.97,
  },
  {
    id: "gliese-687",
    name: "Gliese 687",
    distanceLy: 14.84,
    raHours: 17.61625,
    decDeg: 68.33703,
    spectralType: "M3.0V",
    absMag: 10.89,
  },
  {
    id: "gliese-674",
    name: "Gliese 674",
    distanceLy: 14.84,
    raHours: 17.47472,
    decDeg: -46.89564,
    spectralType: "M3.0V",
    absMag: 11.09,
    notable: true,
  },
  {
    id: "gliese-876",
    name: "Gliese 876",
    distanceLy: 15.25,
    raHours: 22.89131,
    decDeg: -14.26369,
    spectralType: "M4.0V",
    absMag: 11.81,
    notable: true,
  },
  {
    id: "groombridge-1618",
    name: "Groombridge 1618",
    distanceLy: 15.89,
    raHours: 10.18603,
    decDeg: 49.46144,
    spectralType: "K7.0V",
    absMag: 8.16,
    notable: true,
  },
  {
    id: "gliese-832",
    name: "Gliese 832",
    distanceLy: 16.2,
    raHours: 21.56136,
    decDeg: -49.009,
    spectralType: "M1.5V",
    absMag: 10.19,
    notable: true,
  },
  {
    id: "40-eri",
    name: "40 Eridani",
    distanceLy: 16.26,
    raHours: 4.25417,
    decDeg: -7.65278,
    spectralType: "K1V",
    absMag: 5.92,
  },
  {
    id: "70-oph",
    name: "70 Ophiuchi",
    distanceLy: 16.64,
    raHours: 18.09236,
    decDeg: 2.49972,
    spectralType: "K0V",
    absMag: 5.71,
  },
  {
    id: "altair",
    name: "Altair",
    distanceLy: 16.73,
    raHours: 19.84639,
    decDeg: 8.86832,
    spectralType: "A7V",
    absMag: 2.22,
    notable: true,
  },
  {
    id: "gliese-682",
    name: "Gliese 682",
    distanceLy: 16.33,
    raHours: 17.61722,
    decDeg: -44.31722,
    spectralType: "M3.5V",
    absMag: 12.45,
  },
  {
    id: "sigma-dra",
    name: "Sigma Draconis",
    distanceLy: 18.8,
    raHours: 19.53694,
    decDeg: 69.66114,
    spectralType: "K0V",
    absMag: 5.87,
  },
  {
    id: "gliese-581",
    name: "Gliese 581",
    distanceLy: 20.55,
    raHours: 15.19417,
    decDeg: -7.72222,
    spectralType: "M3.0V",
    absMag: 11.56,
    notable: true,
  },
  {
    id: "ad-leo",
    name: "AD Leonis",
    distanceLy: 15.94,
    raHours: 10.32611,
    decDeg: 19.87222,
    spectralType: "M3.5Ve",
    absMag: 10.87,
    notable: true,
  },
  {
    id: "gliese-3379",
    name: "Gliese 3379",
    distanceLy: 17.14,
    raHours: 6.00194,
    decDeg: 2.70722,
    spectralType: "M3.5V",
    absMag: 12.95,
  },
  {
    id: "hn-peg",
    name: "HN Pegasi",
    distanceLy: 18.43,
    raHours: 21.74028,
    decDeg: 14.70556,
    spectralType: "G0V",
    absMag: 4.8,
  },
];

export interface PlacedStar extends Star {
  position: [number, number, number];
  color: string;
  radius: number;
}

export function placeStars(stars: Star[] = NEARBY_STARS): PlacedStar[] {
  return stars.map((s) => {
    const isSun = s.id === "sun";
    const position: [number, number, number] = isSun
      ? [0, 0, 0]
      : equatorialToCartesian(s.raHours, s.decDeg, s.distanceLy);

    // Offset Alpha Cen B slightly so it doesn't stack on A
    if (s.id === "alpha-cen-b") {
      position[0] += 0.15;
      position[2] += 0.1;
    }

    return {
      ...s,
      position,
      color: spectralColor(s.spectralType),
      radius: visualRadius(s.absMag, isSun),
    };
  });
}
