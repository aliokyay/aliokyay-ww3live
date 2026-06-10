import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Navigation, Info, RadioReceiver, Activity, Globe, EyeOff, ShieldAlert, Cpu, Layers, Flame, Anchor, Volume2, VolumeX, RefreshCw, X, TrendingUp, TrendingDown, Link2, Copy, Plane } from 'lucide-react';
import type { ConflictEvent, NavalAsset, MilitaryFlight } from './types';
import { playAlert } from './audio';

const financeKeywords = [
  'ekonomi', 'borsa', 'hisse', 'faiz', 'enflasyon', 'petrol', 'altın', 'döviz',
  'economy', 'stock', 'market', 'inflation', 'interest rate', 'oil', 'gold',
  'nasdaq', 'brent', 'kripto', 'varil', 'endeks', 'fed',
  'wirtschaft', 'aktien', 'öl',
  'экономика', 'акции', 'нефть',
  'اقتصاد', 'أسهم', 'نفط',
  'economía', 'acciones', 'petróleo',
  'economia', 'azioni', 'petrolio',
  '经济', '股票', '石油',
  '経済', '株式', '石油'
];

const reqKeywords = [
  'war', 'conflict', 'strike', 'missile', 'dead', 'target', 'military', 'army', 'blast', 'attack', 'economy', 'fed', 'interest', 'stock', 'oil',
  'savaş', 'çatışma', 'saldırı', 'füze', 'ordu', 'borsa', 'faiz', 'petrol', 'ekonomi',
  'krieg', 'konflikt', 'angriff', 'rakete', 'militär', 'wirtschaft', 'aktien', 'öl',
  'война', 'конфликт', 'атака', 'ракета', 'военный', 'экономика', 'акции', 'нефть',
  'حرب', 'صراع', 'هجوم', 'صاروخ', 'عسكري', 'اقتصاد', 'أسهم', 'نفط',
  'guerra', 'conflicto', 'ataque', 'misil', 'militar', 'economía', 'acciones', 'petróleo',
  'conflitto', 'attacco', 'militare', 'economia', 'azioni', 'petrolio',
  '战争', '冲突', '袭击', '导弹', '军事', '经济', '股票', '石油',
  '戦争', '紛争', '攻撃', 'ミサイル', '軍事', '経済', '株式', '石油'
];

const MilitaryKeywords: Record<string, string[]> = {
  TR: ['savaş', 'füze', 'çatışma', 'askeri', 'ordu', 'donanma', 'saldırı', 'patlama', 'tatbikat', 'savunma', 'mühimmat', 'silah', 'harekat', 'operasyon', 'işgal', 'cephe', 'müdahale', 'terör', 'iha', 'siha'],
  EN: ['war', 'missile', 'conflict', 'military', 'army', 'navy', 'attack', 'explosion', 'drill', 'defense', 'ammunition', 'weapon', 'operation', 'invasion', 'frontline', 'intervention', 'terror', 'drone', 'uav', 'troops', 'strike', 'buy', 'purchase', 'pact', 'summit', 'border', 'police', 'protest', 'riot'],
  RU: ['война', 'ракета', 'конфликт', 'военный', 'армия', 'флот', 'атака', 'взрыв', 'учение', 'оборона', 'боеприпасы', 'оружие', 'операция', 'вторжение', 'фронт', 'вмешательство', 'террор', 'беспилотник', 'удар'],
  AR: ['حرب', 'صاروخ', 'صراع', 'عسكري', 'جيش', 'بحرية', 'هجوم', 'انفجار', 'تدريب', 'دفاع', 'ذخيرة', 'سلاح', 'عملية', 'غزو', 'جبهة', 'تدخل', 'إرهاب', 'طائرة بدون طيار', 'ضربة'],
  FR: ['guerre', 'missile', 'conflit', 'militaire', 'armée', 'marine', 'attaque', 'explosion', 'exercice', 'défense', 'munitions', 'arme', 'opération', 'invasion', 'front', 'intervention', 'terreur', 'drone', 'frappe'],
  ES: ['guerra', 'misil', 'conflicto', 'militar', 'ejército', 'armada', 'ataque', 'explosión', 'ejercicio', 'defensa', 'municiones', 'arma', 'operación', 'invasión', 'frente', 'intervención', 'terror', 'dron', 'golpe'],
  ZH: ['战争', '导弹', '冲突', '军事', '军队', '海军', '攻击', '爆炸', '演习', '防御', '弹药', '武器', '行动', '入侵', '前线', '干预', '恐怖', '无人机', '打击']
};

const geocodeCache: Record<string, {lat: number, lng: number}> = {
  "iran": {lat: 32.4279, lng: 53.6880},
  "israil": {lat: 31.0461, lng: 34.8516},
  "israel": {lat: 31.0461, lng: 34.8516},
  "lübnan": {lat: 33.8547, lng: 35.8623},
  "lebanon": {lat: 33.8547, lng: 35.8623},
  "suriye": {lat: 34.8021, lng: 38.9968},
  "syria": {lat: 34.8021, lng: 38.9968},
  "afganistan": {lat: 33.9391, lng: 67.7100},
  "afghanistan": {lat: 33.9391, lng: 67.7100},
  "afrika": {lat: 8.7832, lng: 34.5085},
  "africa": {lat: 8.7832, lng: 34.5085},
  "libya": {lat: 26.3351, lng: 17.2283},
  "kuveyt": {lat: 29.3759, lng: 47.9774},
  "kuwait": {lat: 29.3759, lng: 47.9774},
  "gazze": {lat: 31.5017, lng: 34.4668},
  "gaza": {lat: 31.5017, lng: 34.4668},
  "tel aviv": {lat: 32.0853, lng: 34.7818},
  "abd üssü": {lat: 33.3128, lng: 44.3615},
  "us base": {lat: 33.3128, lng: 44.3615},
  "kızıldeniz": {lat: 22.0, lng: 38.0},
  "red sea": {lat: 22.0, lng: 38.0},
  "hayfa": {lat: 32.7940, lng: 34.9896},
  "haifa": {lat: 32.7940, lng: 34.9896},
  "cenin": {lat: 32.4646, lng: 35.2939},
  "jenin": {lat: 32.4646, lng: 35.2939},
  "ramallah": {lat: 31.9038, lng: 35.2034},
  "khan yunis": {lat: 31.3462, lng: 34.3063},
  "han yunus": {lat: 31.3462, lng: 34.3063},
  "golan": {lat: 33.0, lng: 35.75},
  "basra": {lat: 30.5081, lng: 47.7835},
  "aden": {lat: 12.7984, lng: 45.0390},
  "sanaa": {lat: 15.3694, lng: 44.1910},
  "hodeidah": {lat: 14.7978, lng: 42.9545},
  "hudeyde": {lat: 14.7978, lng: 42.9545},
  "kırım": {lat: 45.3384, lng: 34.4079},
  "crimea": {lat: 45.3384, lng: 34.4079},
  "sivastopol": {lat: 44.6166, lng: 33.5254},
  "sevastopol": {lat: 44.6166, lng: 33.5254},
  "donetsk": {lat: 48.0159, lng: 37.8028},
  "luhansk": {lat: 48.5740, lng: 39.3078},
  "donbas": {lat: 48.0, lng: 38.0},
  "tayvan": {lat: 23.6978, lng: 120.9605},
  "taiwan": {lat: 23.6978, lng: 120.9605},
  "güney çin denizi": {lat: 12.0, lng: 114.0},
  "south china sea": {lat: 12.0, lng: 114.0},
  "ukrayna": {lat: 48.3794, lng: 31.1656},
  "ukraine": {lat: 48.3794, lng: 31.1656},
  "kiev": {lat: 50.4501, lng: 30.5234},
  "kyiv": {lat: 50.4501, lng: 30.5234},
  "sudan": {lat: 12.8628, lng: 30.2176},
  "myanmar": {lat: 21.9162, lng: 95.9560},
  "kongo": {lat: -4.0383, lng: 21.7587},
  "congo": {lat: -4.0383, lng: 21.7587},
  "somali": {lat: 5.1521, lng: 46.1996},
  "yemen": {lat: 15.5527, lng: 48.5164},
  "bağdat": {lat: 33.3152, lng: 44.3661},
  "baghdad": {lat: 33.3152, lng: 44.3661},
  "erbil": {lat: 36.1911, lng: 44.0092},
  "beyrut": {lat: 33.8938, lng: 35.5018},
  "beirut": {lat: 33.8938, lng: 35.5018},
  "bekaa": {lat: 33.9189, lng: 36.0076},
  "şam": {lat: 33.5138, lng: 36.2765},
  "damascus": {lat: 33.5138, lng: 36.2765},
  "halep": {lat: 36.2021, lng: 37.1343},
  "aleppo": {lat: 36.2021, lng: 37.1343},
  "idlib": {lat: 35.9306, lng: 36.6339},
  "tahran": {lat: 35.6892, lng: 51.3890},
  "tehran": {lat: 35.6892, lng: 51.3890},
  "isfahan": {lat: 32.6539, lng: 51.6660},
  "natanz": {lat: 33.5103, lng: 51.9213},
  "st. petersburg": {lat: 59.9311, lng: 30.3609},
  "moskova": {lat: 55.7558, lng: 37.6173},
  "moscow": {lat: 55.7558, lng: 37.6173},
  "odessa": {lat: 46.4825, lng: 30.7233},
  "odesa": {lat: 46.4825, lng: 30.7233},
  "kharkiv": {lat: 50.0057, lng: 36.2292},
  "harkov": {lat: 50.0057, lng: 36.2292},
  "lviv": {lat: 49.8397, lng: 24.0297},
  "belgorod": {lat: 50.5997, lng: 36.5983},
  "kursk": {lat: 51.7308, lng: 36.1930},
  "rostov": {lat: 47.2313, lng: 39.7233},
  "pekin": {lat: 39.9042, lng: 116.4074},
  "beijing": {lat: 39.9042, lng: 116.4074},
  "taypey": {lat: 25.0330, lng: 121.5654},
  "taipei": {lat: 25.0330, lng: 121.5654},
  "pyongyang": {lat: 39.0194, lng: 125.7381},
  "seul": {lat: 37.5665, lng: 126.9780},
  "seoul": {lat: 37.5665, lng: 126.9780},
  "tokyo": {lat: 35.6762, lng: 139.6503},
  "washington": {lat: 38.9072, lng: -77.0369},
  "new york": {lat: 40.7128, lng: -74.0060},
  "pentagon": {lat: 38.8719, lng: -77.0563},
  "londra": {lat: 51.5074, lng: -0.1278},
  "london": {lat: 51.5074, lng: -0.1278},
  "paris": {lat: 48.8566, lng: 2.3522},
  "berlin": {lat: 52.5200, lng: 13.4050},
  "refah": {lat: 31.2968, lng: 34.2455},
  "rafah": {lat: 31.2968, lng: 34.2455},
  "kudüs": {lat: 31.7683, lng: 35.2137},
  "jerusalem": {lat: 31.7683, lng: 35.2137},

  "kore": {lat: 35.9078, lng: 127.7669},
  "korea": {lat: 35.9078, lng: 127.7669},
  "iraq": {lat: 33.2232, lng: 43.6793},
  "irak": {lat: 33.2232, lng: 43.6793},
  "mısır": {lat: 26.8206, lng: 30.8025},
  "egypt": {lat: 26.8206, lng: 30.8025},
  "ürdün": {lat: 30.5852, lng: 36.2384},
  "jordan": {lat: 30.5852, lng: 36.2384},
  "suudi arabistan": {lat: 23.8859, lng: 45.0792},
  "saudi arabia": {lat: 23.8859, lng: 45.0792},
  "ingiltere": {lat: 52.3555, lng: -1.1743},
  "uk": {lat: 52.3555, lng: -1.1743},
  "almanya": {lat: 51.1657, lng: 10.4515},
  "germany": {lat: 51.1657, lng: 10.4515},
  "fransa": {lat: 46.2276, lng: 2.2137},
  "france": {lat: 46.2276, lng: 2.2137},
  "russian": {lat: 55.7558, lng: 37.6173},
  "ukrainian": {lat: 48.3794, lng: 31.1656},
  "israeli": {lat: 31.0461, lng: 34.8516},
  "iranian": {lat: 32.4279, lng: 53.6880},
  "chinese": {lat: 39.9042, lng: 116.4074},
  "american": {lat: 38.9072, lng: -77.0369},
  "british": {lat: 51.5074, lng: -0.1278},
  "french": {lat: 48.8566, lng: 2.3522},
  "palestinian": {lat: 31.9038, lng: 35.2034},
  "syrian": {lat: 34.8021, lng: 38.9968},
  "yemeni": {lat: 15.5527, lng: 48.5164},
  "houthi": {lat: 15.5527, lng: 48.5164},
  "taiwanese": {lat: 23.6978, lng: 120.9605},
  "lebanese": {lat: 33.8547, lng: 35.8623},
  "spanish": {lat: 40.4168, lng: -3.7038},
  "spain": {lat: 40.4168, lng: -3.7038},
  "russia": {lat: 55.7558, lng: 37.6173},
  "palestine": {lat: 31.9038, lng: 35.2034},
  "us": {lat: 38.9072, lng: -77.0369},
  "usa": {lat: 38.9072, lng: -77.0369},
  "china": {lat: 39.9042, lng: 116.4074},
  "norway": {lat: 60.4720, lng: 8.4689},
  "norwegian": {lat: 60.4720, lng: 8.4689},
  "sweden": {lat: 60.1282, lng: 18.6435},
  "swedish": {lat: 60.1282, lng: 18.6435},
  "finland": {lat: 61.9241, lng: 25.7482},
  "finnish": {lat: 61.9241, lng: 25.7482},
  "poland": {lat: 51.9194, lng: 19.1451},
  "polish": {lat: 51.9194, lng: 19.1451},
  "german": {lat: 51.1657, lng: 10.4515},
  "japan": {lat: 36.2048, lng: 138.2529},
  "japanese": {lat: 36.2048, lng: 138.2529},
  "korean": {lat: 35.9078, lng: 127.7669},
  "egyptian": {lat: 26.8206, lng: 30.8025},
  "italy": {lat: 41.8719, lng: 12.5674},
  "italian": {lat: 41.8719, lng: 12.5674},
  "greece": {lat: 39.0742, lng: 21.8243},
  "greek": {lat: 39.0742, lng: 21.8243},
  "turkey": {lat: 38.9637, lng: 35.2433},
  "turkish": {lat: 38.9637, lng: 35.2433},
  "india": {lat: 20.5937, lng: 78.9629},
  "indian": {lat: 20.5937, lng: 78.9629},
  "pakistan": {lat: 30.3753, lng: 69.3451},
  "pakistani": {lat: 30.3753, lng: 69.3451},
  "brazil": {lat: -14.2350, lng: -51.9253},
  "brazilian": {lat: -14.2350, lng: -51.9253},
  "canada": {lat: 56.1304, lng: -106.3468},
  "canadian": {lat: 56.1304, lng: -106.3468},
  "australia": {lat: -25.2744, lng: 133.7751},
  "australian": {lat: -25.2744, lng: 133.7751},
  "uae": {lat: 23.4241, lng: 53.8478}
};
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function doGeocode(locationName: string): Promise<{lat: number, lng: number} | null> {
  if (geocodeCache[locationName]) return geocodeCache[locationName];
  try {
     const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
     const res = await fetch(url, { headers: { "User-Agent": "WW3Live/1.0 (alio61872@gmail.com)" } });
     
     if (!res.ok) {
       await sleep(2000);
       return null;
     }
     
     const data = await res.json();
     if (data && Array.isArray(data) && data.length > 0) {
       const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
       geocodeCache[locationName] = loc;
       await sleep(1000); 
       return loc;
     }
     await sleep(1000); 
  } catch(e) {
  }
  return null;
}

