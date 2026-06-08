export interface MilitaryFlight {
  icao24: string;
  callsign: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  heading: number;
  trail?: [number, number][];
}

export interface NavalAsset {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  faction: string;
  status: string;
}

export interface ConflictEvent {
  id: string;
  title: string;
  desc: string;
  location: string;
  lat: number | null;
  lng: number | null;
  type: "air" | "missile" | "drone" | "ground" | "naval" | "strategic";
  time: string;
  url: string;
  severity: number;
  marketImpact?: boolean;
  originalTitle?: string;
  originalDesc?: string;
}