// Custom Map Marker Icons using DOM
const getIcon = (type: string, isHighlighted: boolean = false, clusterCount: number = 1, isNew: boolean = false) => {
  const typeLower = (type || '').toLowerCase();
  const color = colors[typeLower as keyof typeof colors] || '#fff';
  const pulseHtml = isHighlighted ? `
    <div style="position: absolute; inset: -16px; border-radius: 50%; background: ${color}; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6; z-index: -1;"></div>
  ` : '';
  
  const scale = isHighlighted ? 'transform: scale(1.3);' : '';
  
  const clusterBadgeHtml = clusterCount > 1 ? `
    <div style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; font-size: 9px; font-weight: bold; border-radius: 12px; padding: 2px 5px; border: 1px solid #7f1d1d; box-shadow: 0 0 4px rgba(0,0,0,0.5); z-index: 10;">
      ${clusterCount}
    </div>
  ` : '';

  const newAlertClass = isNew ? 'is-new-alert' : '';

  let svgIcon = '';
  if (typeLower === 'drone') {
     svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"/></svg>`;
  } else if (typeLower === 'missile') {
     svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 4.5-4.5"/><path d="M5 19 3 14l5-5c1-1 3-2 5-2h4l4-4 2 2-4 4v4c0 2-1 4-2 5l-5 5-5-2-2-4z"/><path d="M12 8h0M8 12h0"/></svg>`;
  } else if (typeLower === 'naval') {
     svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 14h19l-2-6h-15zM2 18c1.5 0 2.5-1 4-1s2.5 1 4 1 2.5-1 4-1 2.5 1 4 1M8 8V4M16 8V6"/></svg>`;
  } else if (typeLower === 'ground') {
     svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6 12h12M12 12v9M9 21h6"/></svg>`;
  } else if (typeLower === 'air') {
     svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l5 5-3 3-3-1v3l4 2 2 4h3l-1-3 3-3 5 5 1.2-.7c.4-.2.7-.6.6-1.1z"/></svg>`;
  } else {
     svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="6.5"/></svg>`;
  }

  const html = `
    <div class="${newAlertClass}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${color}; background: ${color}22; position: relative; display: flex; align-items: center; justify-content: center; ${scale} transition: all 0.3s; z-index: ${isHighlighted ? 999 : 1}; box-shadow: 0 0 12px ${color}, inset 0 0 8px ${color};">
      <div style="display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 8px ${color})">${svgIcon}</div>
      <div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${color}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6; filter: drop-shadow(0 0 8px ${color});"></div>
      ${pulseHtml}
      ${clusterBadgeHtml}
    </div>
  `;
  return L.divIcon({
    className: '',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const getNavalAssetIcon = (faction: string) => {
  const color = faction === 'NATO' ? '#3b82f6' : faction === 'Iran' ? '#ef4444' : '#eab308';
  const html = `
    <div style="width: 28px; height: 28px; border-radius: 4px; border: 2px solid ${color}; background: ${color}44; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-anchor"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
    </div>
  `;
  return L.divIcon({
    className: 'custom-naval-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const CHOKE_POINTS = [
  { id: "Hormuz", defaultName: "Strait of Hormuz", lat: 26.5667, lng: 56.2500, defaultDesc: "Critical global oil transit checkpoint. Approximately 20% of global oil consumption passes through here daily." },
  { id: "Suez", defaultName: "Suez Canal", lat: 30.6000, lng: 32.3500, defaultDesc: "Vital waterway connecting the Mediterranean Sea to the Red Sea. Approx 12% of global trade passes through the canal." },
  { id: "Panama", defaultName: "Panama Canal", lat: 9.1177, lng: -79.7905, defaultDesc: "Crucial maritime choke point connecting the Atlantic and Pacific oceans, heavily impacting global supply chains." },
  { id: "Bosphorus", defaultName: "Bosphorus Strait", lat: 41.0200, lng: 29.0000, defaultDesc: "Crucial waterway connecting the Black Sea to the Mediterranean, acting as the primary naval transit route for regional forces." },
  { id: "Dardanelles", defaultName: "Dardanelles", lat: 40.2000, lng: 26.4000, defaultDesc: "Strategic passage controlling maritime traffic from the Mediterranean into the Sea of Marmara and the Black Sea." },
  { id: "Gibraltar", defaultName: "Strait of Gibraltar", lat: 35.9667, lng: -5.5000, defaultDesc: "The sole natural military and trade gateway connecting the Atlantic Ocean to the Mediterranean Sea." },
  { id: "RedSea", defaultName: "Red Sea", lat: 22.0000, lng: 38.0000, defaultDesc: "A globally vital commercial network heavily exposed to geopolitical tension, piracy, and naval blockades." },
  { id: "Malacca", defaultName: "Strait of Malacca", lat: 4.0000, lng: 100.0000, defaultDesc: "Major shipping channel between the Indian Ocean and the Pacific Ocean." },
  { id: "BabElMandeb", defaultName: "Bab el-Mandeb Strait", lat: 12.5833, lng: 43.3333, defaultDesc: "A strategic link between the Mediterranean Sea and the Indian Ocean via the Red Sea." },
  { id: "EasternMed", defaultName: "Eastern Mediterranean", lat: 34.0000, lng: 33.0000, defaultDesc: "A heavily militarized maritime region acting as a nexus for energy transit and geopolitical friction." },
  { id: "BlackSeaStraits", defaultName: "Black Sea & Turkish Straits", lat: 43.0000, lng: 34.0000, defaultDesc: "Highly contested naval theater and primary transit point for Eurasian trade and regional fleets." },
  { id: "SouthChinaSea", defaultName: "South China Sea", lat: 14.0000, lng: 115.0000, defaultDesc: "One of the world's most heavily contested and militarized maritime regions, crucial for global trade." },
  { id: "DiegoGarcia", defaultName: "Indian Ocean / Diego Garcia", lat: -7.3000, lng: 72.4000, defaultDesc: "Critical strategic military hub offering unmatched logistical reach across the Indo-Pacific theater." },
  { id: "Djibouti", defaultName: "Djibouti / Horn of Africa", lat: 11.8000, lng: 42.6000, defaultDesc: "Concentrated host of international military bases overlooking the critical Bab el-Mandeb strait." },
  { id: "Baltic", defaultName: "Eastern Europe / Baltic Region", lat: 56.0000, lng: 18.0000, defaultDesc: "Northern strategic flank featuring high tension naval and airspace boundaries." }
];

const CHOKE_POINTS_LOCALE = {
  Hormuz: {
    name: { tr: "Hürmüz Boğazı", en: "Strait of Hormuz", de: "Straße von Hormus", it: "Stretto di Hormuz", es: "Estrecho de Ormuz", zh: "霍尔木兹海峡", ja: "ホルムズ海峡", ar: "مضيق هرمز" },
    desc: {
      tr: "Kritik küresel petrol geçiş noktası. Küresel petrol tüketiminin %20'si her gün buradan geçmektedir.",
      en: "Critical global oil transit checkpoint. Approximately 20% of global oil consumption passes through here daily.",
      de: "Kritischer globaler Öltransitpunkt. Etwa 20 % des weltweiten Ölverbrauchs fließen täglich hier durch.",
      it: "Punto di controllo critico per il transito globale di petrolio. Circa il 20% del consumo globale passa da qui ogni giorno.",
      es: "Punto de control crítico del tránsito mundial de petróleo.",
      zh: "全球关键的石油运输检查点。每天约有 20% 的全球石油消耗量从此经过。",
      ja: "世界的な石油輸送の重要な中継地。毎日、世界の石油消費量の約20%がここを通過します。",
      ar: "نقطة تفتيش عالمية بالغة الأهمية لنقل النفط."
    }
  },
  Suez: {
    name: { tr: "Süveyş Kanalı", en: "Suez Canal", de: "Suezkanal", it: "Canale di Suez", es: "Canal de Suez", zh: "苏伊士运河", ja: "スエズ運河", ar: "قناة السويس" },
    desc: {
      tr: "Akdeniz'i Kızıldeniz'e bağlayan hayati su yolu. Küresel ticaretin %12'si bu kanaldan geçmektedir.",
      en: "Vital waterway connecting the Mediterranean Sea to the Red Sea. Approx 12% of global trade passes through the canal.",
      de: "Wichtige Wasserstraße, die das Mittelmeer mit dem Roten Meer verbindet.",
      it: "Via d'acqua vitale che collega il Mar Mediterraneo al Mar Rosso.",
      es: "Vía fluvial vital que conecta el Mar Mediterráneo con el Mar Rojo.",
      zh: "连接地中海和红海的生命线。全球约 12% 的贸易量通过该运河。",
      ja: "地中海と紅海を結ぶ極めて重要な水路。",
      ar: "ممر مائي حيوي يربط البحر الأبيض المتوسط بالبحر الأحمر."
    }
  },
  Panama: {
    name: { tr: "Panama Kanalı", en: "Panama Canal", de: "Panamakanal", it: "Canale di Panama", es: "Canal de Panamá", zh: "巴拿马运河", ja: "パナマ運河", ar: "قناة بنما" },
    desc: {
      tr: "Atlantik ve Pasifik okyanuslarını bağlayan, küresel tedarik zincirini derinden etkileyen kritik deniz geçiş noktası.",
      en: "Crucial maritime choke point connecting the Atlantic and Pacific oceans, heavily impacting global supply chains.",
      de: "Entscheidender maritimer Engpass, der den Atlantik und Pazifik verbindet.",
      it: "Cruciale punto di strozzatura marittimo che collega gli oceani Atlantico e Pacifico.",
      es: "Estrechamiento marítimo crucial que conecta los océanos Atlántico y Pacífico.",
      zh: "连接大西洋和太平洋的关键海上咽喉，严重影响全球供应链。",
      ja: "大西洋と太平洋を結ぶ重要な海上チョークポイント。",
      ar: "نقطة اختناق بحرية حاسمة تربط المحيطين الأطلسي والهادئ."
    }
  },
  Bosphorus: {
    name: { tr: "İstanbul Boğazı", en: "Bosphorus Strait", de: "Bosporus", it: "Stretto del Bosforo", es: "Estrecho del Bósforo", zh: "博斯普鲁斯海峡", ja: "ボスポラス海峡", ar: "مضيق البوسفور" },
    desc: {
      tr: "Karadeniz'i Akdeniz'e bağlayan, bölgesel güçlerin ana deniz geçiş rotası olarak işlev gören kritik su yolu.",
      en: "Crucial waterway connecting the Black Sea to the Mediterranean, acting as the primary naval transit route for regional forces.",
      de: "Wichtige Wasserstraße, die das Schwarze Meer mit dem Mittelmeer verbindet.",
      it: "Via d'acqua cruciale che collega il Mar Nero al Mediterraneo.",
      es: "Vía fluvial crucial que conecta el Mar Negro con el Mediterráneo.",
      zh: "连接黑海和地中海的关键水道，是地区力量的主要海军部队过境路线。",
      ja: "黒海と地中海を結ぶ重要な水路。",
      ar: "ممر مائي حاسم يربط البحر الأسود بالبحر الأبيض المتوسط."
    }
  },
  Dardanelles: {
    name: { tr: "Çanakkale Boğazı", en: "Dardanelles", de: "Dardanellen", it: "Dardanelli", es: "Dardanelos", zh: "达达尼尔海峡", ja: "ダーダネルス海峡", ar: "مضيق الدردنيل" },
    desc: {
      tr: "Akdeniz'den Marmara Denizi'ne ve Karadeniz'e deniz trafiğini kontrol eden stratejik geçiş.",
      en: "Strategic passage controlling maritime traffic from the Mediterranean into the Sea of Marmara and the Black Sea.",
      de: "Strategische Passage, die den Seeverkehr vom Mittelmeer in das Marmarameer kontrolliert.",
      it: "Passaggio strategico che controlla il traffico marittimo dal Mediterraneo al Mar di Marmara.",
      es: "Paso estratégico que controla el tráfico marítimo desde el Mediterráneo.",
      zh: "控制从地中海进入马尔马拉海和黑海的海上交通的战略通道。",
      ja: "地中海からマルマラ海および黒海への海上交通を管理する戦略的な通路。",
      ar: "ممر استراتيجي يتحكم في حركة المرور البحري من البحر الأبيض المتوسط."
    }
  },
  Gibraltar: {
    name: { tr: "Cebelitarık Boğazı", en: "Strait of Gibraltar", de: "Straße von Gibraltar", it: "Stretto di Gibilterra", es: "Estrecho de Gibraltar", zh: "直布罗陀海峡", ja: "ジブラルタル海峡", ar: "مضيق جبل طارق" },
    desc: {
      tr: "Atlantik Okyanusu'nu Akdeniz'e bağlayan tek doğal askeri ve ticari kapı.",
      en: "The sole natural military and trade gateway connecting the Atlantic Ocean to the Mediterranean Sea.",
      de: "Das einzige natürliche militärische und handelstechnische Tor, das den Atlantischen Ozean mit dem Mittelmeer verbindet.",
      it: "L'unica porta naturale militare e commerciale che collega l'Oceano Atlantico al Mar Mediterraneo.",
      es: "La única puerta natural militar y comercial que conecta el Océano Atlántico con el Mar Mediterráneo.",
      zh: "连接大西洋和地中海的唯一天然军事和贸易门户。",
      ja: "大西洋と地中海を結ぶ唯一の天然の軍事および貿易の玄関口。",
      ar: "البوابة العسكرية والتجارية الطبيعية الوحيدة التي تربط المحيط الأطلسي بالبحر الأبيض المتوسط."
    }
  },
  RedSea: {
    name: { tr: "Kızıldeniz", en: "Red Sea", de: "Rotes Meer", it: "Mar Rosso", es: "Mar Rojo", zh: "红海", ja: "紅海", ar: "البحر الأحمر" },
    desc: {
      tr: "Jeopolitik gerilimlere, korsanlığa ve deniz ablukalarına son derece açık, küresel çapta hayati bir ticari ağ.",
      en: "A globally vital commercial network heavily exposed to geopolitical tension, piracy, and naval blockades.",
      de: "Ein weltweit wichtiges Handelsnetzwerk, das stark geopolitischen Spannungen ausgesetzt ist.",
      it: "Una rete commerciale di vitale importanza a livello globale, fortemente esposta a tensiones.",
      es: "Una red comercial vital a nivel mundial fuertemente expuesta a tensiones geopolíticas.",
      zh: "全球至关重要的商业网络，极易受到地缘政治紧张局势、海盗和海军封锁的影响。",
      ja: "地政学的緊張、海賊行為、および海上封鎖の影響を強く受ける世界的に重要な商業ネットワーク。",
      ar: "شبكة تجارية ذات أهمية حيوية على مستوى العالم، معرضة بشدة للتوترات الجيوسياسية."
    }
  },
  Malacca: {
    name: { tr: "Malakka Boğazı", en: "Strait of Malacca", de: "Straße von Malakka", it: "Stretto di Malacca", es: "Estrecho de Malaca", zh: "马六甲海峡", ja: "マラッカ海峡", ar: "مضيق ملقا" },
    desc: {
      tr: "Hint Okyanusu ile Pasifik Okyanusu arasındaki birincil nakliye kanalı.",
      en: "Major shipping channel between the Indian Ocean and the Pacific Ocean.",
      de: "Wichtiger Schifffahrtskanal zwischen dem Indischen Ozean und dem Pazifischen Ozean.",
      it: "Principale canale di navigazione tra l'Oceano Indiano e l'Oceano Pacifico.",
      es: "Principal canal de envío entre el Océano Índico y el Océano Pacífico.",
      zh: "印度洋和太平洋之间主要的航运通道。",
      ja: "インド洋と太平洋を結ぶ主要な航路。",
      ar: "قناة شحن رئيسية بين المحيط الهندي والمحيط الهادئ."
    }
  },
  BabElMandeb: {
    name: { tr: "Babül-Mendep Boğazı", en: "Bab el-Mandeb Strait", de: "Bab al-Mandab", it: "Stretto di Bab el-Mandeb", es: "Estrecho de Bab el-Mandeb", zh: "曼德海峡", ja: "バブ・エル・マンデブ海峡", ar: "مضيق باب المندب" },
    desc: {
      tr: "Kızıldeniz üzerinden Akdeniz ile Hint Okyanusu arasında stratejik bir bağlantı.",
      en: "A strategic link between the Mediterranean Sea and the Indian Ocean via the Red Sea.",
      de: "Eine strategische Verbindung zwischen dem Mittelmeer und dem Indischen Ozean.",
      it: "Un collegamento strategico tra il Mar Mediterraneo e l'Oceano Indiano.",
      es: "Un enlace estratégico entre el Mar Mediterráneo y el Océano Índico.",
      zh: "通过红海连接地中海和印度洋的战略枢纽。",
      ja: "紅海を経て地中海とインド洋を結ぶ戦略的リンク。",
      ar: "رابط استراتيجي بين البحر الأبيض المتوسط والمحيط الهندي."
    }
  },
  EasternMed: {
    name: { tr: "Doğu Akdeniz", en: "Eastern Mediterranean", de: "Östliches Mittelmeer", it: "Mediterraneo Orientale", es: "Mediterráneo Oriental", zh: "东地中海", ja: "東地中海", ar: "شرق البحر الأبيض المتوسط" },
    desc: {
      tr: "Enerji geçişi ve jeopolitik sürtüşmeler için yoğun olarak askerileştirilmiş bir deniz bölgesi.",
      en: "A heavily militarized maritime region acting as a nexus for energy transit and geopolitical friction.",
      de: "Eine stark militarisierte maritime Region voller geopolitischer Reibungen.",
      it: "Una regione marittima pesantemente militarizzata e ricca di tensioni.",
      es: "Región fuertemente militarizada y centro de fricción geopolítica.",
      zh: "高度军事化的海域，也是能源过境和地缘政治摩擦的核心地带。",
      ja: "エネルギー輸送と地政学的摩擦の交差点として機能する軍事化された海域。",
      ar: "منطقة بحرية شديدة العسكرة تعمل كمركز لنقل الطاقة."
    }
  },
  BlackSeaStraits: {
    name: { tr: "Karadeniz ve Türk Boğazları", en: "Black Sea & Turkish Straits", de: "Schwarzes Meer & Meerengen", it: "Mar Nero e Stretti", es: "Mar Negro y Estrechos", zh: "黑海及土耳其海峡", ja: "黒海とトルコ海峡", ar: "البحر الأسود والمضايق" },
    desc: {
      tr: "Avrasya ticareti ve bölgesel donanmalar için çekişmeli deniz tiyatrosu ve birincil geçiş noktası.",
      en: "Highly contested naval theater and primary transit point for Eurasian trade and regional fleets.",
      de: "Umkämpftes Seegebiet und primärer Transitpunkt für Flotten.",
      it: "Punto di transito primario per il commercio euroasiatico.",
      es: "Punto de tránsito principal para flotas regionales.",
      zh: "激烈争夺的海军战区，也是欧亚贸易和地区舰队的主要中转站。",
      ja: "ユーラシア貿易と地域艦隊の主要な中継点となる争奪の激しい海域。",
      ar: "نقطة عبور رئيسية للتجارة والأساطيل الإقليمية."
    }
  },
  SouthChinaSea: {
    name: { tr: "Güney Çin Denizi", en: "South China Sea", de: "Südchinesisches Meer", it: "Mar Cinese Meridionale", es: "Mar de China Meridional", zh: "南海", ja: "南シナ海", ar: "بحر الصين الجنوبي" },
    desc: {
      tr: "Dünyanın en yoğun tartışmalı ve askerileştirilmiş, küresel ticaret için çok önemli deniz bölgelerinden biri.",
      en: "One of the world's most heavily contested and militarized maritime regions, crucial for global trade.",
      de: "Eine der am stärksten umkämpften und militarisierten Meeresregionen der Welt.",
      it: "Una delle regioni marittime più militarizzate del mondo.",
      es: "Región marítima fuertemente militarizada, crucial para el comercio global.",
      zh: "世界上争议和军事化最严重的海域之一，对全球贸易至关重要。",
      ja: "世界の貿易に不可欠な、世界で最も争いと軍事化の激しい海域の1つ。",
      ar: "منطقة بحرية متنازع عليها بشدة، حاسمة للتجارة العالمية."
    }
  },
  DiegoGarcia: {
    name: { tr: "Hint Okyanusu / Diego Garcia", en: "Indian Ocean / Diego Garcia", de: "Indischer Ozean / Diego Garcia", it: "Oceano Indiano / Diego Garcia", es: "Océano Índico / Diego García", zh: "印度洋 / 迪戈加西亚岛", ja: "インド洋 / ディエゴガルシア島", ar: "المحيط الهندي / دييغو غارسيا" },
    desc: {
      tr: "Hint-Pasifik sahasında eşsiz lojistik erişim sunan kritik stratejik askeri merkez.",
      en: "Critical strategic military hub offering unmatched logistical reach across the Indo-Pacific theater.",
      de: "Kritischer strategischer militärischer Knotenpunkt.",
      it: "Snodo militare strategico critico.",
      es: "Centro militar estratégico crítico.",
      zh: "重要的战略军事枢纽，在印太战区内提供无与伦比的后勤覆盖范围。",
      ja: "インド太平洋地域で比類のない後継能力を提供する戦略的軍事拠点。",
      ar: "محور عسكري حاسم يقدم وصولاً لوجستياً لا مثيل له."
    }
  },
  Djibouti: {
    name: { tr: "Cibuti / Afrika Boynuzu", en: "Djibouti / Horn of Africa", de: "Dschibuti / Horn von Afrika", it: "Gibuti / Corno d'Africa", es: "Yibuti / Cuerno de África", zh: "吉布提 / 非洲之角", ja: "ジブチ / アフリカの角", ar: "جيبوتي / القرن الأفريقي" },
    desc: {
      tr: "Kritik Babül-Mendep Boğazı'na bakan uluslararası askeri üslerin yoğun ev sahibi.",
      en: "Concentrated host of international military bases overlooking the critical Bab el-Mandeb strait.",
      de: "Standort vieler internationaler Militärbasen mit Blick auf das Rote Meer.",
      it: "Sede di base militare internazionale con vista sul Mar Rosso.",
      es: "Anfitrión de bases militares internacionales con vistas al Mar Rojo.",
      zh: "国际军事基地的集中地，俯瞰着重要的曼德海峡。",
      ja: "重要なバブ・エル・マンデブ海峡を見下ろす国際軍事基地の集中する拠点。",
      ar: "مضيف مركز للقواعد العسكرية الدولية المطلة على مضيق باب المندب."
    }
  },
  Baltic: {
    name: { tr: "Doğu Avrupa / Baltık Bölgesi", en: "Eastern Europe / Baltic Region", de: "Osteuropa / Ostseeraum", it: "Europa Orientale / Regione Baltica", es: "Europa del Este / Región Báltica", zh: "东欧 / 波罗的海地区", ja: "東ヨーロッパ / バルト海地域", ar: "أوروبا الشرقية / منطقة بحر البلطيق" },
    desc: {
      tr: "Yüksek tansiyonlu deniz ve hava sahası sınırlarına sahip kuzey stratejik kanadı.",
      en: "Northern strategic flank featuring high tension naval and airspace boundaries.",
      de: "Nördliche strategische Flanke mit hohen Spannungen.",
      it: "Fianco strategico settentrionale ad alta tensione.",
      es: "Flanco estratégico del norte con alta tensión militar.",
      zh: "北翼战略侧翼，其特点是极度紧张的海军和空域边界。",
      ja: "緊張感の高い海軍および空域の境界を特徴とする北の戦略的側面。",
      ar: "خاصرة شمالية استراتيجية ذات حدود بحرية وجوية شديدة التوتر."
    }
  }
};

const getChokePointIcon = () => {
  return L.divIcon({
    className: '',
    html: `<div class="relative flex items-center justify-center w-10 h-10">
             <div class="absolute inset-0 bg-orange-500 rounded-full opacity-40 animate-ping"></div>
             <div class="w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-full z-10 shadow-[0_0_15px_#f97316]"></div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const getMilitaryFlightIcon = (heading: number) => {
  const color = '#ffffff'; // pure white
  const adjustedHeading = heading; 
  
  const html = `
    <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: rotate(${adjustedHeading}deg); filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.8));">
      <svg viewBox="0 0 24 24" fill="${color}" opacity="1" style="width: 24px; height: 24px;">
        <path d="M12,2 L14,9 L22,14 L22,16 L14,15 L14,20 L16,22 L16,23 L12,22 L8,23 L8,22 L10,20 L10,15 L2,16 L2,14 L10,9 Z" />
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-military-icon border-0 bg-transparent',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const i18n = {
  tr: {
    liveIntel: "Canlı İstihbarat",
    operations: "Operasyonlar",
    logistics: "Lojistik",
    archive: "Arşiv",
    sysTime: "SİSTEM SAATİ",
    recentIncidents: "Son Olaylar",
    realTime: "GERÇEK ZAMANLI",
    eventFeed: "OLAY AKIŞI",
    events: "OLAY",
    filters: "İstihbarat Filtreleri",
    fetching: "Veri Çekiliyor...",
    noActive: "Aktif Bölge Yok",
    export: "İstihbarat Raporunu Dışa Aktar",
    feedActivity: "CANLI HABER AKIŞI",
    waiting: "İSTİHBARAT AKIŞI BEKLENİYOR...",
    dataSource: "VERİ KAYNAĞI: WW3LIVE SENSÖR AĞI [ŞİFRELİ]",
    accessSource: "Kaynağa Git",
    strat: "STRATEJİ",
    kineticAir: "Kinetik / Hava",
    missileStrike: "Füze / Saldırı",
    navalForces: "Deniz Kuvvetleri",
    typeAir: "Hava",
    typeMissile: "Füze",
    typeDrone: "Drone",
    typeGround: "Kara",
    typeNaval: "Deniz",
    typeStrategic: "Stratejik",
    toggleLayers: "Katmanları Değiştir",
    layerDark: "Koyu",
    layerSatellite: "Uydu",
    layerTopographic: "Topografik",
    layerStreet: "Sokak",
    timeLive: "Canlı Akış",
    time24h: "Son 24 Saat",
    searchEvents: "Olaylarda ara...",
    opsSummary: "Dünya çapındaki ana kriz merkezlerinin durum özeti.",
    zoneEastEu: "Doğu Avrupa Cephesi",
    statusHighRisk: "YÜKSEK RİSK",
    descEastEu: "Topçu atışları, İHA saldırıları ve yoğun kara hareketliliği.",
    zoneMidEast: "Orta Doğu Hattı",
    statusGlobalThreat: "KÜRESEL TEHDİT",
    descMidEast: "Çoklu roket atışları, hava saldırıları ve potansiyel abluka riski.",
    zonePacific: "Pasifik Gerilimi",
    statusControlled: "KONTROLLÜ",
    descPacific: "Karşılıklı donanma tatbikatları ve diplomatik artan gerilim.",
    logisticsSummary: "Jeopolitik olayların küresel finans ve tedarik zincirine canlı etkisi.",
    globalUncertainty: "Küresel Belirsizlik (WUI)",
    marketNews: "PİYASA VE EKONOMİ HABERLERİ",
    waitingNews: "Haber Bekleniyor...",
    pastEvents: "Geçmiş Olay Akışı",
    doomsdayIndex: "KIYAMET ENDEKSİ (DOOMSDAY INDEX)",
    brentOilLabel: "BRENT PETROL (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "GÜMÜŞ",
    nickelLabel: "NİKEL",
    uraniumLabel: "URANYUM"
  },
  en: {
    liveIntel: "Live Intel Stream",
    operations: "Operations",
    logistics: "Logistics",
    archive: "Archive",
    sysTime: "SYSTEM TIME",
    recentIncidents: "Recent Incidents",
    realTime: "REAL-TIME",
    eventFeed: "EVENT FEED",
    events: "EVENTS",
    filters: "Intel Filters",
    fetching: "Fetching Intel...",
    noActive: "No Active Zones",
    export: "Export Intelligence Report",
    feedActivity: "Feed Activity",
    waiting: "WAITING FOR INTELLIGENCE FEED...",
    dataSource: "DATA SOURCE: WW3LIVE SENSORS GRID [ENCRYPTED]",
    accessSource: "Access Source",
    strat: "STRAT",
    kineticAir: "Kinetic / Air",
    missileStrike: "Missile / Strike",
    navalForces: "Naval Forces",
    typeAir: "Air",
    typeMissile: "Missile",
    typeDrone: "Drone",
    typeGround: "Ground",
    typeNaval: "Naval",
    typeStrategic: "Strategic",
    toggleLayers: "Toggle Layers",
    layerDark: "Dark",
    layerSatellite: "Satellite",
    layerTopographic: "Topographic",
    layerStreet: "Street",
    timeLive: "Live Feed",
    time24h: "Past 24 Hours",
    searchEvents: "Search events...",
    opsSummary: "Status summary of major crisis centers worldwide.",
    zoneEastEu: "Eastern Europe Front",
    statusHighRisk: "HIGH RISK",
    descEastEu: "Artillery fire, UAV attacks, and intense ground mobility.",
    zoneMidEast: "Middle East Line",
    statusGlobalThreat: "GLOBAL THREAT",
    descMidEast: "Multiple rocket launches, airstrikes, and potential blockade risk.",
    zonePacific: "Pacific Tension",
    statusControlled: "CONTROLLED",
    descPacific: "Mutual naval exercises and increasing diplomatic tension.",
    logisticsSummary: "Live impact of geopolitical events on global finance and supply chain.",
    globalUncertainty: "Global Uncertainty (WUI)",
    marketNews: "MARKET AND ECONOMY NEWS",
    waitingNews: "Waiting for News...",
    pastEvents: "Past Event Stream",
    doomsdayIndex: "DOOMSDAY INDEX",
    brentOilLabel: "BRENT OIL (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "SILVER",
    nickelLabel: "NICKEL",
    uraniumLabel: "URANIUM"
  },
  de: {
    liveIntel: "Live-Intel-Stream",
    operations: "Operationen",
    logistics: "Logistik",
    archive: "Archiv",
    sysTime: "SYSTEMZEIT",
    recentIncidents: "Aktuelle Vorfälle",
    realTime: "ECHTZEIT",
    eventFeed: "EREIGNIS-FEED",
    events: "EREIGNISSE",
    filters: "Intel-Filter",
    fetching: "Intel wird abgerufen...",
    noActive: "Keine aktiven Zonen",
    export: "Geheimdienstbericht exportieren",
    feedActivity: "Feed-Aktivität",
    waiting: "WARTEN AUF INTELLIGENZ-FEED...",
    dataSource: "DATENQUELLE: WW3LIVE SENSORS GRID [VERSCHLÜSSELT]",
    accessSource: "Quelle aufrufen",
    strat: "STRAT",
    kineticAir: "Kinetik / Luft",
    missileStrike: "Rakete / Schlag",
    navalForces: "Seestreitkräfte",
    typeAir: "Luft",
    typeMissile: "Rakete",
    typeDrone: "Drohne",
    typeGround: "Boden",
    typeNaval: "Marine",
    typeStrategic: "Strategisch",
    toggleLayers: "Ebenen umschalten",
    layerDark: "Dunkel",
    layerSatellite: "Satellit",
    layerTopographic: "Topografisch",
    layerStreet: "Straße",
    timeLive: "Live-Feed",
    time24h: "Letzte 24 Stunden",
    searchEvents: "Ereignisse suchen...",
    opsSummary: "Statuszusammenfassung der wichtigsten Krisenzentren weltweit.",
    zoneEastEu: "Osteuropäische Front",
    statusHighRisk: "HOHES RISIKO",
    descEastEu: "Artilleriefeuer, Drohnenangriffe und intensive Bodenmobilität.",
    zoneMidEast: "Nahost-Linie",
    statusGlobalThreat: "GLOBALE BEDROHUNG",
    descMidEast: "Mehrere Raketenstarts, Luftangriffe und potenzielles Blockaderisiko.",
    zonePacific: "Pazifik-Spannung",
    statusControlled: "KONTROLLIERT",
    descPacific: "Gegenseitige Marineübungen und zunehmende diplomatische Spannungen.",
    logisticsSummary: "Live-Auswirkungen geopolitischer Ereignisse auf globale Finanzen und Lieferketten.",
    globalUncertainty: "Globale Unsicherheit (WUI)",
    marketNews: "MARKT- UND WIRTSCHAFTSNACHRICHTEN",
    waitingNews: "Warten auf Nachrichten...",
    pastEvents: "Vergangene Ereignisse",
    doomsdayIndex: "WELTUNTERGANGSINDEX",
    brentOilLabel: "BRENT ÖL (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "SILBER",
    nickelLabel: "NICKEL",
    uraniumLabel: "URAN"
  },
  it: {
    liveIntel: "Flusso Intel live",
    operations: "Operazioni",
    logistics: "Logistica",
    archive: "Archivio",
    sysTime: "ORA DI SISTEMA",
    recentIncidents: "Incidenti Recenti",
    realTime: "TEMPO REALE",
    eventFeed: "FLUSSO EVENTI",
    events: "EVENTI",
    filters: "Filtri Intel",
    fetching: "Recupero Intel...",
    noActive: "Nessuna zona attiva",
    export: "Esporta rapporto intelligence",
    feedActivity: "Attività Feed",
    waiting: "IN ATTESA DEL FLUSSO DI INTELLIGENCE...",
    dataSource: "FONTE DATI: WW3LIVE SENSORS GRID [CRITTOGRAFATO]",
    accessSource: "Accedi Fonte",
    strat: "STRAT",
    kineticAir: "Cinetico / Aria",
    missileStrike: "Missile / Attacco",
    navalForces: "Forze Navali",
    typeAir: "Aria",
    typeMissile: "Missile",
    typeDrone: "Drone",
    typeGround: "Terra",
    typeNaval: "Navale",
    typeStrategic: "Strategico",
    toggleLayers: "Cambia Livelli",
    layerDark: "Scuro",
    layerSatellite: "Satellite",
    layerTopographic: "Topografico",
    layerStreet: "Strada",
    timeLive: "Flusso Live",
    time24h: "Ultime 24 Ore",
    searchEvents: "Cerca eventi...",
    opsSummary: "Riepilogo dello stato dei principali centri di crisi nel mondo.",
    zoneEastEu: "Fronte dell'Europa dell'Est",
    statusHighRisk: "ALTO RISCHIO",
    descEastEu: "Fuoco di artiglieria, attacchi UAV e intensa mobilità terrestre.",
    zoneMidEast: "Linea del Medio Oriente",
    statusGlobalThreat: "MINACCIA GLOBALE",
    descMidEast: "Lanci multipli di razzi, attacchi aerei e potenziale rischio di blocco.",
    zonePacific: "Tensione nel Pacifico",
    statusControlled: "CONTROLLATO",
    descPacific: "Esercitazioni navali reciproche e crescente tensione diplomatica.",
    logisticsSummary: "Impatto in tempo reale degli eventi geopolitici sulla finanza globale e sulla catena di approvvigionamento.",
    globalUncertainty: "Incertezza Globale (WUI)",
    marketNews: "NOTIZIE DI MERCATO ED ECONOMIA",
    waitingNews: "In attesa di notizie...",
    pastEvents: "Flusso Eventi Passati",
    doomsdayIndex: "INDICE DEL GIORNO DEL GIUDIZIO",
    brentOilLabel: "PETROLIO BRENT (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "ARGENTO",
    nickelLabel: "NICHEL",
    uraniumLabel: "URANIO"
  },
  es: {
    liveIntel: "Flujo de Intel en vivo",
    operations: "Operaciones",
    logistics: "Logística",
    archive: "Archivo",
    sysTime: "HORA DEL SISTEMA",
    recentIncidents: "Incidentes recientes",
    realTime: "TIEMPO REAL",
    eventFeed: "FLUJO DE EVENTOS",
    events: "EVENTOS",
    filters: "Filtros de Intel",
    fetching: "Obteniendo Intel...",
    noActive: "No hay zonas activas",
    export: "Exportar informe de inteligencia",
    feedActivity: "Actividad del feed",
    waiting: "ESPERANDO FLUJO DE INTELIGENCIA...",
    dataSource: "FUENTE DE DATOS: WW3LIVE SENSORS GRID [CIFRADO]",
    accessSource: "Acceder a Fuente",
    strat: "ESTRAT",
    kineticAir: "Cinético / Aire",
    missileStrike: "Misil / Ataque",
    navalForces: "Fuerzas Navales",
    typeAir: "Aire",
    typeMissile: "Misil",
    typeDrone: "Dron",
    typeGround: "Tierra",
    typeNaval: "Naval",
    typeStrategic: "Estratégico",
    toggleLayers: "Cambiar Capas",
    layerDark: "Oscuro",
    layerSatellite: "Satélite",
    layerTopographic: "Topográfico",
    layerStreet: "Calle",
    timeLive: "Feed en Vivo",
    time24h: "Últimas 24 Horas",
    searchEvents: "Buscar eventos...",
    opsSummary: "Resumen del estado de los principales centros de crisis a nivel mundial.",
    zoneEastEu: "Frente de Europa del Este",
    statusHighRisk: "ALTO RIESGO",
    descEastEu: "Fuego de artillería, ataques con UAV e intensa movilidad terrestre.",
    zoneMidEast: "Línea del Medio Oriente",
    statusGlobalThreat: "AMENAZA GLOBAL",
    descMidEast: "Lanzamientos múltiples de cohetes, ataques aéreos y riesgo potencial de bloqueo.",
    zonePacific: "Tensión en el Pacífico",
    statusControlled: "CONTROLADO",
    descPacific: "Ejercicios navales mutuos y creciente tensión diplomática.",
    logisticsSummary: "Impacto en vivo de los eventos geopolíticos en las finanzas globales y la cadena de suministro.",
    globalUncertainty: "Incertidumbre Global (WUI)",
    marketNews: "NOTICIAS DE MERCATO Y ECONOMÍA",
    waitingNews: "Esperando noticias...",
    pastEvents: "Flujo de Eventos Pasados",
    doomsdayIndex: "ÍNDICE DEL JUICIO FINAL",
    brentOilLabel: "PETRÓLEO BRENT (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "PLATA",
    nickelLabel: "NÍQUEL",
    uraniumLabel: "URANIO"
  },
  zh: {
    liveIntel: "实时情报流",
    operations: "运营",
    logistics: "物流",
    archive: "档案",
    sysTime: "系统时间",
    recentIncidents: "最近事件",
    realTime: "实时",
    eventFeed: "事件流",
    events: "事件",
    filters: "情报过滤器",
    fetching: "正在获取情报...",
    noActive: "没有活动区域",
    export: "导出情报报告",
    feedActivity: "资讯流活动",
    waiting: "等待情报流...",
    dataSource: "数据源：WW3LIVE传感器网格[加密]",
    accessSource: "访问来源",
    strat: "策略",
    kineticAir: "动能 / 空中",
    missileStrike: "导弹 / 攻击",
    navalForces: "海军部队",
    typeAir: "空中",
    typeMissile: "导弹",
    typeDrone: "无人机",
    typeGround: "地面",
    typeNaval: "海军",
    typeStrategic: "战略",
    toggleLayers: "切换图层",
    layerDark: "暗黑",
    layerSatellite: "卫星",
    layerTopographic: "地形",
    layerStreet: "街道",
    timeLive: "实时流",
    time24h: "过去24小时",
    searchEvents: "搜索事件...",
    opsSummary: "全球主要危机中心的状态摘要。",
    zoneEastEu: "东欧战线",
    statusHighRisk: "高风险",
    descEastEu: "炮火、无人机攻击和密集的地面移动。",
    zoneMidEast: "中东防线",
    statusGlobalThreat: "全球威胁",
    descMidEast: "多次火箭发射、空袭和潜在的封锁风险。",
    zonePacific: "太平洋紧张局势",
    statusControlled: "受控",
    descPacific: "互相的海军演习和不断升级的外交紧张局势。",
    logisticsSummary: "地缘政治事件对全球金融和供应链的实时影响。",
    globalUncertainty: "全球不确定性 (WUI)",
    marketNews: "市场与经济新闻",
    waitingNews: "等待新闻...",
    pastEvents: "历史事件流",
    doomsdayIndex: "末日指数",
    brentOilLabel: "布伦特原油 (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "银",
    nickelLabel: "镍",
    uraniumLabel: "铀"
  },
  ja: {
    liveIntel: "ライブインテル",
    operations: "オペレーション",
    logistics: "ロジスティクス",
    archive: "アーカイブ",
    sysTime: "システム時間",
    recentIncidents: "最近の事件",
    realTime: "リアルタイム",
    eventFeed: "イベントフィード",
    events: "イベント",
    filters: "インテルフィルター",
    fetching: "インテルを取得中...",
    noActive: "アクティブなゾーンはありません",
    export: "インテリジェンスレポートをエクスポート",
    feedActivity: "フィードアクティビティ",
    waiting: "インテリジェンスフィードを待っています...",
    dataSource: "データソース：WW3LIVEセンサーグリッド[暗号化]",
    accessSource: "ソースにアクセス",
    strat: "戦略",
    kineticAir: "キネティック / 航空",
    missileStrike: "ミサイル / 攻撃",
    navalForces: "海軍部隊",
    typeAir: "航空",
    typeMissile: "ミサイル",
    typeDrone: "ドローン",
    typeGround: "地上",
    typeNaval: "海軍",
    typeStrategic: "戦略",
    toggleLayers: "レイヤー切替",
    layerDark: "ダーク",
    layerSatellite: "衛星",
    layerTopographic: "地形",
    layerStreet: "ストリート",
    timeLive: "ライブフィード",
    time24h: "過去24時間",
    searchEvents: "イベントを検索...",
    opsSummary: "世界中の主要な危機センターの状況の要約。",
    zoneEastEu: "東ヨーロッパ戦線",
    statusHighRisk: "高リスク",
    descEastEu: "砲撃、UAV攻撃、および集中的な地上移動。",
    zoneMidEast: "中東ライン",
    statusGlobalThreat: "世界的な脅威",
    descMidEast: "複数回のロケット発射、空爆、および封鎖の潜在的リスク。",
    zonePacific: "太平洋の緊張",
    statusControlled: "制御下",
    descPacific: "相互の海軍演習と高まる外交的緊張。",
    logisticsSummary: "地政学的イベントが世界の金融およびサプライチェーンに与えるリアルタイムの影響。",
    globalUncertainty: "世界的な不確実性 (WUI)",
    marketNews: "市場・経済ニュース",
    waitingNews: "ニュースを待機中...",
    pastEvents: "過去のイベントストリーム",
    doomsdayIndex: "終末時計指数",
    brentOilLabel: "ブレント原油 (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "銀",
    nickelLabel: "ニッケル",
    uraniumLabel: "ウラン"
  },
  ar: {
    liveIntel: "بث المعلومات الحية",
    operations: "العمليات",
    logistics: "اللوجستيات",
    archive: "أرشيف",
    sysTime: "وقت النظام",
    recentIncidents: "الحوادث الأخيرة",
    realTime: "الوقت الفعلي",
    eventFeed: "تغذية الأحداث",
    events: "أحداث",
    filters: "مرشحات المعلومات",
    fetching: "جلب المعلومات...",
    noActive: "لا توجد مناطق نشطة",
    export: "تصدير تقرير المخابرات",
    feedActivity: "نشاط التغذية",
    waiting: "في انتظار تغذية المخابرات...",
    dataSource: "مصدر البيانات: شبكة مستشعرات WW3LIVE [مشفرة]",
    accessSource: "الوصول للمصدر",
    strat: "استراتيجية",
    kineticAir: "حركي / جوي",
    missileStrike: "صاروخ / هجوم",
    navalForces: "القوات البحرية",
    typeAir: "جوي",
    typeMissile: "صاروخ",
    typeDrone: "مسيرة",
    typeGround: "بري",
    typeNaval: "بحري",
    typeStrategic: "استراتيجي",
    toggleLayers: "تبديل الطبقات",
    layerDark: "داكن",
    layerSatellite: "قمر صناعي",
    layerTopographic: "طبوغرافي",
    layerStreet: "شارع",
    timeLive: "بث مباشر",
    time24h: "آخر 24 ساعة",
    searchEvents: "البحث في الأحداث...",
    opsSummary: "ملخص حالة مراكز الأزمات الرئيسية حول العالم.",
    zoneEastEu: "الجبهة الأوروبية الشرقية",
    statusHighRisk: "مخاطر عالية",
    descEastEu: "نيران المدفعية، هجمات الطائرات بدون طيار، وحركة برية مكثفة.",
    zoneMidEast: "خط الشرق الأوسط",
    statusGlobalThreat: "تهديد عالمي",
    descMidEast: "إطلاق صواريخ متعددة، غارات جوية، وخطر محتمل للحصار.",
    zonePacific: "توتر المحيط الهادئ",
    statusControlled: "مسيطر عليه",
    descPacific: "مناورات بحرية متبادلة وتوتر دبلوماسي متزايد.",
    logisticsSummary: "تأثير حي للأحداث الجيوسياسية على التمويل العالمي وسلسلة التوريد.",
    globalUncertainty: "عدم اليقين العالمي (WUI)",
    marketNews: "أخبار السوق والاقتصاد",
    waitingNews: "في انتظار الأخبار...",
    pastEvents: "تدفق الأحداث الماضية",
    doomsdayIndex: "مؤشر يوم القيامة",
    brentOilLabel: "نفط برنت (USD)",
    cognexLabel: "COGNEX CORP. (USD)",
    silverLabel: "فضة",
    nickelLabel: "نيكل",
    uraniumLabel: "يورانيوم"
  }
};

const colors = {
  air: '#3B82F6', // Parlak Mavi
  missile: '#FF5722', // Nükleer Turuncu
  drone: '#aa44ff', // MOR
  ground: '#66aa33', // ASKERİ YEŞİL
  naval: '#1E3A8A', // Koyu Lacivert/Derin Mavi
  strategic: '#FF0000' // Saf Kan Kırmızı
};

const TradingViewWidget = React.memo(({ symbol }: { symbol: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    
    // Check if script already exists to prevent double insertion in Strict Mode
    if (containerRef.current.querySelector('script')) return;
    
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "colorTheme": "dark",
      "isTransparent": true,
      "locale": "tr"
    });
    
    containerRef.current.appendChild(widget);
    containerRef.current.appendChild(script);

    return () => {
       // Avoid aggressive innerHTML clearing on unmount that breaks TV script
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container h-full w-full flex items-center justify-center p-2" ref={containerRef} />
  );
});

const TickerTapeWidget = React.memo(({ lang }: { lang: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';
    
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    
    let fxPair = { "proName": "FX_IDC:USDTRY", "title": "USD/TRY" };
    if (lang === 'tr') {
       fxPair = { "proName": "FX_IDC:USDTRY", "title": "USD/TRY" };
    } else if (['de', 'es', 'it', 'fr'].includes(lang)) {
       fxPair = { "proName": "FX:EURUSD", "title": "EUR/USD" };
    } else if (lang === 'en') {
       fxPair = { "proName": "FX:GBPUSD", "title": "GBP/USD" };
    } else if (lang === 'ru') {
       fxPair = { "proName": "FX_IDC:USDRUB", "title": "USD/RUB" };
    } else if (lang === 'zh') {
       fxPair = { "proName": "FX_IDC:USDCNY", "title": "USD/CNY" };
    } else if (lang === 'ar') {
       fxPair = { "proName": "FX_IDC:USDAED", "title": "USD/AED" };
    } else {
       fxPair = { "proName": "FX:EURUSD", "title": "EUR/USD" };
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        fxPair,
        { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
        { "proName": "OANDA:XAUUSD", "title": "Gold" },
        { "proName": "OANDA:XAGUSD", "title": "Silver" },
        { "proName": "CAPITALCOM:NICKEL", "title": "Nickel" },
        { "proName": "TVC:UKOIL", "title": "Brent Oil" }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": lang
    });
    
    containerRef.current.appendChild(widget);
    containerRef.current.appendChild(script);

  }, [lang]);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={containerRef} />
  );
});

declare global {
  interface Window {
    kopyala: (url: string, btn: HTMLElement) => void;
  }
}

if (typeof window !== 'undefined') {
  window.onerror = function(message) {
    if (message === 'Script error.') {
      return true;
    }
  };
  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('Script error.')) {
       e.preventDefault();
       e.stopPropagation();
    }
  });
}

if (typeof window !== 'undefined' && !window.kopyala) {
  window.kopyala = (url: string, btn: HTMLElement) => {
    navigator.clipboard.writeText(url).then(() => {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="text-[10px] font-bold text-green-400 uppercase tracking-tight">Kopyalandı!</span>';
      setTimeout(() => {
        btn.innerHTML = originalHtml;
      }, 2000);
    }).catch(() => {});
  };
}

// Component to recenter map
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 6, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// Component to fix leafet grey tiles on layout changes
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Custom Zoom Control Component
function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1">
      <button 
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md text-lg font-mono lead-none leading-[0]"
        title="Zoom In"
      >
        +
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md text-lg font-mono leading-[0]"
        title="Zoom Out"
      >
        -
      </button>
    </div>
  );
}

const mapStyles = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    className: "map-layer-dark"
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    className: "map-layer-satellite"
  },
  topographic: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    className: ""
  },
  street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    className: ""
  }
};

function HeatmapLayerComponent({ events }: { events: ConflictEvent[] }) {
  const map = useMap();
  useEffect(() => {
    if (!events || events.length === 0) return;
    try {
      const points = events.map(e => [e.lat, e.lng, (e.severity || 1) * 0.5]);
      const LHeat = (L as any).heatLayer;
      if (!LHeat) return;

      const heatLayer = LHeat(points, {
        radius: 35,
        blur: 25,
        maxZoom: 14,
        max: 3
      }).addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    } catch(err) {}
  }, [map, events]);
  return null;
}

export default function App() {
  const [lang, setLang] = useState<keyof typeof i18n>('tr');
  const t = i18n[lang];

  const [mapType, setMapType] = useState<keyof typeof mapStyles>('satellite');
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showNavalLayer, setShowNavalLayer] = useState(false);
  const [showPlanes, setShowPlanes] = useState(false);
  const [showHotzones, setShowHotzones] = useState(false);

  const [events, setEvents] = useState<ConflictEvent[]>([]);
  const [financeNews, setFinanceNews] = useState<ConflictEvent[]>([]);
  const [followedLocations, setFollowedLocations] = useState<string[]>([]);
  const [navalAssets, setNavalAssets] = useState<NavalAsset[]>([]);
  const [militaryFlights, setMilitaryFlights] = useState<MilitaryFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCenter, setActiveCenter] = useState<[number, number] | null>(null);

  const handleRightClickLocation = (e: React.MouseEvent, location: string) => {
    e.preventDefault();
    setFollowedLocations(prev => {
       const lowerLoc = location.toLowerCase();
       if (prev.includes(lowerLoc)) {
         return prev.filter(l => l !== lowerLoc);
       } else {
         return [...prev, lowerLoc];
       }
    });
  };
  const [copiedLinkEventId, setCopiedLinkEventId] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [clock, setClock] = useState(new Date().toLocaleTimeString(undefined, { hour12: false }));
  const [filter, setFilter] = useState<Record<string, boolean>>({
    air: true, missile: true, drone: true, ground: true, naval: true, strategic: true
  });
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [timeMode, setTimeMode] = useState<'live' | '24h'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeModal, setActiveModal] = useState<'operations' | 'logistics' | 'archive' | 'support' | null>(null);
  
  const seenEventIds = useRef<Set<string>>(new Set());
  const processedNewsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const translateText = React.useCallback(async (text: string, targetLang: string) => {
      if (!text || targetLang === 'en') return text;
      try {
         const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text.substring(0, 500))}`;
         const res = await fetch(url);
         if (res.ok) {
             const data = await res.json();
             return data[0].map((item: any) => item[0]).join('');
         }
      } catch(e) { }
      return text;
  }, []);

  const translateAll = React.useCallback(async (targetLang: keyof typeof i18n) => {
    if (targetLang === 'en') {
      setEvents(prev => prev.map(ev => ({
        ...ev,
        title: ev.originalTitle || ev.title,
      })));
      setFinanceNews(prev => prev.map(ev => ({
        ...ev,
        title: ev.originalTitle || ev.title,
      })));
      return;
    }

    try {
      setEvents(prev => {
        const updated = [...prev];
        (async () => {
          const chunkSize = 5;
          for (let i = 0; i < updated.length; i += chunkSize) {
             const chunk = updated.slice(i, i + chunkSize);
             await Promise.all(chunk.map(async (ev) => {
                const origT = ev.originalTitle || ev.title;
                const translated = await translateText(origT, targetLang);
                if (translated && translated !== origT) {
                   setEvents(current => current.map(item => item.id === ev.id ? { ...item, title: translated } : item));
                }
             }));
          }
        })();
        return updated;
      });

      setFinanceNews(prev => {
        const updated = [...prev];
        (async () => {
          const chunkSize = 5;
          for (let i = 0; i < updated.length; i += chunkSize) {
             const chunk = updated.slice(i, i + chunkSize);
             await Promise.all(chunk.map(async (ev) => {
                const origT = ev.originalTitle || ev.title;
                const translated = await translateText(origT, targetLang);
                if (translated && translated !== origT) {
                   setFinanceNews(current => current.map(item => item.id === ev.id ? { ...item, title: translated } : item));
                }
             }));
          }
        })();
        return updated;
      });

    } catch (err) {
      console.warn("translateAll failed", err);
    }
  }, [translateText]);

  // 'Canlı Haber Akışı' Force Refresh on Language change
  useEffect(() => {
    translateAll(lang);
  }, [lang, translateAll]);

  const fetchFinanceEvents = React.useCallback(async () => {
    try {
      const feedUrls = [
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=120000000&id=10000664",
        "https://finance.yahoo.com/news/rssindex"
      ];

      let rawItems: any[] = [];
      await Promise.all(feedUrls.map(async (rawUrl) => {
        const feedUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rawUrl)}&order_dir=desc&order_by=pubDate&count=100&_t=${Date.now()}`;
        try {
          const res = await fetch(feedUrl, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'ok' && data.items) {
               rawItems.push(...data.items);
            }
          }
        } catch (e) {
          try {
             const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rawUrl)}&_t=${Date.now()}`;
             const fRes = await fetch(fallbackUrl, { cache: 'no-store' });
             const fData = await fRes.json();
             if (fData.contents) {
               const parser = new DOMParser();
               const xmlDoc = parser.parseFromString(fData.contents, "text/xml");
               const itemNodes = xmlDoc.querySelectorAll("item");
               const parsedItems = Array.from(itemNodes).map(node => ({
                   title: node.querySelector("title")?.textContent || "",
                   pubDate: node.querySelector("pubDate")?.textContent || new Date().toISOString()
               }));
               rawItems.push(...parsedItems);
             }
          } catch(err) {}
        }
      }));

      if (rawItems.length === 0) {
          rawItems = [
             { title: "Global markets await central bank inflation data and rate decisions", pubDate: new Date().toISOString(), link: "#" },
             { title: "Tech stocks rally as AI sector demand continues to grow globally", pubDate: new Date(Date.now() - 3600000).toISOString(), link: "#" },
             { title: "Oil prices stable amidst geopolitical tensions in key regions", pubDate: new Date(Date.now() - 7200000).toISOString(), link: "#" },
             { title: "Gold prices hit new highs as investors seek portfolio safe havens", pubDate: new Date(Date.now() - 500000).toISOString(), link: "#" },
             { title: "Asian shares mixed following uncertain economic growth data", pubDate: new Date(Date.now() - 150000).toISOString(), link: "#" }
          ];
      }

      const newFinanceEvents: ConflictEvent[] = [];
      rawItems.forEach(item => {
        const identifier = "FINANCE_" + (item.title || "");
        if (!processedNewsRef.current.has(identifier) && item.title) {
          processedNewsRef.current.add(identifier);
          newFinanceEvents.push({
            id: crypto.randomUUID(),
            title: item.title,
            desc: "Global Finance API",
            location: "GLOBAL MARKETS",
            lat: null,
            lng: null,
            type: 'strategic',
            severity: 1,
            time: item.pubDate,
            url: item.link || "#",
            originalTitle: item.title,
            originalDesc: "Global Finance API"
          });
        }
      });
      
      if (newFinanceEvents.length > 0) {
        setFinanceNews(prev => {
          const combined = [...newFinanceEvents, ...prev];
          combined.sort((a,b) => {
            const aIsRss = a.desc === "Live RSS Feed";
            const bIsRss = b.desc === "Live RSS Feed";
            if (aIsRss && !bIsRss) return -1;
            if (!aIsRss && bIsRss) return 1;
            return new Date(b.time).getTime() - new Date(a.time).getTime();
          });
          return combined.slice(0, 500);
        });
      }
    } catch (err) {}
  }, []);

  const fetchEvents = React.useCallback(async (forceLoading = false) => {
    try {
      if (initialLoadRef.current || forceLoading) setLoading(true);
      
      const feedUrls = [
        "https://defence-blog.com/feed/",
        "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml",
        "https://www.aljazeera.com/xml/rss/all.xml",
        "https://mwi.westpoint.edu/feed/",
        "https://warriormaven.com/.rss/full/",
        "https://www.crisisgroup.org/rss/all"
      ];

      const parseNewsData = async () => {
         // This is a placeholder since we will move block 1375-1423 into fetchAPI
      };

      // Fetch URL configurations removed in favor of rss2json

      function getCategory(title: string, desc: string = '') {
          const textLower = (title + ' ' + desc).toLowerCase();
          
          const droneWords = ['drone', 'uav', 'unmanned', 'iha', 'siha', 'дрон', 'طائرة بدون طيار', 'dron'];
          const fuzeWords = ['missile', 'rocket', 'strike', 'airstrike', 'füze', 'roket', 'hava savunma', 'ракета', 'صاروخ', 'misil'];
          const denizWords = ['navy', 'sea', 'ship', 'houthi', 'gemi', 'donanma', 'deniz', 'fırkateyn', 'флот', 'بحرية', 'marina'];
          const karaWords = ['ground', 'troop', 'army', 'border', 'kara', 'asker', 'piyade', 'sınır', 'армия', 'جندي', 'tropa'];
          const havaWords = ['air', 'jet', 'fighter', 'plane', 'uçak', 'hava sahası', 'aircraft', 'самолет', 'طائرة', 'avión'];

          if (droneWords.some(word => textLower.includes(word))) return 'drone';
          if (fuzeWords.some(word => textLower.includes(word))) return 'missile';
          if (denizWords.some(word => textLower.includes(word))) return 'naval';
          if (karaWords.some(word => textLower.includes(word))) return 'ground';
          if (havaWords.some(word => textLower.includes(word))) return 'air';
          
          return 'strategic';
      }

      const processNewsAndSet = async (rawItems: any[], sourceName: string) => {
          if (!rawItems || rawItems.length === 0) return;
          const rawEvents: ConflictEvent[] = [];

          rawItems.forEach(item => {
              item.originalTitle = item.title;
              item.originalDesc = item.desc || item.description || "";
          });
      
          for (const item of rawItems) {
             const haberBasligi = item.title || "";
             const haberOzeti = item.desc || item.description || "";
             
             const titleLower = haberBasligi.toLowerCase();
             const descLower = haberOzeti.toLowerCase();
             const textToSearch = titleLower + " " + descLower;
             const originalTextToSearch = ((item.originalTitle || "") + " " + (item.originalDesc || "")).toLowerCase();
             
             const allMilitaryKeywords = Object.values(MilitaryKeywords).flat().map(w => w.toLowerCase());
             const isWar = allMilitaryKeywords.some(word => titleLower.includes(word));
             
             if (!isWar) continue;
             
             const blacklist = ['işçi', 'maden', 'sendika', 'parti', 'seçim', 'belediye', 'anne', 'baba', 'magazin', 'film', 'dizi', 'konser', 'festival', 'satılık', 'kiralık', 'futbol', 'maç', 'transfer', 'şampiyon', 'kredi', 'faiz', 'enflasyon', 'borsa', 'hisse', 'yatırım', 'şirket', 'grev', 'protesto', 'siyaset', 'kupa', 'milli takım', 'kadro', 'anma', 'mektep', 'ırk', 'azınlık', 'hava durumu', 'spor', 'turnuva', 'şampiyona', 'kulübü', 'ziyaret', 'uyuşturucu', 'çete', 'mafya', 'polis', 'kaza', 'trafik'];
             const isBanned = blacklist.some(word => textToSearch.includes(word));
             
             if (!isBanned) {
                 let cleanTitle = item.title || "";
                 cleanTitle = cleanTitle.replace('BILATERAL / GLOBAL OPERATIONS:', '').replace('WORLD NEWS -', '').trim();
                 if (!cleanTitle) cleanTitle = item.title.trim() || "";
                 
                 let selectedType: any = getCategory(haberBasligi, haberOzeti);
                 let locMatch: string | null = null;

                 const fullTextToSearch = originalTextToSearch + " " + textToSearch;
                 const rawTextForCase = ((item.originalTitle || "") + " " + (item.originalDesc || ""));
                 
                 // Tüm lokasyonları (ve indekslerini) bul - Kısaltmalar için Word Boundaries (\b) zekası dahil
                 const foundLocations: {loc: string, index: number, score: number}[] = [];
                 Object.keys(geocodeCache).forEach(loc => {
                     const isShort = ['us', 'uk', 'usa', 'uae'].includes(loc.toLowerCase());
                     const regex = isShort ? new RegExp(`\\b${loc.toUpperCase()}\\b`, 'g') : new RegExp(`\\b${loc.toLowerCase()}\\b`, 'g');
                     const textToUse = isShort ? rawTextForCase : fullTextToSearch;
                     
                     let m;
                     while ((m = regex.exec(textToUse)) !== null) {
                         const matchIndex = m.index;
                         let score = 0;
                         
                         // Saldırgan/Fail Puanı (-50): by, from, 's, veya cümlenin başı
                         const contextBeforeShooter = textToUse.substring(Math.max(0, matchIndex - 15), matchIndex);
                         const contextAfterShooter = textToUse.substring(matchIndex + loc.length, matchIndex + loc.length + 3);
                         if (/\\b(?:from|by)\\s+[-]?$/i.test(contextBeforeShooter) || /^[']?s\\b/i.test(contextAfterShooter) || matchIndex < 5) {
                             score -= 50;
                         }

                         // Kurban/Hedef Puanı (+100): against, in, targeting, strikes on, hits, towards, vs.
                         const targetWords = ['against', 'in', 'targeting', 'strikes on', 'hits', 'towards', 'strikes', 'into', 'debris in', 'on', 'at', 'over'];
                         const contextBeforeTarget = textToUse.substring(Math.max(0, matchIndex - 25), matchIndex).toLowerCase();
                         
                         // Check if any target word is immediately before the location
                         for (const tWord of targetWords) {
                             const tRegex = new RegExp(`\\b${tWord}\\s+[-]?$`);
                             if (tRegex.test(contextBeforeTarget)) {
                                 score += 100;
                                 break;
                             }
                         }

                         foundLocations.push({ loc, index: matchIndex, score });
                     }
                 });

                 if (foundLocations.length > 0) {
                     // En yüksek puana sahip olanı seç. Puanlar eşitse cümlenin başındakini DEĞİL, sondakini mi (Last Entity Wins)? 
                     // Yönerge diyor ki: "Kesin Fallback: İlk ve tek ülkeyi döndür." "Eğer savaş/edat kelimesi yoksa cümlede bulduğu İLK ülkenin koordinatını döndür."
                     // O halde önce skora göre büyükten küçüğe, skor aynıysa index'e göre (eğer saldırıysa sondan başa olabilir ama lojistik için 'ilk' diyor, en garantisi skora bakmak)
                     
                     // Puanlara göre sırala (Büyükten küçüğe)
                     foundLocations.sort((a, b) => b.score - a.score);
                     
                     const highestScore = foundLocations[0].score;
                     const bestMatches = foundLocations.filter(f => f.score === highestScore);
                     
                     if (highestScore === 0 && selectedType === 'strategic') {
                         // Fallback (stratejik haberlerde ilk geçen ülkeyi seç)
                         bestMatches.sort((a, b) => a.index - b.index);
                     } else if (highestScore === 0) {
                         // Çatışma ama skor 0 ise, fail olmayanları daha olası hedef olarak gör (yine index veya sondan başa)
                         // "Eğer hipğenli ... en yüksek puana sahip... vs."
                         // Sonuç olarak sıralamada skoru en yüksek olanı, eşitse ilk kalanı alalım
                         bestMatches.sort((a, b) => a.index - b.index); 
                     }
                     
                     locMatch = bestMatches[0].loc;
                 }

                 if (locMatch) {
                     const geoInfo = geocodeCache[locMatch];
                     const jitterLat = (Math.random() - 0.5) * 1.5;
                     const jitterLng = (Math.random() - 0.5) * 1.5;
                     const capitalize = (s: string) => s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                     
                     rawEvents.push({
                        id: crypto.randomUUID(),
                        title: cleanTitle,
                        desc: sourceName,
                        location: capitalize(locMatch),
                        lat: geoInfo.lat + jitterLat,
                        lng: geoInfo.lng + jitterLng,
                        type: selectedType,
                        severity: Math.floor(Math.random() * 5) + 1,
                        time: item.pubDate,
                        url: item.link || item.url,
                        originalTitle: cleanTitle,
                        originalDesc: sourceName
                     });
                 } else {
                    rawEvents.push({
                       id: crypto.randomUUID(),
                       title: cleanTitle,
                       desc: sourceName,
                       location: "Global / Regional",
                       lat: null,
                       lng: null,
                       type: selectedType,
                       severity: Math.floor(Math.random() * 5) + 1,
                       time: item.pubDate,
                       url: item.link || item.url,
                       originalTitle: cleanTitle,
                       originalDesc: sourceName
                    });
                 }
             }
          }
          
          const uniqueNewEvents: ConflictEvent[] = [];
          const newFinanceEvents: ConflictEvent[] = [];

          rawEvents.forEach(ev => {
            const urlId = (ev.url || "").split('?')[0];
            const titleId = ev.title.substring(0, 40).toLowerCase().replace(/[^a-z0-9]/g, '');
            const identifier = urlId + "_" + titleId;
            if (!processedNewsRef.current.has(identifier)) {
              processedNewsRef.current.add(identifier);
              const textToCheck = `${ev.title} ${ev.desc || ''}`.toLowerCase();
              const isFinance = financeKeywords.some(kw => textToCheck.includes(kw));
              
              if (isFinance) {
                newFinanceEvents.push(ev);
              } else {
                uniqueNewEvents.push(ev);
              }
            }
          });
          
          let shouldAlert = false;
          
          uniqueNewEvents.forEach(ev => {
            if (!seenEventIds.current.has(ev.id)) {
              seenEventIds.current.add(ev.id);
              if (!initialLoadRef.current && (ev.severity === 4 || ev.severity === 5)) {
                shouldAlert = true;
              }
            }
          });
          
          if (shouldAlert && audioEnabled) {
            playAlert();
          }
          
          // Append unique items to avoid duplicates
          setEvents(prev => {
            const combined = [...uniqueNewEvents, ...prev];
            combined.sort((a,b) => {
              // Kırmızı Alarm Önceliği (Sıcak Haberler)
              const redAlarmRegex = /ukraine|palestine|gaza|israel|libya|yemen|syria|lebanon|russia|iran|missile|strike|war/i;
              const aIsRed = redAlarmRegex.test(a.title + " " + (a.originalDesc || ""));
              const bIsRed = redAlarmRegex.test(b.title + " " + (b.originalDesc || ""));
              
              if (aIsRed && !bIsRed) return -1;
              if (!aIsRed && bIsRed) return 1;

              const aIsRss = a.desc === "Global RSS Stream";
              const bIsRss = b.desc === "Global RSS Stream";
              if (aIsRss && !bIsRss) return -1;
              if (!aIsRss && bIsRss) return 1;
              
              return new Date(b.time).getTime() - new Date(a.time).getTime();
            });
            return combined.slice(0, 1000); // Maintain a massive history
          });
          setFinanceNews(prev => {
            const combined = [...newFinanceEvents, ...prev];
            combined.sort((a,b) => {
              const aIsRss = a.desc === "Global RSS Stream";
              const bIsRss = b.desc === "Global RSS Stream";
              if (aIsRss && !bIsRss) return -1;
              if (!aIsRss && bIsRss) return 1;
              return new Date(b.time).getTime() - new Date(a.time).getTime();
            });
            return combined.slice(0, 500);
          });
          initialLoadRef.current = false;

          // Asynchronously trigger translations once we've popped items onto screen in English
          if (lang !== 'en') {
             translateAll(lang);
          }
      };

      const fetchNews = async () => {
         try {
           const fetchPromises = [
             fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.com/xml/rss/all.xml").then(r => r.json()),
             fetch("https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml").then(r => r.json()),
             fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.channelnewsasia.com/api/v1/rss-outbound-feed?expandArticle=true").then(r => r.json()),
             fetch("https://api.rss2json.com/v1/api.json?rss_url=https://defence-blog.com/feed/").then(r => r.json()),
             fetch("https://api.rss2json.com/v1/api.json?rss_url=https://sputnikglobe.com/export/pool/ee/all.xml")
                 .then(r => r.json())
                 .then(data => {
                     if (data.status !== 'ok') throw new Error('Sputnik failed');
                     return data;
                 })
                 .catch(() => fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.rt.com/rss/news/").then(r => r.json()))
           ];

           const results = await Promise.allSettled(fetchPromises);

           let combinedItems: any[] = [];
           results.forEach(res => {
               if (res.status === 'fulfilled' && res.value && res.value.items) {
                   combinedItems = [...combinedItems, ...res.value.items];
               }
           });

           if (combinedItems.length > 0) {
              const civBlacklist = ['pest', 'bug', 'insect', 'weather', 'climate', 'festival', 'movie', 'hollywood', 'sports', 'football', 'soccer', 'olympics', 'celebrity', 'music', 'concert', 'health', 'disease', 'virus'];
              const conflictKeywords = ['iran', 'israel', 'ukraine', 'russia', 'palestine', 'gaza', 'syria', 'libya', 'yemen', 'china', 'taiwan', 'missile', 'strike', 'war', 'troops', 'army', 'military', 'drone', 'navy', 'buy', 'purchase', 'pact', 'summit', 'border', 'police', 'attack', 'defense', 'protest', 'riot'];
              
              const filteredItems = combinedItems.filter(item => {
                  const text = `${item.title} ${item.description || item.content}`.toLowerCase();
                  if (civBlacklist.some(bw => text.includes(bw))) return false;
                  return conflictKeywords.some(kw => text.includes(kw));
              });

              const uniqueItems: any[] = [];
              const seenTitles = new Set();
              
              for (const item of filteredItems) {
                  const titleKey = item.title.trim().toLowerCase();
                  if (!seenTitles.has(titleKey)) {
                      seenTitles.add(titleKey);
                      uniqueItems.push(item);
                  }
              }

              const mappedItems = uniqueItems.map(item => ({
                  title: item.title,
                  desc: item.description || item.content,
                  link: item.link,
                  pubDate: item.pubDate
              }));
              await processNewsAndSet(mappedItems, "Global RSS Stream");
           }
         } catch(err) {
             console.error("Live fetchNews failed:", err);
             // Fallback: don't crash, keep old state
             setError(lang === 'tr' ? 'Canlı Akış Aktif - Haberler Yenileniyor...' : 'Live Stream Active - Feeds Refreshing...');
         }
      };

      await fetchNews();

    } catch (err) {
      setError(lang === 'tr' ? 'Gerçek zamanlı veri bağlanılamadı. Geçici arızalar olabilir.' : 'Failed to load real-time global feed.');
    } finally {
      setLoading(false);
    }
  }, [lang, audioEnabled, translateAll]);

  // Initial Fetch
  useEffect(() => {
    fetchEvents();
    fetchFinanceEvents();
    let interval: ReturnType<typeof setInterval> | null = null;
    let financeInterval: ReturnType<typeof setInterval> | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 60000); // 1 min
      financeInterval = setInterval(fetchFinanceEvents, 60000); // 1 min
    }
    return () => {
      if (interval) clearInterval(interval);
      if (financeInterval) clearInterval(financeInterval);
    };
  }, [fetchEvents, fetchFinanceEvents, autoRefresh]);

  useEffect(() => {
    if (!showNavalLayer) return;
    const fetchNaval = async () => {
      try {
        const res = await fetch('/api/naval');
        if (res.ok) {
          const data = await res.json();
          setNavalAssets(data.assets || []);
        }
      } catch(err) {}
    };
    fetchNaval();
    const interval = setInterval(fetchNaval, 2000); // Fast refresh for simulated movement
    return () => clearInterval(interval);
  }, [showNavalLayer]);

  // Military flights tracking (ADS-B Radar) and Simulated Mock Flights
  useEffect(() => {
    const initMockFlights: MilitaryFlight[] = [
      // Karadeniz (Black Sea - NATO Intelligence)
      { icao24: 'MOCK1', callsign: 'FORTE10', lat: 44.5, lng: 31.0, heading: 90, velocity: 160, altitude: 50000 },
      { icao24: 'MOCK2', callsign: 'NATO-AWACS', lat: 45.0, lng: 32.5, heading: 270, velocity: 180, altitude: 28000 },
      // Baltık Denizi (Baltic Intercept - Kaliningrad)
      { icao24: 'MOCK3', callsign: 'SU-35', lat: 54.8, lng: 19.5, heading: 45, velocity: 320, altitude: 32000 },
      { icao24: 'MOCK4', callsign: 'TYPHOON-1', lat: 54.5, lng: 20.5, heading: 220, velocity: 310, altitude: 35000 },
      // Tayvan Boğazı (Taiwan Strait)
      { icao24: 'MOCK5', callsign: 'J-20', lat: 24.5, lng: 119.5, heading: 180, velocity: 300, altitude: 42000 },
      { icao24: 'MOCK6', callsign: 'RECON-DRONE', lat: 23.5, lng: 118.5, heading: 30, velocity: 150, altitude: 45000 },
      // Doğu Akdeniz (Eastern Med) / Middle East
      { icao24: 'MOCK7', callsign: 'AWACS-M', lat: 33.5, lng: 34.5, heading: 315, velocity: 190, altitude: 30000 },
      { icao24: 'MOCK8', callsign: 'F-35I', lat: 32.5, lng: 34.0, heading: 90, velocity: 350, altitude: 38000 },
      
      { icao24: 'MOCK9', callsign: 'NATO-R', lat: 46.0, lng: 30.5, heading: 150, velocity: 210, altitude: 18000 },
      { icao24: 'MOCK10', callsign: 'PATROL', lat: 44.0, lng: 33.0, heading: 330, velocity: 140, altitude: 12000 },
      { icao24: 'MOCK11', callsign: 'EAGLE-7', lat: 15.0, lng: 42.0, heading: 210, velocity: 290, altitude: 34000 },
      { icao24: 'MOCK12', callsign: 'SHADOW', lat: 13.0, lng: 43.0, heading: 40, velocity: 130, altitude: 20000 },
      { icao24: 'MOCK13', callsign: 'VIPER-01', lat: 42.0, lng: 29.0, heading: 280, velocity: 220, altitude: 32000 },
      { icao24: 'MOCK14', callsign: 'USAF-B', lat: 48.0, lng: 11.0, heading: 140, velocity: 250, altitude: 40000 },
      { icao24: 'MOCK15', callsign: 'RRR-H', lat: 51.0, lng: -1.0, heading: 90, velocity: 230, altitude: 31000 }
    ];

    const mockState = [...initMockFlights];
    let realState: MilitaryFlight[] = [];

    const fetchMilitaryRadar = async () => {
      try {
        const res = await fetch('https://opensky-network.org/api/states/all');
        if (res.ok) {
          const data = await res.json();
          const targetCallsigns = ['FORTE', 'NATO', 'USAF', 'REACH', 'RRR', 'LAGR', 'HOMER', 'RCH', 'THY', 'UAE'];
          
          if (data.states && Array.isArray(data.states)) {
            realState = data.states
              .filter((state: any[]) => {
                 const callsign = typeof state[1] === 'string' ? state[1].trim().toUpperCase() : '';
                 return targetCallsigns.some(tc => callsign.startsWith(tc) || callsign.includes(tc));
              })
              .map((state: any[]) => ({
                 icao24: state[0],
                 callsign: typeof state[1] === 'string' ? state[1].trim() : "UNKNOWN",
                 lng: state[5],
                 lat: state[6],
                 altitude: state[7] || 0,
                 velocity: state[9] || 0,
                 heading: state[10] || 0
              }))
              .filter((f: MilitaryFlight) => f.lat !== null && f.lng !== null);
          }
        }
      } catch (err) {}
    };

    fetchMilitaryRadar();
    const radarApiInterval = setInterval(fetchMilitaryRadar, 60000); // 1 min

    const animatorInterval = setInterval(() => {
      for (let i = 0; i < mockState.length; i++) {
        const flight = mockState[i];
        const headingRad = flight.heading * (Math.PI / 180);
        const speedScale = (flight.velocity / 300) * 0.05; 
        flight.lat += Math.cos(headingRad) * speedScale;
        flight.lng += Math.sin(headingRad) * speedScale;
        
        // Strategic circular patrols
        if (flight.callsign.includes('FORTE') || flight.callsign.includes('AWACS') || flight.callsign.includes('RECON') || flight.callsign.includes('SU-35') || flight.callsign.includes('TYPHOON') || flight.callsign.includes('J-20')) {
            flight.heading = (flight.heading + 2) % 360;
        } else {
            if (Math.random() < 0.1) {
                flight.heading = (flight.heading + (Math.random() * 20 - 10)) % 360;
            }
        }
      }
      setMilitaryFlights(prevFlights => {
        const combined = [...realState, ...mockState];
        return combined.map(f => {
           const prevF = prevFlights.find(p => p.icao24 === f.icao24);
           let newTrail = prevF?.trail ? [...prevF.trail] : [];
           if (!newTrail.length || newTrail[newTrail.length - 1][0] !== f.lat || newTrail[newTrail.length - 1][1] !== f.lng) {
               newTrail.push([f.lat, f.lng]);
           }
           if (newTrail.length > 5) {
               newTrail = newTrail.slice(-5);
           }
           return { ...f, trail: newTrail };
        });
      });
    }, 2000);

    return () => {
      clearInterval(radarApiInterval);
      clearInterval(animatorInterval);
    };
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString(undefined, { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parse deep link coordinates on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const latStr = params.get('lat');
    const lngStr = params.get('lng');
    if (latStr && lngStr) {
      const parsedLat = parseFloat(latStr);
      const parsedLng = parseFloat(lngStr);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setActiveCenter([parsedLat, parsedLng]);
      }
    }
  }, []);

  const toggleFilter = (type: string) => {
    setFilter(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const visibleEvents = [...events].filter(e => {
    const typeLower = (e.type || '').toLowerCase();
    if (!filter[typeLower as keyof typeof filter]) return false;
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !e.location.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (timeMode === 'live') {
      const evTime = new Date(e.time).getTime();
      return evTime >= Date.now() - 6 * 60 * 60 * 1000;
    }
    return true;
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="w-full h-full flex-1 bg-[#05070a] text-slate-300 font-sans flex flex-col overflow-hidden select-none">
      
      {/* Header Navigation */}
      <nav className="h-16 flex-none border-b border-slate-800 bg-[#0a0f18] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div translate="no" className="flex items-center select-none cursor-default" style={{ fontFamily: '"Space Grotesk", "JetBrains Mono", ui-sans-serif, system-ui, sans-serif' }}>
            <span className="font-extrabold text-2xl tracking-widest text-slate-100" style={{ textShadow: '0 0 10px rgba(241,245,249,0.3)' }}>WW3</span>
            <span className="font-black text-2xl tracking-widest text-[#ff0033]" style={{ textShadow: '0 0 15px rgba(255,0,51,0.6)' }}>LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-sm font-medium tracking-wide uppercase">
          <span className="text-red-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {t.liveIntel}
          </span>
          <button onClick={() => setActiveModal('operations')} className="text-slate-500 hover:text-white transition-colors cursor-pointer hidden lg:block">{t.operations}</button>
          <button onClick={() => setActiveModal('logistics')} className="text-slate-500 hover:text-white transition-colors cursor-pointer hidden lg:block">{t.logistics}</button>
          <button onClick={() => setActiveModal('archive')} className="text-slate-500 hover:text-white transition-colors cursor-pointer hidden lg:block">{t.archive}</button>
          <button onClick={() => setActiveModal('support')} className="text-green-500 font-bold border border-green-600/50 bg-green-900/20 hover:bg-green-800/40 px-4 py-1.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.1)] transition-all cursor-pointer hidden sm:flex items-center gap-2 uppercase tracking-wider text-xs">SUPPORT KARARGAH</button>
          <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="hidden sm:block">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as keyof typeof i18n)}
              className="bg-[#0a0f18] text-slate-300 text-xs border border-slate-700 rounded px-2 py-1 outline-none font-sans cursor-pointer uppercase tracking-wider"
            >
              <option value="tr">TÜRKÇE</option>
              <option value="en">ENGLISH</option>
              <option value="de">DEUTSCH</option>
              <option value="it">ITALIANO</option>
              <option value="es">ESPAÑOL</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
          
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${autoRefresh ? 'bg-green-600/20 text-green-500 border border-green-600/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              title={autoRefresh ? "Auto-refresh active (5m)" : "Manual refresh only"}
            >
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
            {!autoRefresh && (
              <button 
                onClick={() => fetchEvents(true)}
                className="p-1.5 bg-slate-800 rounded text-slate-400 hover:text-white transition-colors border border-slate-700"
                title="Refresh events"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-500 leading-tight">{t.sysTime}</div>
            <div className="font-mono text-white leading-tight">{clock}</div>
          </div>
        </div>
      </nav>

      {/* Main Strategic View */}
      <div className="flex flex-1 w-full relative" style={{ flexGrow: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
        
        {/* Sidebar: Real-time Feed */}
        <AnimatePresence>
          {leftPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-80 flex-none border-r border-slate-800 bg-[#080b12] flex flex-col z-[400]"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0d131f] shrink-0">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.recentIncidents}</h2>
                <div className="flex bg-slate-800 rounded overflow-hidden">
                  <button 
                    onClick={() => setTimeMode('live')}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${timeMode === 'live' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                  >
                    {t.timeLive}
                  </button>
                  <button 
                    onClick={() => setTimeMode('24h')}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${timeMode === '24h' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                  >
                    {t.time24h}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 border-b border-slate-800 shrink-0 bg-[#080b12]">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(colors).map(([type, color]) => (
                    <button
                      key={type}
                      onClick={() => toggleFilter(type)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded border text-[10px] font-bold uppercase transition-colors ${
                        filter[type] 
                          ? 'border-slate-700 bg-slate-800/50 text-white' 
                          : 'border-slate-800 bg-transparent text-slate-600'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filter[type] ? color : '#475569', boxShadow: filter[type] ? `0 0 8px ${color}` : 'none' }}></div>
                      {t[`type${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof t]}
                    </button>
                  ))}
                </div>
              </div>



              {/* Search */}
              <div className="p-4 border-b border-slate-800 shrink-0 bg-[#0d131f]">
                <input
                  type="text"
                  placeholder={t.searchEvents}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#05070a] border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                />
              </div>

              {/* Event List */}
              <div className="flex-1 overflow-y-auto space-y-px bg-slate-800 scrollbar-custom max-h-[calc(100vh-350px)]">
                {loading ? (
                  <div className="p-6 bg-[#080b12] h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Activity className="w-6 h-6 animate-pulse text-red-500" />
                    <span className="text-xs font-mono tracking-widest uppercase">{t.fetching}</span>
                  </div>
                ) : error ? (
                  <div className="p-6 bg-[#080b12] h-full flex flex-col items-center text-center text-xs text-red-500/80 font-mono">
                    <ShieldAlert className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    {error}
                  </div>
                ) : (
                  (() => {
                    const seenTitles = new Set<string>();
                    const uniqueSidebarEvents = visibleEvents.filter(ev => {
                      if (seenTitles.has(ev.title)) return false;
                      seenTitles.add(ev.title);
                      return true;
                    });
                    
                    return uniqueSidebarEvents.length === 0 ? (
                      <div className="p-6 bg-[#080b12] h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                        <EyeOff className="w-6 h-6" />
                        <span className="text-xs font-mono tracking-widest uppercase">{t.noActive}</span>
                      </div>
                    ) : (
                      uniqueSidebarEvents.map((ev, index) => (
                        <div 
                          key={`${ev.id}-${index}`}
                      onClick={() => {
                        if (ev.lat !== null && ev.lng !== null) {
                          setActiveCenter([ev.lat, ev.lng]);
                          setHighlightedEventId(ev.id);
                          setTimeout(() => setHighlightedEventId(null), 3000);
                        }
                      }}
                      className="p-4 bg-[#080b12] border-l-2 cursor-pointer transition-colors group hover:bg-[#0d131f]"
                      style={{ borderLeftColor: colors[(ev.type || '').toLowerCase() as keyof typeof colors] }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-sans text-slate-300 font-medium">
                          {new Date(ev.time).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(ev.time).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute:'2-digit' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-px opacity-80" title={`Severity: ${ev.severity || 1}`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`w-1 h-2.5 rounded-sm ${i < (ev.severity || 1) ? 'bg-red-500' : 'bg-slate-700'}`}></div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t[`type${(ev.type || '').charAt(0).toUpperCase() + (ev.type || '').slice(1).toLowerCase()}` as keyof typeof t]}</span>
                          {ev.marketImpact && (
                            <span className="ml-2 text-[8px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-1 py-0.5 rounded tracking-wide uppercase">
                              Piyasa Etkisi
                            </span>
                          )}
                        </div>
                      </div>
                      <p 
                        className="text-sm text-slate-200 font-medium leading-tight group-hover:text-white transition-colors"
                        onContextMenu={(e) => handleRightClickLocation(e, ev.location)}
                        title="Takip etmek/bırakmak için sağ tıklayın"
                      >
                        <span className="font-bold relative inline-flex items-center gap-1 text-slate-100">
                          {ev.location}
                          {followedLocations.includes((ev.location || '').toLowerCase()) && (
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          )}
                        </span> - <span className="text-slate-200">{ev.title}</span>
                      </p>
                      {/* Kaynaga Git button */}
                      {(((ev.url && ev.url !== "#") ? ev.url : null) || (ev as any).link || (ev as any).articleUrl || (ev as any).source) && (
                        <div className="mt-2 text-right">
                          <a 
                            href={(((ev.url && ev.url !== "#") ? ev.url : null) || (ev as any).link || (ev as any).articleUrl || (ev as any).source)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="inline-block text-[10px] bg-red-900/50 hover:bg-red-800/80 px-2 py-1.5 rounded text-red-200 font-mono transition-colors uppercase"
                          >
                            {t.accessSource} &rarr;
                          </a>
                        </div>
                      )}
                      {(ev.lat === null || ev.lng === null) && (
                        <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600 font-mono italic">
                          <span>* Harita konumu (koordinat) doğrulanamadı</span>
                        </div>
                      )}
                    </div>
                  ))
                );
              })()
            )}
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel Toggle Handle */}
        <div className="relative z-[450] flex items-center justify-center -ml-px">
          <button 
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="w-4 h-12 bg-slate-800 border bg-[#0a0f18] border-slate-700 text-slate-500 flex flex-col items-center justify-center hover:text-white transition-all hover:bg-slate-800 rounded flex-none z-50 cursor-pointer"
          >
             {leftPanelOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Center Map Space */}
        <main className="flex-1 flex flex-col relative bg-[#05070a]" style={{ flexGrow: 1, display: 'flex', height: '100%' }}>
          
          {/* Map Visualization Area */}
          <div className="relative bg-[#05070a] border border-slate-800/50 m-4 rounded overflow-hidden flex-1" style={{ width: '100%', height: '100%', minHeight: 0 }}>
             
            <MapContainer 
              center={[30, 20]} 
              zoom={3} 
              minZoom={3}
              maxBounds={[[-90, -180], [90, 180]]}
              maxBoundsViscosity={1.0}
              className="w-full h-full z-0 outline-none flex"
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                key={mapType}
                url={mapStyles[mapType].url}
                className={mapStyles[mapType].className}
                attribution=""
                maxZoom={18}
              />
              {mapType === 'satellite' && (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution=""
                  maxZoom={18}
                />
              )}
              <MapUpdater center={activeCenter} />
              <MapResizer />
              <CustomZoomControl />
              
              {/* Layer Control Menu & Heatmap Toggle */}
              <div className="absolute top-4 right-14 z-[400] flex flex-col gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setLayerMenuOpen(!layerMenuOpen); }}
                  className="w-8 h-8 bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md relative"
                  title={t.toggleLayers}
                >
                  <Layers className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowHeatmap(!showHeatmap); }}
                  className={`w-8 h-8 ${showHeatmap ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'} border rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md`}
                  title="Toggle Heatmap"
                >
                  <Flame className="w-4 h-4" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setShowNavalLayer(!showNavalLayer); }}
                  className={`w-8 h-8 ${showNavalLayer ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'} border rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md`}
                  title="Toggle Naval Assets"
                >
                  <Anchor className="w-4 h-4" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setShowPlanes(!showPlanes); }}
                  className={`w-8 h-8 ${showPlanes ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'} border rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md`}
                  title="Toggle Military Flights"
                >
                  <Plane className="w-4 h-4" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setShowHotzones(!showHotzones); }}
                  className={`w-8 h-8 ${showHotzones ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'} border rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md`}
                  title="Toggle Strategic Hotzones"
                >
                  <Crosshair className="w-4 h-4" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setAudioEnabled(!audioEnabled); }}
                  className={`w-8 h-8 ${audioEnabled ? 'bg-[#10b981] text-white border-[#10b981]' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'} border rounded shadow-lg flex items-center justify-center transition-colors backdrop-blur-md`}
                  title="Toggle Audio Alerts for High-Severity Events"
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {layerMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute top-0 right-10 w-36 bg-slate-900/95 border border-slate-700 rounded shadow-2xl overflow-hidden backdrop-blur-md"
                    >
                      {Object.keys(mapStyles).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setMapType(type as keyof typeof mapStyles);
                            setLayerMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                            mapType === type
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {t[`layer${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof t]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {showHeatmap && <HeatmapLayerComponent events={visibleEvents} />}

              {showNavalLayer && navalAssets.map((asset) => (
                <Marker
                  key={asset.id}
                  position={[asset.lat, asset.lng]}
                  icon={getNavalAssetIcon(asset.faction)}
                >
                  <Popup className="font-sans">
                     <div className="flex items-center gap-3 mb-1">
                      <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: asset.faction === 'NATO' ? '#3b82f6' : (asset.faction === 'Iran' ? '#ef4444' : '#eab308') }}>
                        {asset.faction} FLEET
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight uppercase">{asset.name}</div>
                    <div className="text-xs text-slate-400 leading-snug">Class: {asset.type}</div>
                    <div className="text-xs text-slate-400 mb-2 leading-snug">Task: {asset.status}</div>
                    
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 bg-slate-800 p-1.5 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">Speed</div>
                        <div className="text-xs text-white font-mono">{asset.speed.toFixed(1)} kn</div>
                      </div>
                      <div className="flex-1 bg-slate-800 p-1.5 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">Heading</div>
                        <div className="text-xs text-white font-mono">{asset.heading.toFixed(0)}°</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {showPlanes && militaryFlights.map((flight) => (
                <React.Fragment key={flight.icao24}>
                  {flight.trail && flight.trail.length > 1 && (
                    <Polyline positions={flight.trail} pathOptions={{ color: 'red', weight: 2, opacity: 0.6, dashArray: '4 4' }} />
                  )}
                  <Marker
                    position={[flight.lat, flight.lng]}
                    icon={getMilitaryFlightIcon(flight.heading)}
                  >
                    <Popup className="font-sans">
                      <div className="p-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2 text-yellow-500 border-b border-slate-700 pb-1">
                          <Plane size={16} />
                          <span className="font-bold text-sm tracking-wider uppercase">Askeri Uçuş / Radar</span>
                        </div>
                        <div className="space-y-1 text-sm text-slate-300 font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Callsign:</span>
                            <span className="font-bold text-slate-100">{flight.callsign}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Altitude:</span>
                            <span className="text-slate-100">{Math.round(flight.altitude)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Speed:</span>
                            <span className="text-slate-100">{Math.round(flight.velocity * 3.6)} km/h</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}

              {showHotzones && CHOKE_POINTS.map((choke) => {
                const localeData = CHOKE_POINTS_LOCALE[choke.id as keyof typeof CHOKE_POINTS_LOCALE];
                const translatedName = localeData?.name?.[lang as keyof typeof localeData.name] || localeData?.name?.en || choke.defaultName;
                const translatedDesc = localeData?.desc?.[lang as keyof typeof localeData.desc] || localeData?.desc?.en || choke.defaultDesc;
                const hotzoneLabels: Record<string, string> = { tr: "STRATEJİK BÖLGE", de: "STRATEGISCHE ZONE", it: "ZONA STRATEGICA", es: "ZONA ESTRATÉGICA", zh: "战略热区", ja: "戦略的ホットゾーン", ar: "منطقة استراتيجية" };
                const hotzoneText = hotzoneLabels[lang] || "STRATEGIC HOTZONE";
                return (
                <Marker
                  key={choke.id}
                  position={[choke.lat, choke.lng]}
                  icon={getChokePointIcon()}
                  zIndexOffset={500}
                >
                  <Popup className="font-sans">
                     <div className="p-2 min-w-[220px]">
                       <div className="flex items-center gap-2 mb-2 text-yellow-400 border-b border-slate-700 pb-2">
                         <ShieldAlert size={18} />
                         <span className="font-bold text-sm tracking-wider uppercase">{hotzoneText}</span>
                       </div>
                       <div className="text-sm font-bold text-white mb-2 tracking-wide uppercase">{translatedName}</div>
                       <div className="text-[11px] text-slate-300 leading-relaxed font-mono">
                         {translatedDesc}
                       </div>
                     </div>
                  </Popup>
                </Marker>
              );})}

              {!showHeatmap && (() => {
                const validEvents = visibleEvents.filter(ev => ev.lat !== null && ev.lng !== null);
                const coordinateCounts = validEvents.reduce((acc, ev) => {
                  const key = `${ev.lat},${ev.lng}`;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                return validEvents.map((ev, index) => {
                  const key = `${ev.lat},${ev.lng}`;
                  const isNew = (Date.now() - new Date(ev.time).getTime()) < 300000;
                  return (
                    <Marker 
                      key={`marker-${ev.id}-${index}`}
                      position={[ev.lat as number, ev.lng as number]}
                      icon={getIcon(ev.type, ev.id === highlightedEventId, coordinateCounts[key], isNew)}
                    >
                  <Popup className="font-sans">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: colors[(ev.type || '').toLowerCase() as keyof typeof colors] }}>
                        {t[`type${(ev.type || '').charAt(0).toUpperCase() + (ev.type || '').slice(1).toLowerCase()}` as keyof typeof t]}
                      </div>
                      {ev.marketImpact && (
                        <div className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-1.5 py-0.5 rounded ml-1 border border-yellow-500/20">
                          Piyasa Etkisi
                        </div>
                      )}
                      <div className="flex gap-px opacity-90" title={`Severity: ${ev.severity || 1}`}>
                         {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-3 rounded-sm ${i < (ev.severity || 1) ? 'bg-red-500' : 'bg-slate-700'}`}></div>
                         ))}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white mb-1 leading-tight uppercase">{ev.location}</div>
                    <div className="text-xs text-slate-400 mb-2 leading-snug">{ev.title}</div>
                    <div className="flex items-center mt-3">
                      {(((ev.url && ev.url !== "#") ? ev.url : null) || (ev as any).link || (ev as any).articleUrl || (ev as any).source) && (
                        <a href={(((ev.url && ev.url !== "#") ? ev.url : null) || (ev as any).link || (ev as any).articleUrl || (ev as any).source)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center inline-block text-[10px] bg-red-900/50 hover:bg-red-800/80 px-2 py-1.5 rounded text-red-200 font-mono transition-colors uppercase">
                          {t.accessSource} &rarr;
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
                  );
                });
              })()}
            </MapContainer>
            
            {/* Tactical Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col">
              <div className="flex-1 grid grid-cols-12 grid-rows-12 gap-0 border border-slate-900/40 pointer-events-none opacity-50">
                {/* Decorative Grid Lines could go here */}
              </div>
            </div>
            
          </div>
        </main>
      </div>

      {/* Spacer for Global Bottom Strips */}
      <div className="flex-none w-full" style={{ height: '86px' }}></div>

      {/* Global Bottom Strips Container (Always Visible) */}
      <div className="flex-none w-full flex flex-col z-[10000] fixed bottom-0 left-0 right-0">
        {/* Marquee (Kayan Yazı) */}
        <footer style={{ height: '40px', width: '100%', backgroundColor: '#cc0000', display: 'flex', alignItems: 'center', color: 'white' }} className="border-t-2 border-red-700 overflow-hidden relative">
          <div className="flex-none px-5 h-full flex items-center text-xs font-black tracking-widest uppercase relative z-10">
            <span 
              className="flex items-center gap-2 antialiased"
              style={{ fontFamily: 'system-ui, Arial, sans-serif', fontWeight: 'bold', letterSpacing: '1px', WebkitFontSmoothing: 'antialiased' }}
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              {t.feedActivity}
            </span>
          </div>
          <div className="flex-1 whitespace-nowrap overflow-hidden relative flex items-center h-full">
            <div className="inline-block px-4 text-sm font-bold uppercase tracking-wider animate-marquee antialiased" style={{ WebkitFontSmoothing: 'antialiased' }}>
              { (() => {
                let marqueeEvents = activeModal === 'logistics' ? [...financeNews] : [...visibleEvents];
                 marqueeEvents.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());
                 const seenTitles = new Set<string>();
                 marqueeEvents = marqueeEvents.filter(ev => {
                   if (seenTitles.has(ev.title)) return false;
                   seenTitles.add(ev.title);
                   return true;
                 });
                 return marqueeEvents.length > 0 ? marqueeEvents.slice(0, 15).map((e, index) => (
                   <span key={`${e.id}-${index}`} className="mr-8">
                     <span className="text-yellow-300 font-black mr-2">{e.location.toUpperCase()}:</span>
                     {e.title}
                   </span>
                 )) : <span className="text-yellow-300">{t.waiting}</span>;
              })()}
            </div>
          </div>
        </footer>

        {/* Ticker Tape */}
        <div style={{ height: '46px' }} className="w-full bg-[#05070a] border-t border-slate-800 relative z-[10]">
          <TickerTapeWidget lang={lang} />
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: '86px', zIndex: 9999 }} className="flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setActiveModal(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="relative w-full max-w-4xl bg-[#0a0f18] border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d131f]">
                <h2 className="text-sm font-bold text-slate-200 tracking-widest uppercase">
                  {activeModal === 'operations' && t.operations}
                  {activeModal === 'logistics' && t.logistics}
                  {activeModal === 'archive' && t.archive}
                  {activeModal === 'support' && 'Fund the Radar / Karargahı Destekle'}
                </h2>
                <button 
                   onClick={() => setActiveModal(null)}
                   className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {activeModal === 'operations' && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-300 font-mono mb-4 leading-relaxed">{t.opsSummary}</p>
                    <div className="grid gap-4">
                      {[
                        { zone: t.zoneEastEu, status: t.statusHighRisk, desc: t.descEastEu, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
                        { zone: t.zoneMidEast, status: t.statusGlobalThreat, desc: t.descMidEast, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
                        { zone: t.zonePacific, status: t.statusControlled, desc: t.descPacific, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" }
                      ].map((item, i) => (
                        <div key={i} className={`p-5 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${item.bg} ${item.border}`}>
                           <div>
                             <h3 className="text-lg font-bold text-white mb-2">{item.zone}</h3>
                             <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                           </div>
                           <span className={`text-xs font-bold tracking-widest uppercase px-4 py-2 border rounded shrink-0 text-center ${item.color} ${item.border}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeModal === 'logistics' && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-300 font-mono mb-3 leading-relaxed">{t.logisticsSummary}</p>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="h-40 bg-[#05070a] border border-slate-700 rounded-lg overflow-hidden relative group">
                          <span className="absolute top-2 left-2 z-[999] text-[10px] sm:text-[11px] font-bold text-slate-300 px-2 py-1 bg-black/80 border border-slate-800 rounded tracking-wider backdrop-blur pointer-events-none uppercase shadow-lg shadow-black/50 group-hover:text-white transition-colors">{t.brentOilLabel}</span>
                          <TradingViewWidget key="oil" symbol="TVC:UKOIL" />
                        </div>
                        <div className="h-40 bg-[#05070a] border border-slate-700 rounded-lg overflow-hidden relative group">
                          <span className="absolute top-2 left-2 z-[999] text-[10px] sm:text-[11px] font-bold text-slate-300 px-2 py-1 bg-black/80 border border-slate-800 rounded tracking-wider backdrop-blur pointer-events-none uppercase shadow-lg shadow-black/50 group-hover:text-white transition-colors">{t.silverLabel}</span>
                          <TradingViewWidget key="silver" symbol="OANDA:XAGUSD" />
                        </div>
                        <div className="h-40 bg-[#05070a] border border-slate-700 rounded-lg overflow-hidden relative group">
                          <span className="absolute top-2 left-2 z-[999] text-[10px] sm:text-[11px] font-bold text-slate-300 px-2 py-1 bg-black/80 border border-slate-800 rounded tracking-wider backdrop-blur pointer-events-none uppercase shadow-lg shadow-black/50 group-hover:text-white transition-colors">{t.nickelLabel}</span>
                          <TradingViewWidget key="nickel" symbol="CAPITALCOM:NICKEL" />
                        </div>
                        <div className="h-40 bg-[#05070a] border border-slate-700 rounded-lg overflow-hidden relative group">
                           <span className="absolute top-2 left-2 z-[999] text-[10px] sm:text-[11px] font-bold text-slate-300 px-2 py-1 bg-black/80 border border-slate-800 rounded tracking-wider backdrop-blur pointer-events-none uppercase shadow-lg shadow-black/50 group-hover:text-white transition-colors">{t.uraniumLabel}</span>
                          <TradingViewWidget key="uranium" symbol="AMEX:URA" />
                        </div>
                        <div className="h-40 bg-[#05070a] border border-slate-700 rounded-lg overflow-hidden relative group">
                          <span className="absolute top-2 left-2 z-[999] text-[10px] sm:text-[11px] font-bold text-emerald-400 px-2 py-1 bg-[#051510]/90 border border-emerald-900/50 rounded tracking-wider backdrop-blur pointer-events-none uppercase shadow-lg shadow-emerald-900/30 group-hover:text-emerald-300 transition-colors uppercase">{t.cognexLabel}</span>
                          <TradingViewWidget key="cognex" symbol="NASDAQ:CGNX" />
                        </div>
                        <div className="h-40 bg-[#05070a] border border-slate-700 rounded-lg overflow-hidden flex flex-col justify-center p-4">
                          <span className="text-[11px] sm:text-xs font-medium text-slate-400 tracking-wider font-sans uppercase mb-2 leading-tight">{t.doomsdayIndex}</span>
                          <div className="flex items-end justify-between">
                            <span className="text-xl sm:text-2xl font-bold text-red-500">23:58:30</span>
                            <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-red-400">
                              <TrendingUp className="w-4 h-4" />
                              -30 SEC
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1 bg-[#0a0f18] border border-slate-800 rounded-lg flex flex-col max-h-[400px] overflow-hidden">
                        <div className="bg-slate-900 border-b border-slate-800 p-3 shrink-0">
                          <h3 className="text-xs font-bold text-slate-300 tracking-widest flex items-center gap-2" style={{ fontFamily: 'sans-serif', WebkitFontSmoothing: 'antialiased', textShadow: 'none' }}>
                             <Activity className="w-4 h-4 text-emerald-500" />
                             {t.marketNews}
                          </h3>
                        </div>
                        <div 
                           className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3"
                           style={{ maxHeight: '400px', overflowY: 'auto', fontFamily: 'sans-serif', WebkitFontSmoothing: 'antialiased', textShadow: 'none' }}
                        >
                           {financeNews.length > 0 ? financeNews.map((news, index) => (
                             <div key={`finance-${news.id}-${index}`} className="border-l-2 border-emerald-500/50 pl-3 py-1 flex flex-col">
                                <div className="text-[10px] text-slate-500 mb-1" style={{ fontFamily: 'sans-serif' }}>
                                  {new Date(news.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' })} 
                                  {' | '}{news.location.toUpperCase()}
                                </div>
                                <h4 className="text-xs font-bold text-slate-200 leading-snug mb-2">{news.title}</h4>
                                {(((news.url && news.url !== "#") ? news.url : null) || (news as any).link || (news as any).articleUrl || (news as any).source) && (
                                  <div className="self-start mt-auto">
                                    <a href={(((news.url && news.url !== "#") ? news.url : null) || (news as any).link || (news as any).articleUrl || (news as any).source)} target="_blank" rel="noopener noreferrer" className="inline-block text-[9px] bg-red-900/50 hover:bg-red-800/80 px-2 py-1 rounded text-red-200 font-mono transition-colors uppercase">
                                      {t.accessSource} &rarr;
                                    </a>
                                  </div>
                                )}
                             </div>
                           )) : (
                             <div className="text-xs text-slate-500 text-center mt-10 uppercase" style={{ fontFamily: 'sans-serif' }}>{t.waitingNews}</div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeModal === 'archive' && (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-300 font-mono mb-4 leading-relaxed">{t.archive} / {t.pastEvents}</p>
                    <div className="flex flex-col gap-3 max-h-[60vh] pr-2 overflow-y-auto custom-scrollbar">
                      {(() => {
                        const seenTitles = new Set<string>();
                        const uniqueArchiveEvents = events.filter(ev => {
                          if (seenTitles.has(ev.title)) return false;
                          seenTitles.add(ev.title);
                          return true;
                        });
                        return uniqueArchiveEvents.slice(0, 50).map((ev, i) => (
                          <div key={ev.id + '-' + i} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-[#05070a] border border-slate-800 rounded-lg hover:border-slate-600 transition-colors">
                             <div className="flex items-center gap-3 shrink-0 md:w-56">
                               <span className="text-xs font-mono text-slate-400">
                                 {new Date(ev.time).toLocaleDateString()} 
                                 {' '} 
                                 {new Date(ev.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' })}
                               </span>
                               <span className="text-[10px] px-2 py-1 rounded border border-slate-700 text-slate-300 bg-slate-800/80 font-bold uppercase whitespace-nowrap">
                                 {ev.location}
                               </span>
                             </div>
                             <div className="flex flex-col flex-1">
                               <p className="text-sm text-slate-200 font-medium leading-relaxed mb-2">
                                 {ev.title}
                               </p>
                               {(((ev.url && ev.url !== "#") ? ev.url : null) || (ev as any).link || (ev as any).articleUrl || (ev as any).source) && (
                                 <div className="self-end">
                                   <a href={(((ev.url && ev.url !== "#") ? ev.url : null) || (ev as any).link || (ev as any).articleUrl || (ev as any).source)} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] bg-red-900/50 hover:bg-red-800/80 px-3 py-1.5 rounded text-red-200 font-mono transition-colors uppercase">
                                     {t.accessSource} &rarr;
                                   </a>
                                 </div>
                               )}
                             </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

{activeModal === 'support' && (
  <div className="space-y-8 flex flex-col items-center justify-center p-8">
    <div className="text-center space-y-3">
      <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Fund the Radar</h3>
      <p className="text-sm text-slate-400 max-w-lg mx-auto">
        Sensör ağının operasyonel kalması için kripto istihkak (yakıt) desteğinizi iletebilirsiniz.
      </p>
    </div>
    
    <div className="w-full max-w-md space-y-4">
      {/* BTC Address Block */}
      <div className="p-4 bg-[#05070a] border border-slate-800 rounded-lg flex flex-col gap-2 relative group hover:border-[#f7931a]/50 transition-colors">
        <span className="text-xs font-bold text-[#f7931a] uppercase tracking-wider">Bitcoin (BTC)</span>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-300 font-mono text-xs sm:text-sm break-all">17xZF4rAa7yPXse4YpTApwiu7MXttmnbY6</span>
          <button 
            onClick={() => navigator.clipboard.writeText('17xZF4rAa7yPXse4YpTApwiu7MXttmnbY6')} 
            className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors shrink-0 text-slate-400 group-hover:text-white" 
            title="Copy BTC Address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* USDT Address Block */}
      <div className="p-4 bg-[#05070a] border border-slate-800 rounded-lg flex flex-col gap-2 relative group hover:border-[#26a17b]/50 transition-colors">
        <span className="text-xs font-bold text-[#26a17b] uppercase tracking-wider">Tether (USDT - TRC20)</span>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-300 font-mono text-xs sm:text-sm break-all">TWNNbpFjjmM4QsNNGMVqzHEf7ZyaURwRQZ</span>
          <button 
            onClick={() => navigator.clipboard.writeText('TWNNbpFjjmM4QsNNGMVqzHEf7ZyaURwRQZ')} 
            className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors shrink-0 text-slate-400 group-hover:text-white" 
            title="Copy USDT Address"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
)}