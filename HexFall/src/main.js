const SAVE_KEY = 'hexfall.save.v1';
const BACKUP_KEY = 'hexfall.save.v1.backup';
const LEGACY_SAVE_KEY = 'ashfall.save.v1';
const LEGACY_BACKUP_KEY = 'ashfall.save.v1.backup';
const MAX_ROUNDS = 4;
const BIG_BAD_ROUNDS = 6;
const MAX_FLOOR = 1000;
const MAX_PRESTIGE = 9;
const BASE_TEAM_SIZE = 3;
const MAX_TEAM_SIZE = 7;
const app = document.querySelector('#app');
const toastRegion = document.querySelector('#toast-region');
const saveStateEl = document.querySelector('#save-state');

function svgIcon(kind, className = '') {
  const shapes = {
    node: '<path d="M12 2.8 20.5 7.7v8.6L12 21.2l-8.5-4.9V7.7L12 2.8Z"/><circle cx="12" cy="12" r="2.2"/>',
    relic: '<path d="M7 4h10l2 4-7 12L5 8l2-4Z"/><path d="M7 4h10M5 8h14M12 8v12"/>',
    descent: '<path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4L12 2.8Z"/><path d="m8 10 4 4 4-4M12 5.5v8.2"/>',
    deep: '<path d="M12 2.5 20.8 7.3v9.4L12 21.5 3.2 16.7V7.3L12 2.5Z"/><path d="M8 9.5h8M8 12.5h8M8 15.5h5"/>',
    archive: '<path d="M5 4.5h14v15H5zM8 8h8M8 12h8M8 16h5"/><path d="M3 7h2M19 7h2"/>',
    synergy: '<circle cx="7" cy="7" r="2.2"/><circle cx="17" cy="7" r="2.2"/><circle cx="12" cy="17" r="2.2"/><path d="m8.8 8.4 2 6M15.2 8.4l-2 6M9.2 7h5.6"/>',
    legendary: '<path d="m12 2 2.3 6.4L21 9.2l-5 4.3 1.6 6.5-5.6-3.7-5.6 3.7L8 13.5l-5-4.3 6.7-.8L12 2Z"/>',
    triad: '<path d="M12 2.7 20.2 7.4v9.2L12 21.3l-8.2-4.7V7.4L12 2.7Z"/><circle cx="12" cy="12" r="3.2"/><path d="M12 4v4M5.3 16l3.5-2M18.7 16l-3.5-2"/>',
    check: '<path d="m4.5 12.5 4.2 4.1L19.5 6"/>',
    defeat: '<path d="m6 6 12 12M18 6 6 18"/>',
    objective: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="6.7"/><circle cx="12" cy="12" r="2"/>',
    hazard: '<path d="M12 3.2 20.6 19H3.4L12 3.2Z"/><path d="M12 8v5M12 16h.01"/>'
  };
  const shape = shapes[kind] || shapes.node;
  return `<svg class="svg-icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${shape}</svg>`;
}

const SIGIL_FRAME = '<path class="sigil-frame" d="M16 1.8 27.8 8.6v5M27.8 18.4v5L16 30.2 4.2 23.4v-5M4.2 13.6v-5L16 1.8Z"/><path class="sigil-tick" d="M2.2 9.1h3.1M26.7 22.9h3.1M14.2 4.1h3.6"/>';
const SIGIL_ART = {
  // The three field companions
  warden: '<path d="M16 6 23 10v6c0 5-3 8-7 10-4-2-7-5-7-10v-6l7-4Z"/><path d="M16 9v14M11 14h10M13 18l3 2 3-2"/>',
  emberling: '<path d="M17 5c1 4 6 6 5 12-.7 4-3.1 7-7 8-5 .8-9-2-9-7 0-3 2-5 4-7 .2 2 1 3 2 4 2-3 2-6 5-10Z"/><path d="M15 15c1 2 0 4-2 6-2-2-2-4 0-6l1-2 1 2Z"/>',
  wayfarer: '<path d="M5 16 25 9l-5 7 5 7L5 16Z"/><path d="M8 16h12M17 13l3 3-3 3"/><circle cx="9" cy="16" r="1.2"/>',
  cinderjaw: '<path d="M6 12 11 7h10l5 5-5 5H11l-5-5Z"/><path d="m11 17-3 7m8-7v8m8-8 3 7M10 12h.01m6 0h.01m6 0h.01"/>',
  ashcap: '<path d="M6 14c0-5 4-8 10-8s10 3 10 8H6Z"/><path d="M11 14v9m10-9v9m-7-9v6m4-6v6M7 7 4 4m21 3 3-3"/>',
  stitchmoth: '<path d="M16 15c-5-7-10-7-12-4 1 4 5 7 11 7-6 0-8 4-7 7 4 1 8-2 8-7 0 5 4 8 8 7 1-3-1-7-7-7 6 0 10-3 11-7-2-3-7-3-12 4Z"/><path d="M16 15v13m-3-4h6"/>',
  paleScribe: '<path d="M8 5h16v21H8z"/><path d="M12 10h8m-8 5h8m-8 5h5M5 8h3m-3 6h3m-3 6h3"/><path d="m20 24 3 3 5-6"/>',
  rootbound: '<path d="M8 25V10l4-4 4 4 4-4 4 4v15H8Z"/><path d="M8 15h16M13 14v5m6-5v5M16 25v-7"/><path d="m8 25-4 4m20-4 4 4"/>',
  bellguard: '<path d="M10 20V10a6 6 0 0 1 12 0v10l3 4H7l3-4Z"/><path d="M16 4V2m-3 25h6M5 12H2m28 0h-3"/><path d="M13 16h6"/>',
  glassjack: '<path d="m7 25 14-18 5 5-18 14-6 2 2-6Z"/><path d="m16 11 5 5M12 20l4 4M6 6l3 3m14 14 3 3"/>',
  rifthound: '<path d="m6 11 7-6 11 4 3 8-6 8H10l-6-8 2-6Z"/><path d="m10 14 4 3 4-3M9 24l-4 4m18-4 4 4M13 9l3 3 3-3"/>',
  lanternmote: '<path d="M10 13V8a6 6 0 0 1 12 0v5l3 5H7l3-5Z"/><path d="M13 23h6m-4-3v3m5-3v3M6 9H3m26 0h-3M8 3 6 1m20 2 2-2"/>',
  sootscribe: '<path d="M23 5C14 5 8 11 8 21c7 0 14-5 15-16Z"/><path d="m8 21 14-13M12 17l1 5m3-8 4 1"/><path d="M5 26h22"/>',
  // The seven new companion disciplines
  cinderwake: '<path d="M16 3c1 6 8 8 8 15a8 8 0 0 1-16 0c0-4 3-7 5-10 1 3 2 4 3 5 2-3 1-6 0-10Z"/><path d="M12 18c1-2 2-3 4-5 2 3 3 5 1 8-2 2-5 1-5-3Z"/><path d="M5 27h22"/>',
  veilmender: '<path d="M7 8h18v14H7z"/><path d="M10 15h12M16 11v8"/><path d="M5 8c3-4 6-4 11 0 5-4 8-4 11 0M5 22c3 4 6 4 11 0 5 4 8 4 11 0"/>',
  gravebastion: '<path d="M7 26V9l9-6 9 6v17H7Z"/><path d="M11 12h10m-5-4v8m-4 10v-7h8v7"/><path d="M4 26h24"/>',
  oathroot: '<path d="M16 4v15m0-9-7-5m7 5 7-5m-7 9-8-4m8 4 8-4m-8 4v7"/><path d="M16 19c-4 2-6 5-7 9m7-9c4 2 6 5 7 9M7 28H4m21 0h3"/><circle cx="16" cy="4" r="2"/>',
  knifewisp: '<path d="m9 25 7-19 7 19-7-4-7 4Z"/><path d="M16 6v16M5 12l5 3m17-3-5 3M5 22l6-2m16 2-6-2"/>',
  ruinpike: '<path d="M16 3v26"/><path d="m16 3 5 7-5 7-5-7 5-7Z"/><path d="M10 14 5 21h9m3 0h9l-5-7"/><path d="M7 29h18"/>',
  moonquill: '<path d="M25 5C15 5 8 11 8 22c8-1 14-6 17-17Z"/><path d="M8 22 24 8M13 18l1 7m4-11 4 1"/><path d="M5 28h22"/>',
  // The ruin's creatures
  vanguard: '<path d="M7 25V11l4-4 5 4 5-4 4 4v14H7Z"/><path d="M7 15h18M12 14v4m8-4v4M14 25v-6h4v6"/>',
  arcanist: '<circle cx="16" cy="16" r="8"/><path d="M16 3v7M16 22v7M3 16h7M22 16h7M7 7l5 5M20 20l5 5M25 7l-5 5M12 20l-5 5"/><path d="m16 11 1.7 3.3L21 16l-3.3 1.7L16 21l-1.7-3.3L11 16l3.3-1.7L16 11Z"/>',
  scout: '<path d="M5 22 23 8l-4 16-5-7-9 5Z"/><path d="m14 17 6 2M8 20l-3 5M11 18l-1 7"/>',
  duelist: '<path d="m8 24 15-15M18 7h6v6M7 18v6h6"/><path d="m8 8 16 16M6 6l4 4M22 22l4 4"/><path d="m16 12 4 4"/>',
  geomancer: '<path d="m6 23 5-13 5 10 4-14 5 17H6Z"/><path d="m11 10 5 10 4-14M9 23l7-3 5 3M8 26h16"/><path d="m13 7 2-3 2 3"/>',
  conduit: '<circle cx="16" cy="16" r="3"/><circle cx="16" cy="6" r="2"/><circle cx="26" cy="16" r="2"/><circle cx="16" cy="26" r="2"/><circle cx="6" cy="16" r="2"/><path d="M16 9v4m7 3h-4m-3 7v-4m-7-5h4M9 9l5 5m4 4 4 4m1-13-5 5m-4 4-5 5"/>',
  riftblade: '<path d="m6 24 15-17m-8 0 8 0 1 8M7 8l15 16m-8 0h8v-8"/><path d="M8 16h4m8 0h4"/><circle cx="16" cy="16" r="3"/>',
  stormcaller: '<path d="M18 3 7 18h8l-1 11 11-16h-8l1-10Z"/><path d="M5 8 3 6m24 2 2-2M5 24l-2 2m24-2 2 2"/>',
  soulweaver: '<path d="M16 26S5 20 5 12a5 5 0 0 1 9-3l2 3 2-3a5 5 0 0 1 9 3c0 8-11 14-11 14Z"/><path d="M8 16h5l2-4 3 8 2-4h4"/>',
  // The ruin's creatures
  husk: '<path d="m8 11 3-4 5 2 5-2 3 4v8l-4 5H12l-4-5v-8Z"/><path d="m8 11-4-3m4 8-4 2m20-7 4-3m-4 8 4 2M12 14h2m6 0h2M14 20h4m-4-12 2 3 2-3"/>',
  wisp: '<path d="M11 7V4h10v3M9 8h14v14H9zM7 13H4m20 0h3M16 11c3 3 3 5 0 7-3-2-3-4 0-7Z"/><path d="M12 25h8m-6-3v3m4-3v3"/>',
  rootmother: '<path d="M16 13V5m0 6-6-5m6 5 6-5m-6 10-8-4m8 4 8-4m-8 4v5m0 0-7 6m7-6 7 6"/><circle cx="16" cy="5" r="2"/><path d="m7 25-3 1m21-1 3 1M10 8 7 6m18 0-3 2"/>',
  skitter: '<path d="m16 9 6 4-2 8-4 3-4-3-2-8 6-4Z"/><path d="m11 13-6-5-2 1m7 7-7 1-1 3m18-7 6-5 2 1m-7 8 7 1 1 3M13 11l3 3 3-3m-3 3v5"/>',
  mireling: '<path d="M16 5c3 5 7 8 6 13a6 6 0 0 1-12 0c-1-5 3-8 6-13Z"/><path d="M12 17c1-2 2-3 4-4 2 2 3 4 1 6-2 2-5 1-5-2Z"/><path d="M6 24c2 2 5 3 10 3s8-1 10-3"/>',
  shade: '<path d="m16 4 10 8v8l-10 8L6 20v-8l10-8Z"/><path d="M10 15h4m4 0h4M13 21h6M16 4v-2M6 12 3 10m23 2 3-2"/>',
  riftstalker: '<path d="m7 8 9-5 9 5-5 8 5 8-9 5-9-5 5-8-5-8Z"/><path d="m12 11 8 10m0-10-8 10M5 8h5m12 16h5"/>',
  mossoracle: '<path d="M16 7c-6 0-10 4-10 9 0 4 4 7 10 9 6-2 10-5 10-9 0-5-4-9-10-9Z"/><circle cx="16" cy="16" r="3"/><path d="M16 13V6m-6 4-3-3m15 3 3-3m-3 12 4 3m-20-3-4 3"/>',
  // Floor wardens
  ashcolossus: '<path d="m5 24 3-13 5 5 3-12 4 11 4-5 3 14H5Z"/><path d="m9 25 4-6 3 3 4-5 4 8M16 6v7m-4 4 3 2m4 1 3-2"/>',
  bellwidow: '<path d="M12 16V9a4 4 0 0 1 8 0v7l3 4H9l3-4Z"/><path d="M16 5V3m-7 9-5-3m6 8-6 2m18-7 5-3m-6 8 6 2M12 22l-3 4m11-4 3 4M14 20h4"/><circle cx="16" cy="12" r="1"/>'
};
function characterSvg(kind, className = '') {
  const safeKind = Object.prototype.hasOwnProperty.call(SIGIL_ART, kind) ? kind : 'warden';
  return `<svg class="character-svg sigil-${safeKind} ${className}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${SIGIL_FRAME}${SIGIL_ART[safeKind]}</svg>`;
}
function unitSigilKey(unit) {
  return unit?.side === 'ally' && unit.kind === 'warden' ? (unit.startingClass || state.meta.startingClass || 'warden') : (unit?.kind || 'warden');
}

const HERO_DEFS = {
  warden: { name: 'Warden', role: 'front line', classType: 'Tank', attackType: 'Short range', icon: 'W', maxHp: 10, hp: 10, damage: 3, range: 1, move: 3, ability: 'Brace Line', description: 'Turns adjacency into shelter. A good Warden makes the board smaller for the enemy.', abilityText: 'Guard self and one adjacent ally.', color: 'cyan' },
  emberling: { name: 'Emberling', role: 'area damage', classType: 'Striker', attackType: 'AOE', icon: 'E', maxHp: 7, hp: 7, damage: 3, range: 2, move: 3, ability: 'Cinder Arc', description: 'A small body with a wide answer. Burns the target and nearby enemies.', abilityText: 'Strike a target and scorch a nearby hex.', color: 'cyan' },
  wayfarer: { name: 'Wayfarer', role: 'mobility / range', classType: 'Skirmisher', attackType: 'Long range', icon: 'Wf', maxHp: 8, hp: 8, damage: 2, range: 3, move: 4, ability: 'Thread the Needle', description: 'Finds the line no one else sees. Long reach, little patience.', abilityText: 'Make a precise long-range strike for +2 damage.', color: 'cyan' },
  cinderjaw: { name: 'Cinderjaw', role: 'area damage', classType: 'Striker', attackType: 'AOE', icon: 'Cj', maxHp: 8, hp: 8, damage: 2, range: 2, move: 2, ability: 'Furnace Bite', description: 'A kiln-toothed scavenger that spits a fan of hungry sparks through clustered foes.', abilityText: 'Strike a target, splash nearby enemies, and apply Burn.', color: 'cyan' },
  ashcap: { name: 'Ashcap', role: 'area damage', classType: 'Controller', attackType: 'AOE', icon: 'Ac', maxHp: 7, hp: 7, damage: 2, range: 3, move: 2, ability: 'Sporefall', description: 'A walking soot mushroom whose pale spores make every crowded hex hazardous.', abilityText: 'Burst the target and nearby enemies, applying Poison.', color: 'cyan' },
  stitchmoth: { name: 'Stitchmoth', role: 'healer', classType: 'Support', attackType: 'Short range', icon: 'Sm', maxHp: 7, hp: 7, damage: 1, range: 1, move: 3, ability: 'Silk Mend', description: 'It sews torn wards back together with thread spun from old funeral banners.', abilityText: 'Heal the most wounded ally and reinforce an adjacent ally.', color: 'cyan' },
  paleScribe: { name: 'Pale Scribe', role: 'healer', classType: 'Support', attackType: 'Long range', icon: 'Ps', maxHp: 6, hp: 6, damage: 1, range: 3, move: 2, ability: 'Whiteout Litany', description: 'A hollow archivist that erases pain from the margins of a living body.', abilityText: 'Heal every ally for 1 and cleanse one harmful status.', color: 'cyan' },
  rootbound: { name: 'Rootbound', role: 'tank', classType: 'Tank', attackType: 'Short range', icon: 'Rb', maxHp: 11, hp: 11, damage: 2, range: 1, move: 1, ability: 'Ironroot Stand', description: 'A buried guardian that remembers the shape of the first wall built in the ruin.', abilityText: 'Gain heavy Guard and grant nearby allies a smaller ward.', color: 'cyan' },
  bellguard: { name: 'Bellguard', role: 'tank', classType: 'Tank', attackType: 'Short range', icon: 'Bg', maxHp: 10, hp: 10, damage: 2, range: 1, move: 2, ability: 'Tollbreaker', description: 'A cracked chapel bell wrapped in armor, ringing whenever the line is threatened.', abilityText: 'Guard yourself, then strike a nearby enemy for +1 damage.', color: 'cyan' },
  glassjack: { name: 'Glassjack', role: 'short-range striker', classType: 'Striker', attackType: 'Short range', icon: 'Gj', maxHp: 7, hp: 7, damage: 3, range: 1, move: 4, ability: 'Shard Rush', description: 'A sharp-limbed raider that turns one opening into a bright, ugly wound.', abilityText: 'Strike at close range for +2 damage and gain 1 Guard.', color: 'cyan' },
  rifthound: { name: 'Rifthound', role: 'short-range striker', classType: 'Striker', attackType: 'Short range', icon: 'Rh', maxHp: 8, hp: 8, damage: 3, range: 1, move: 3, ability: 'Phase Maul', description: 'A three-eyed hunting beast that bites through the seam between two hexes.', abilityText: 'Strike at close range and bypass 1 Guard.', color: 'cyan' },
  lanternmote: { name: 'Lantern Mote', role: 'long-range support', classType: 'Controller', attackType: 'Long range', icon: 'Lm', maxHp: 6, hp: 6, damage: 2, range: 4, move: 2, ability: 'Guiding Mark', description: 'A tiny lantern spirit that paints a target for the next blade in the dark.', abilityText: 'Strike from afar and Mark the target for bonus incoming damage.', color: 'cyan' },
  sootscribe: { name: 'Sootscribe', role: 'long-range striker', classType: 'Striker', attackType: 'Long range', icon: 'Ss', maxHp: 7, hp: 7, damage: 2, range: 4, move: 2, ability: 'Blackline', description: 'A wandering ink-maker whose shots leave burning sentences across the battlefield.', abilityText: 'Make a precise long-range strike for +2 damage and apply Burn.', color: 'cyan' },
  cinderwake: { name: 'Cinderwake', role: 'area damage', classType: 'Striker', attackType: 'AOE', icon: 'Cw', maxHp: 8, hp: 8, damage: 3, range: 2, move: 2, ability: 'Wakeburst', description: 'A coal-hearted revenant that drags a fan of living fire behind every step.', abilityText: 'Strike a target and scorch every enemy beside it for 1.', color: 'cyan' },
  veilmender: { name: 'Veilmender', role: 'healer', classType: 'Support', attackType: 'Long range', icon: 'Vm', maxHp: 6, hp: 6, damage: 1, range: 3, move: 3, ability: 'Veil Stitch', description: 'A quiet figure beneath funeral gauze, carrying spare thread for wounds the ruin has not made yet.', abilityText: 'Heal the most wounded ally for 3 and cleanse one status.', color: 'cyan' },
  gravebastion: { name: 'Gravebastion', role: 'tank', classType: 'Tank', attackType: 'Short range', icon: 'Gb', maxHp: 12, hp: 12, damage: 2, range: 1, move: 1, ability: 'Tombwall', description: 'A walking mausoleum that plants its weight between the party and the dark.', abilityText: 'Gain 3 Guard and pull enemy intent toward you.', color: 'cyan' },
  oathroot: { name: 'Oathroot', role: 'tank', classType: 'Tank', attackType: 'Short range', icon: 'Or', maxHp: 10, hp: 10, damage: 2, range: 1, move: 2, ability: 'Rooted Vow', description: 'An old pact given bark and bone, stubborn enough to hold when the floor gives way.', abilityText: 'Guard yourself and grant 1 Guard to every adjacent ally.', color: 'cyan' },
  knifewisp: { name: 'Knifewisp', role: 'short-range striker', classType: 'Striker', attackType: 'Short range', icon: 'Kw', maxHp: 6, hp: 6, damage: 4, range: 1, move: 5, ability: 'Flicker Cut', description: 'A sliver of blue light with a knife where its shadow should be.', abilityText: 'Strike at close range for +2 damage, then move one hex.', color: 'cyan' },
  ruinpike: { name: 'Ruinpike', role: 'short-range striker', classType: 'Striker', attackType: 'Short range', icon: 'Rp', maxHp: 9, hp: 9, damage: 3, range: 1, move: 3, ability: 'Pikefall', description: 'A battered sentinel built around a single piece of the ruin’s first iron.', abilityText: 'Strike for +2 damage and Pierce 1 Guard.', color: 'cyan' },
  moonquill: { name: 'Moonquill', role: 'long-range striker', classType: 'Striker', attackType: 'Long range', icon: 'Mq', maxHp: 6, hp: 6, damage: 3, range: 5, move: 2, ability: 'Silver Sentence', description: 'A pale scribe-bird that writes its next target into the air before the shot lands.', abilityText: 'Make a precise long-range strike for +3 damage and Mark the target.', color: 'cyan' }
};
const ENEMY_DEFS = {
  husk: { name: 'Husk', role: 'pressure melee', classType: 'Bruiser', attackType: 'Short range', icon: 'H', maxHp: 7, hp: 7, damage: 2, range: 1, move: 2, description: 'A patient body with one thought: close the distance.', color: 'crimson' },
  wisp: { name: 'Lantern Wisp', role: 'ranged controller', classType: 'Controller', attackType: 'Long range', icon: 'L', maxHp: 5, hp: 5, damage: 2, range: 3, move: 2, description: 'It prefers high ground and heroes who have nowhere left to hide.', color: 'crimson' },
  rootmother: { name: 'Rootmother', role: 'area denial', classType: 'Controller', attackType: 'AOE', icon: 'R', maxHp: 9, hp: 9, damage: 1, range: 2, move: 1, description: 'The floor is part of her body. Give her a turn and the room changes shape.', color: 'crimson' },
  skitter: { name: 'Glass Skitter', role: 'flanking melee', icon: 'S', maxHp: 4, hp: 4, damage: 2, range: 1, move: 4, description: 'A shard-legged hunter that turns open space into a threat.', color: 'crimson' },
  mireling: { name: 'Mireling', role: 'status artillery', icon: 'M', maxHp: 6, hp: 6, damage: 1, range: 2, move: 2, description: 'It spits a slow poison and leaves the floor wet with trouble.', color: 'crimson' },
  shade: { name: 'Hollow Shade', role: 'ambush ranged', icon: 'Sh', maxHp: 4, hp: 4, damage: 3, range: 2, move: 3, description: 'A cold outline that appears where your formation is weakest.', color: 'crimson' },
  riftstalker: { name: 'Rift Stalker', role: 'phase flanker', icon: 'Rf', maxHp: 5, hp: 5, damage: 2, range: 1, move: 3, description: 'It slips through a rift to land beside a hero. Keep it away or it will strike next turn.', color: 'crimson' },
  mossoracle: { name: 'Moss Oracle', role: 'marking support', icon: 'Mo', maxHp: 6, hp: 6, damage: 1, range: 3, move: 1, description: 'Its green sigil marks one hero; the next enemy hit against them deals +1 damage.', color: 'crimson' }
};
const ELITE_TRAITS = {
  fortified: { name: 'Fortified', description: 'Starts with 3 guard.', color: 'gold' },
  frenzied: { name: 'Frenzied', description: '+1 damage below half health.', color: 'ember' },
  swift: { name: 'Swift', description: '+1 movement range.', color: 'cyan' },
  volatile: { name: 'Volatile', description: 'Bursts for 1 damage when defeated.', color: 'crimson' }
};
const RELICS = {
  'ember-lens': { name: 'Ember Lens', cost: 4, maxLevel: 3, rarity: 'common', effect: '+1 party damage / tier', description: 'Every hero hits harder. Each tier adds +1 base damage.' },
  'ward-thread': { name: 'Ward Thread', cost: 5, maxLevel: 3, rarity: 'common', effect: '+2 party max HP / tier', description: 'Stitch another layer into every hero’s ward: +2 maximum health per tier.' },
  'lucky-nail': { name: 'Lucky Nail', cost: 6, maxLevel: 3, rarity: 'uncommon', effect: '+12% critical chance / tier', description: 'A crooked nail, a straight shot. Each tier adds 12% critical chance.' },
  'echo-charm': { name: 'Echo Charm', cost: 3, maxLevel: 3, rarity: 'common', effect: '+1 starting guard / tier', description: 'Its first chime lingers. Every hero starts each floor with +1 guard per tier.' },
  'ashen-crown': { name: 'Ashen Crown', cost: 8, maxLevel: 2, rarity: 'rare', effect: '+1 opening damage / tier', description: 'The first party attack of each round deals +1 damage per tier.' },
  'sable-compass': { name: 'Sable Compass', cost: 7, maxLevel: 2, rarity: 'uncommon', effect: '+1 movement / tier', description: 'The needle points through danger. Every hero gains +1 movement per tier.' },
  'venom-quill': { name: 'Venom Quill', cost: 9, maxLevel: 3, rarity: 'rare', effect: '+1 burn & poison damage / tier', description: 'Burn and Poison tick for +1 damage per tier.' },
  'last-cinder': { name: 'Last Cinder', cost: 11, maxLevel: 1, rarity: 'legendary', effect: 'One return from the brink', description: 'Once per floor, the first fallen hero returns with 3 HP and 1 guard.' },
  'moon-glass': { name: 'Moon Glass', cost: 7, maxLevel: 2, rarity: 'uncommon', effect: '+1 party range / tier', description: 'A shard of moonlit sight extends every hero’s attack range by 1 per tier.' },
  'hunter-bell': { name: 'Hunter Bell', cost: 8, maxLevel: 3, rarity: 'rare', effect: '+1 elite & boss damage / tier', description: 'Its low note finds the weak seam: +1 damage against elites and bosses per tier.' },
  'moth-censer': { name: 'Moth Censer', cost: 6, maxLevel: 1, rarity: 'uncommon', effect: 'Negate first party status', description: 'Each hero ignores the first Burn, Poison, or Bramble status they would receive each floor.' },
  'root-knot': { name: 'Root Knot', cost: 5, maxLevel: 1, rarity: 'common', effect: 'Cross bramble safely once', description: 'The first bramble crossing by each hero deals no damage.' },
  'shard-purse': { name: 'Shard Purse', cost: 10, maxLevel: 3, rarity: 'rare', effect: '+1 floor shard / tier', description: 'Keep the broken edges. Earn +1 ember shard when a floor is cleared per tier.' },
  'storm-coil': { name: 'Storm Coil', cost: 9, maxLevel: 3, rarity: 'rare', effect: 'Criticals arc to a second foe', description: 'Critical hits arc into the nearest other enemy for damage equal to this relic’s tier.' },
  'glass-fang': { name: 'Glass Fang', cost: 8, maxLevel: 2, rarity: 'rare', effect: '+0.18 critical multiplier / tier', description: 'Critical strikes gain +0.18 damage multiplier per tier.' },
  'war-chant': { name: 'War Chant', cost: 7, maxLevel: 2, rarity: 'uncommon', effect: '+1 damage after a party hit / tier', description: 'Once the party has struck this round, later attacks deal +1 damage per tier.' },
  'black-salt': { name: 'Black Salt', cost: 5, maxLevel: 2, rarity: 'uncommon', effect: '+1 damage to afflicted foes / tier', description: 'Attacks against an enemy with a status effect deal +1 damage per tier.' },
  'mending-loop': { name: 'Mending Loop', cost: 8, maxLevel: 3, rarity: 'rare', effect: 'Every third party hit heals', description: 'Every third party strike restores HP to the most wounded living hero, equal to this relic’s tier.' },
  'silver-pact': { name: 'Silver Pact', cost: 5, maxLevel: 2, rarity: 'common', effect: '+1 guard action / tier', description: 'A deliberate Guard action grants +1 additional guard per tier.' },
  'hollow-mirror': { name: 'Hollow Mirror', cost: 9, maxLevel: 2, rarity: 'rare', effect: 'Reduce first hit each round', description: 'The first damage each hero takes in a round is reduced by this relic’s tier.' },
  'scribe-seal': { name: 'Scribe Seal', cost: 6, maxLevel: 3, rarity: 'uncommon', effect: '+1 signature damage / tier', description: 'Class signature attacks gain +1 damage per tier.' }
};
const RELIC_SIGILS = {
  'ember-lens': '<circle cx="16" cy="16" r="7"/><circle cx="16" cy="16" r="2"/><path d="M16 3v4m0 18v4M3 16h4m18 0h4M7 7l3 3m12 12 3 3M25 7l-3 3m-12 12-3 3"/>',
  'ward-thread': '<path d="M16 5 24 10v6c0 5-3 8-8 11-5-3-8-6-8-11v-6l8-5Z"/><path d="M16 9v14m-5-9h10m-9 8h8M10 12l2-2m8 2 2-2"/>',
  'lucky-nail': '<path d="m11 7 10 10m-13-7 3-3 10 10-3 3M18 20l-5 5m-2-7 4 4M8 5l2-2m12 12 3-2"/><path d="m7 18-2 2m13-13 2-2"/>',
  'echo-charm': '<path d="M11 9V5h10v4m-12 0h14v8H9zM12 25c0-3 10-3 10 0M16 17v4m-5 0h10"/><path d="M6 12H3m23 0h-3M7 18l-3 2m20-2 3 2"/>',
  'ashen-crown': '<path d="m6 22 2-11 6 5 3-10 4 10 5-5 2 11H6Z"/><path d="M12 10c-2-3 1-4 1-7 3 2 4 4 2 7m-6 15h14"/>',
  'sable-compass': '<circle cx="16" cy="16" r="11"/><path d="m20 11-3 8-5 2 3-8 5-2Z"/><path d="M16 3v3m0 20v3M3 16h3m20 0h3"/>',
  'venom-quill': '<path d="M24 6C14 6 8 12 8 22c7 0 15-6 16-16Z"/><path d="m8 22 13-13m-9 9 1 4m3-8 3 1"/><path d="M25 23c0 2-2 4-4 4s-4-2-4-4c0-2 4-6 4-6s4 4 4 6Z"/>',
  'last-cinder': '<circle cx="16" cy="16" r="10"/><path d="M16 6c1 4 6 6 5 12-1 4-4 6-7 5-4-1-5-5-3-8 1-2 3-3 3-6 2 2 3 4 2 6 2-3 1-6 0-9Z"/><path d="M13 19c1-2 2-2 3-3 1 2 1 4-1 5"/>',
  'moon-glass': '<path d="M21 7a10 10 0 1 0 4 14A9 9 0 0 1 21 7Z"/><path d="M9 23 23 9m-4 0h4v4M7 10l2-2m13 17 2-2"/>',
  'hunter-bell': '<path d="M12 19V9a4 4 0 0 1 8 0v10l3 3H9l3-3Z"/><path d="M16 5V3m-2 21a2 2 0 0 0 4 0M5 8h3m16 0h3M5 14h3m16 0h3"/>',
  'moth-censer': '<path d="M16 14c-4-7-9-8-11-5 1 4 4 7 10 8-6 0-8 4-7 7 4 1 8-1 9-7 1 6 5 8 9 7 1-3-1-7-7-7 6-1 9-4 10-8-2-3-7-2-11 5Z"/><circle cx="16" cy="16" r="2"/><path d="M16 18v4m-3 3h6M13 9c-2-2 1-3 0-5m6 5c2-2-1-3 0-5"/>',
  'root-knot': '<path d="M16 7v10m0-6-6-4m6 4 6-4m-6 9-7 5m7-5 7 5M8 22l-3 4m19-4 3 4"/><path d="m12 6 4-3 4 3-4 3-4-3Z"/>',
  'shard-purse': '<path d="M9 8V6h14v18H9zM9 11H6v13h17"/><circle cx="17" cy="16" r="3"/><path d="M17 12v8m-2-4h4M5 5h3m0 0V3"/>',
  'storm-coil': '<path d="M18 4 9 17h6l-1 11 9-14h-6l1-10Z"/><circle cx="16" cy="16" r="12" stroke-dasharray="2 3"/>',
  'glass-fang': '<path d="m11 5 10 3-2 11-5 8-5-8-2-11 4 5 4-5Z"/><path d="m11 8 3 7 5-7m-5 7v8"/>',
  'war-chant': '<path d="M7 11h5l10-5v20l-10-5H7zM12 11v10"/><path d="M24 12c3 2 3 6 0 8m2-12c5 4 5 12 0 16"/>',
  'black-salt': '<path d="m8 21 5-14 4 8 4-11 4 17H8Z"/><path d="M5 25h22m-13-6 4-4 4 6"/>',
  'mending-loop': '<path d="M24 12a8 8 0 1 0 2 6"/><path d="M24 5v7h-7M16 11v10m-5-5h10m-7-3 2 2 2-2"/>',
  'silver-pact': '<circle cx="16" cy="16" r="10"/><path d="m10 17 4 4 8-10m-14 5-3 3m17-8 3-3"/><path d="M12 5h8"/>',
  'hollow-mirror': '<path d="M10 4h12v22H10zM7 8v15"/><path d="m17 7-3 6 4 2-3 7m-1-13 3 1"/><circle cx="25" cy="8" r="2"/>',
  'scribe-seal': '<path d="m8 23 3-8L22 4l5 5-11 11-8 3Z"/><path d="m19 7 5 5m-12 4 5 5M8 26h17m-17-4h4"/><circle cx="23" cy="7" r="1"/>'
};
const RELIC_SIGIL_FRAME = '<path d="M16 2 27 8v16l-11 6L5 24V8l11-6Z" opacity=".38"/><path d="M4 10V6l4-2m16 0 4 2v4M4 22v4l4 2m16 0 4-2v-4" opacity=".72"/>';
function relicSvg(id) {
  const art = RELIC_SIGILS[id] || RELIC_SIGILS['ember-lens'];
  return `<svg class="relic-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${RELIC_SIGIL_FRAME}${art}</svg>`;
}
const BOSS_RELICS = {
  'colossus-heart': { name: 'Colossus Heart', description: 'Boss drop: all heroes gain +4 maximum health.', effect: '+4 max HP' },
  'widow-eye': { name: 'Widow Eye', description: 'Boss drop: all heroes gain +1 attack range.', effect: '+1 range' }
};
const META_NODES = {
  'cinder-core': { name: 'Cinder Core', cost: 8, description: 'Permanent: all heroes deal +1 base damage.', effect: '+1 damage' },
  'iron-roots': { name: 'Iron Roots', cost: 10, description: 'Permanent: all heroes gain +2 maximum health.', effect: '+2 max HP' },
  'first-breath': { name: 'First Breath', cost: 12, description: 'Permanent: critical-hit chance increases by 10%.', effect: '+10% crit' },
  vanguard: { name: 'Vanguard', cost: 12, description: 'Unlock Vanguard as a main class: more health, a crushing close hit, and slower movement.', effect: 'Unlock class' },
  arcanist: { name: 'Arcanist', cost: 14, description: 'Unlock Arcanist as a main class: long-range Burn attacks at a health cost.', effect: 'Unlock class' },
  scout: { name: 'Scout', cost: 10, description: 'Unlock Scout as a main class: the fastest leader, with a free sidestep after its signature.', effect: 'Unlock class' },
  duelist: { name: 'Duelist', cost: 13, description: 'Unlock Duelist as a main class: fast precision strikes and a guard-building signature.', effect: 'Unlock class' },
  geomancer: { name: 'Geomancer', cost: 15, description: 'Unlock Geomancer as a main class: shape the terrain and punish foes near bramble.', effect: 'Unlock class' },
  conduit: { name: 'Conduit', cost: 16, description: 'Unlock Conduit as a main class: steady ranged strikes that arc between enemies.', effect: 'Unlock class' },
  riftblade: { name: 'Riftblade', cost: 22, description: 'Unlock a swift phase fighter who slips through guard and blinks into range.', effect: 'Unlock main class' },
  stormcaller: { name: 'Stormcaller', cost: 24, description: 'Unlock a slow, far-reaching caster whose attacks leap between enemies.', effect: 'Unlock main class' },
  soulweaver: { name: 'Soulweaver', cost: 20, description: 'Unlock a durable field medic who steals vitality and restores the party.', effect: 'Unlock main class' },
  'ember-well': { name: 'Ember Well', cost: 15, description: 'Permanent: earn one extra ember shard whenever a floor is cleared.', effect: '+1 floor shard' },
  'iron-vow': { name: 'Iron Vow', cost: 18, description: 'Permanent: the party begins each floor with one extra guard.', effect: '+1 starting guard' },
  'combo-memory': { name: 'Combo Memory', cost: 20, description: 'Permanent: each battle starts with a one-hit combo charge.', effect: 'Start combo charged' },
  'ward-lattice': { name: 'Ward Lattice', cost: 16, description: 'Permanent: every deployed ally begins with one extra Guard.', effect: '+1 starting Guard' },
  'field-rations': { name: 'Field Rations', cost: 14, description: 'Permanent: every deployed ally gains +1 maximum health.', effect: '+1 max HP' },
  'quickstep-archive': { name: 'Quickstep Archive', cost: 18, description: 'Permanent: every deployed ally gains one extra movement point.', effect: '+1 movement' },
  'companion-oath': { name: 'Companion Oath', cost: 22, description: 'Permanent: companions deal +1 base damage while the Main Class remains alive.', effect: '+1 companion damage' },
  'battlefield-cache': { name: 'Battlefield Cache', cost: 20, description: 'Permanent: every deployed companion gains one extra maximum health.', effect: '+1 companion max HP' },
  'rallying-step': { name: 'Rallying Step', cost: 24, description: 'Permanent: every deployed hero gains one extra movement point.', effect: '+1 hero movement' },
  'legendary-emberheart': { name: 'Emberheart Ascendant', cost: 30, description: 'Legendary: the archive yields two additional ember shards on every cleared floor.', effect: '+2 floor shards', prerequisites: ['cinder-core', 'ember-well', 'iron-vow'], legendary: true },
  'legendary-singularity': { name: 'Singularity Edge', cost: 35, description: 'Legendary: the first hero attack of every battle is guaranteed critical.', effect: 'Guaranteed opening crit', prerequisites: ['first-breath', 'combo-memory', 'duelist'], legendary: true },
  'legendary-worldroot': { name: 'Worldroot Covenant', cost: 32, description: 'Legendary: all heroes gain +3 maximum health and the Geomancer branch becomes rooted.', effect: '+3 max HP', prerequisites: ['iron-roots', 'geomancer', 'conduit'], legendary: true }
};
const META_SYNERGIES = [
  { id: 'molten-bastion', nodes: ['cinder-core', 'iron-roots'], name: 'Molten Bastion', description: 'The party starts each floor with +1 guard.', effect: '+1 starting guard' },
  { id: 'perfect-opening', nodes: ['first-breath', 'combo-memory'], name: 'Perfect Opening', description: 'The first hero attack each round deals +1 damage and gains +5% crit chance.', effect: 'Opening strike bonus' },
  { id: 'deep-reserve', nodes: ['ember-well', 'iron-vow'], name: 'Deep Reserve', description: 'Cleared floors yield one additional ember shard.', effect: '+1 floor shard' },
  { id: 'edge-theory', nodes: ['duelist', 'first-breath'], name: 'Edge Theory', description: 'Duelist-led runs gain +8% critical-hit chance.', effect: '+8% crit' }
];
const ACHIEVEMENTS = [
  { id: 'first-descent', icon: 'descent', name: 'First Descent', description: 'Log your first dungeon run.', condition: () => state.history.length >= 1 },
  { id: 'deep-ward', icon: 'deep', name: 'Deep Ward', description: 'Reach floor 5 in a recorded run.', condition: () => state.history.some(run => run.floor >= 5) },
  { id: 'archive-keeper', icon: 'archive', name: 'Archive Keeper', description: 'Log 10 dungeon runs.', condition: () => state.history.length >= 10 },
  { id: 'synergy-cartographer', icon: 'synergy', name: 'Synergy Cartographer', description: 'Record a run with at least three active synergies.', condition: () => state.history.some(run => (run.synergies || []).length >= 3) },
  { id: 'relic-harvester', icon: 'relic', name: 'Relic Harvester', description: 'Carry four or more relics in a recorded run.', condition: () => state.history.some(run => (run.relics || []).length >= 4) },
  { id: 'emberheart-forged', icon: 'legendary', name: 'Emberheart Forged', description: 'Unlock the Emberheart Ascendant legendary branch.', condition: () => state.meta.unlocked.includes('legendary-emberheart') },
  { id: 'singularity-forged', icon: 'legendary', name: 'Singularity Forged', description: 'Unlock the Singularity Edge legendary branch.', condition: () => state.meta.unlocked.includes('legendary-singularity') },
  { id: 'worldroot-forged', icon: 'legendary', name: 'Worldroot Forged', description: 'Unlock the Worldroot Covenant legendary branch.', condition: () => state.meta.unlocked.includes('legendary-worldroot') },
  { id: 'legendary-triad', icon: 'triad', name: 'The Legendary Triad', description: 'Awaken all three legendary meta-tree branches.', condition: () => ['legendary-emberheart', 'legendary-singularity', 'legendary-worldroot'].every(id => state.meta.unlocked.includes(id)) }
];
const STARTING_CLASSES = {
  warden: { name: 'Warden', role: 'front-line sentinel', description: 'A steady shield-bearer who turns every safe hit into more protection.', damage: 0, maxHp: 0, range: 0, move: 0, movementStyle: 'Steady march · 3 hexes', attackType: 'Shield melee', attackStyle: 'Shield bash · basic hits add 1 Guard', ability: 'Brace Line', abilityText: 'Guard yourself and one adjacent ally.', synergy: 'Shelter: guarding also steadies the nearest ally.' },
  vanguard: { name: 'Vanguard', role: 'iron breaker', description: 'A slow, armored bruiser built to crack the front line.', damage: 1, maxHp: 3, range: 0, move: -1, movementStyle: 'Heavy march · 2 hexes', attackType: 'Heavy melee', attackStyle: 'Sunder blow · +1 damage at close range', ability: 'Bulwark Crash', abilityText: 'Guard yourself, then strike a target for +2 damage.', synergy: 'Formation: nearby allies gain +1 guard when you use your ability.' },
  arcanist: { name: 'Arcanist', role: 'long-range channeler', description: 'A fragile spell-slinger who burns foes from beyond the front line.', damage: 1, maxHp: -1, range: 1, move: 0, movementStyle: 'Channeling step · 3 hexes', attackType: 'Arcane ranged', attackStyle: 'Prism shot · every hit applies Burn', ability: 'Prism Bolt', abilityText: 'Fire a +3 damage bolt that applies Burn.', synergy: 'Spellweave: Emberling gains +1 damage and Wayfarer gains +1 range.' },
  scout: { name: 'Scout', role: 'rapid skirmisher', description: 'A long-striding runner who gains a sharper shot after moving.', damage: 0, maxHp: -1, range: 1, move: 2, movementStyle: 'Long dash · 5 hexes', attackType: 'Skirmish ranged', attackStyle: 'Run-and-gun · +1 damage after moving', ability: 'Evasive Volley', abilityText: 'Strike for +1 damage, then sidestep one hex away.', synergy: 'Ambush: the whole party deals +1 damage on round one.' },
  duelist: { name: 'Duelist', role: 'counter striker', description: 'A quick blade specialist whose critical hits punish openings.', damage: 1, maxHp: -1, range: 0, move: 1, movementStyle: 'Lunge · 4 hexes', attackType: 'Precision melee', attackStyle: 'Riposte cut · critical hits deal +1 damage', ability: 'Riposte', abilityText: 'Strike for +2 damage and gain 2 Guard.', synergy: 'Momentum: starts each battle with a one-hit combo.' },
  geomancer: { name: 'Geomancer', role: 'terrain shaper', description: 'A deliberate controller who turns hazardous ground into a weapon.', damage: 0, maxHp: 1, range: 1, move: -1, movementStyle: 'Stone step · 2 hexes', attackType: 'Terrain ranged', attackStyle: 'Fault strike · +1 damage beside bramble', ability: 'Faultline', abilityText: 'Strike for +1 damage and seed bramble beside the target.', synergy: 'Living Ground: heroes crossing bramble take no damage once per floor.' },
  conduit: { name: 'Conduit', role: 'chain caster', description: 'A measured ranged fighter whose hits arc into nearby enemies.', damage: 0, maxHp: 0, range: 1, move: 0, movementStyle: 'Measured step · 3 hexes', attackType: 'Chain ranged', attackStyle: 'Arc shot · basic hits chain 1 damage', ability: 'Resonant Chain', abilityText: 'Strike a target and echo 2 damage into the nearest enemy.', synergy: 'Resonance: status effects also trigger a small combat burst.' },
  riftblade: { name: 'Riftblade', role: 'phase skirmisher', description: 'A fragile, fast duelist who cuts through guard and appears beside distant prey.', damage: 0, maxHp: -2, range: 0, move: 2, movementStyle: 'Rift sprint · 5 hexes', attackType: 'Phase melee', attackStyle: 'Phase cut · bypasses 1 Guard', ability: 'Riftcut', abilityText: 'Blink beside a distant target and strike for +2 damage.', synergy: 'Rift rhythm: first move each round grants 1 Guard.' },
  stormcaller: { name: 'Stormcaller', role: 'storm artillery', description: 'A slow, far-reaching caster whose strikes jump across a packed enemy line.', damage: 0, maxHp: -1, range: 2, move: -1, movementStyle: 'Gathering step · 2 hexes', attackType: 'Storm ranged', attackStyle: 'Static lance · arcs 1 damage to a nearby foe', ability: 'Thunderclap', abilityText: 'Strike for +1 damage, then hit up to two nearby enemies for 2.', synergy: 'Storm front: chained strikes add 1 party Guard.' },
  soulweaver: { name: 'Soulweaver', role: 'vitality support', description: 'A resilient healer who steals a little life with each hit and mends the whole party.', damage: -1, maxHp: 1, range: 1, move: 0, movementStyle: 'Flowing step · 3 hexes', attackType: 'Siphon ranged', attackStyle: 'Life thread · hits heal the most wounded ally for 1', ability: 'Lifeline', abilityText: 'Heal the most wounded ally by 3 and grant nearby allies 2 Guard.', synergy: 'Shared pulse: the first heal each round also cleanses Burn.' }
};
const DEFAULT_PARTY = ['warden', 'emberling', 'wayfarer'];
const STARTER_MAIN_CLASSES = ['warden', 'vanguard', 'arcanist'];
const STARTER_COMPANIONS = ['emberling', 'wayfarer'];
const COMPANION_RECRUIT_COSTS = { emberling: 0, wayfarer: 0, cinderjaw: 8, ashcap: 9, stitchmoth: 10, paleScribe: 11, rootbound: 12, bellguard: 13, glassjack: 9, rifthound: 10, lanternmote: 11, sootscribe: 12, cinderwake: 13, veilmender: 14, gravebastion: 15, oathroot: 16, knifewisp: 14, ruinpike: 15, moonquill: 16 };
const COMPANION_SYNERGIES = [
  { id: 'ashen-reprieve', pair: ['cinderwake', 'veilmender'], name: 'Ashen Reprieve', trait: 'Burning attacks mend the most wounded ally for 1 HP once per round.', effect: '+1 recovery on Burn', accent: '#e46f45' },
  { id: 'rooted-citadel', pair: ['gravebastion', 'oathroot'], name: 'Rooted Citadel', trait: 'Both guardians begin with +1 Guard and +2 maximum HP.', effect: '+2 max HP · +1 Guard', accent: '#d5b56c' },
  { id: 'moonlit-ambush', pair: ['knifewisp', 'moonquill'], name: 'Moonlit Ambush', trait: 'The first attack each round by either partner gains +1 damage and +10% critical chance.', effect: 'Opening hit · +1 DMG · +10% crit', accent: '#b394ff' },
  { id: 'veiled-citadel', pair: ['veilmender', 'gravebastion'], name: 'Veiled Citadel', trait: 'Veilmender’s healing also grants the restored ally +1 Guard; Gravebastion gains +1 range for support actions.', effect: '+1 Guard on heal · +1 support range', accent: '#82d8b4' },
  { id: 'iron-and-ember', pair: ['cinderwake', 'ruinpike'], name: 'Iron & Ember', trait: 'Cinderwake and Ruinpike gain +1 damage against enemies already carrying a status.', effect: '+1 status-target damage', accent: '#ef9b67' },
  { id: 'three-point-ward', pair: ['wayfarer', 'knifewisp', 'moonquill'], name: 'Three-Point Ward', trait: 'The party’s first ranged hit each round gains +1 Guard for its attacker.', effect: '+1 Guard on ranged opener', accent: '#72dcf0' },
  { id: 'smoke-and-spark', pair: ['cinderjaw', 'ashcap'], name: 'Smoke & Spark', trait: 'Cinderjaw and Ashcap gain +1 damage when both are deployed.', effect: '+1 partner damage', accent: '#d783ff' },
  { id: 'mended-bulwark', pair: ['stitchmoth', 'rootbound', 'bellguard'], name: 'Mended Bulwark', trait: 'These three ward-makers gain +1 maximum health and +1 starting Guard.', effect: '+1 max HP · +1 Guard', accent: '#9eb86d' },
  { id: 'prism-rift', pair: ['glassjack', 'rifthound'], name: 'Prism Rift', trait: 'Glassjack and Rifthound gain +1 range and +1 movement when the prism opens.', effect: '+1 range · +1 movement', accent: '#7de3e5' },
  { id: 'lantern-archive', pair: ['paleScribe', 'lanternmote', 'sootscribe'], name: 'Lantern Archive', trait: 'The archive trio gains +1 range and their first signature ability each room costs no extra positioning.', effect: '+1 range · signature tempo', accent: '#ffe18d' }
];
const CLASS_SIGNATURE_KEYS = ['warden', 'vanguard', 'arcanist', 'scout', 'duelist', 'geomancer', 'conduit', 'riftblade', 'stormcaller', 'soulweaver', 'emberling', 'wayfarer', 'cinderjaw', 'ashcap', 'stitchmoth', 'paleScribe', 'rootbound', 'bellguard', 'glassjack', 'rifthound', 'lanternmote', 'sootscribe', 'cinderwake', 'veilmender', 'gravebastion', 'oathroot', 'knifewisp', 'ruinpike', 'moonquill'];
const CLASS_AUDIO_PROFILES = {
  warden: [196, 293.66, 'triangle', 900, -5], vanguard: [146.83, 220, 'square', 700, -8], arcanist: [329.63, 659.25, 'sawtooth', 2800, 8], scout: [440, 880, 'square', 3000, 12], duelist: [392, 783.99, 'triangle', 3300, -12], geomancer: [130.81, 196, 'triangle', 700, -4], conduit: [261.63, 523.25, 'sine', 2500, 6], riftblade: [233.08, 466.16, 'sawtooth', 2400, 15], stormcaller: [174.61, 349.23, 'sawtooth', 1800, -9], soulweaver: [220, 329.63, 'sine', 1900, 4],
  emberling: [329.63, 523.25, 'sawtooth', 3200, 8], wayfarer: [440, 659.25, 'square', 3600, 12], cinderjaw: [246.94, 369.99, 'sawtooth', 2600, -10], ashcap: [277.18, 554.37, 'sine', 3800, 14], stitchmoth: [311.13, 466.16, 'triangle', 2800, -6], paleScribe: [185, 370, 'sine', 2200, 5], rootbound: [110, 164.81, 'triangle', 600, -8], bellguard: [164.81, 246.94, 'square', 1100, 3], glassjack: [369.99, 739.99, 'sine', 4200, 17], rifthound: [207.65, 415.3, 'sawtooth', 2100, -15], lanternmote: [523.25, 1046.5, 'sine', 4800, 9], sootscribe: [155.56, 233.08, 'square', 1000, -3], cinderwake: [277.18, 554.37, 'sawtooth', 3400, 11], veilmender: [246.94, 493.88, 'sine', 3200, -7], gravebastion: [123.47, 185, 'square', 620, -6], oathroot: [98, 146.83, 'triangle', 520, 5], knifewisp: [587.33, 1174.66, 'sawtooth', 4400, 18], ruinpike: [138.59, 277.18, 'square', 1500, -11], moonquill: [466.16, 932.33, 'sine', 5000, 13]
};
function classAudioPattern(kind) {
  const profile = CLASS_AUDIO_PROFILES[kind];
  if (!profile) return null;
  const [low, high, type, filter, detune] = profile;
  return [[low, 0, .09, type, filter, detune], [high, .065, .16, type === 'square' ? 'triangle' : type, filter + 700, -detune], [high * 1.5, .13, .11, 'sine', filter + 1100, detune / 2]];
}
const CLASS_PROMOTION_COSTS = [0, 30, 45, 60, 80];
const CLASS_MAX_LEVEL = 5;
const CORE_MAX_LEVEL = 3;
const CORE_UPGRADE_COSTS = [10, 18, 28];
const CORE_UPGRADE_REWARDS = ['+1 main-class maximum health', '+1 main-class damage', '+1 main-class range and movement'];
const CLASS_TREE_UPGRADES = [
  { suffix: 'tempered-sigil', name: 'Tempered Sigil', effect: '+1 maximum health', description: 'Harden this selected Main Class against the dungeon’s opening pressure.', cost: 12, stat: 'maxHp', prerequisites: [] },
  { suffix: 'sharpened-instinct', name: 'Sharpened Instinct', effect: '+1 base damage', description: 'Teach this selected Main Class to convert safe openings into reliable damage.', cost: 18, stat: 'damage', prerequisites: [] },
  { suffix: 'far-reach', name: 'Far Reach', effect: '+1 attack range', description: 'Extend this selected Main Class’s threat line by one hex.', cost: 20, stat: 'range', prerequisites: ['sharpened-instinct'] },
  { suffix: 'quickstep', name: 'Quickstep', effect: '+1 movement', description: 'Give this selected Main Class one more movement point each round.', cost: 16, stat: 'move', prerequisites: ['far-reach'] },
  { suffix: 'iron-will', name: 'Iron Will', effect: '+1 starting Guard', description: 'Let this selected Main Class begin every room with a deeper ward.', cost: 18, stat: 'guard', prerequisites: ['tempered-sigil'] },
  { suffix: 'focused-core', name: 'Focused Core', effect: '+1 maximum health', description: 'Compress the class sigil into a second layer of permanent resilience.', cost: 22, stat: 'maxHp', prerequisites: ['iron-will'] }
];
function classTreeNodes(classId) { return CLASS_TREE_UPGRADES.map(node => ({ ...node, id: `class-${classId}-${node.suffix}`, classId })); }
function classNodeOwned(classId, suffix) { return Boolean(state.meta.classNodes?.[classId]?.includes(suffix)); }
function classTreeStats(classId) {
  return CLASS_TREE_UPGRADES.reduce((stats, node) => { if (classNodeOwned(classId, node.suffix)) stats[node.stat] += 1; return stats; }, { maxHp: 0, damage: 0, range: 0, move: 0, guard: 0 });
}
const BIG_BAD_TITLES = ['The First Wound', 'The Sable Regent', 'The Hollow Crown', 'The Glass Emperor', 'The Root Below', 'The Last Bell', 'The Ember Monarch', 'The Unmaking Tide', 'The Ashen Mother', 'Worldbreaker'];
const PRESTIGE_ROMANS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
function prestigeLevelForFloor(floor) { return Math.max(0, Math.min(MAX_PRESTIGE, Math.floor((Math.min(MAX_FLOOR, Math.max(1, Number(floor) || 1)) - 1) / 100))); }
function difficultyTierForFloor(floor) { return Math.floor(prestigeLevelForFloor(floor) / 2); }
function partySizeForFloor(floor) { return Math.min(MAX_TEAM_SIZE, BASE_TEAM_SIZE + difficultyTierForFloor(floor)); }
function prestigeLabelForFloor(floor) { const prestige = prestigeLevelForFloor(floor); return prestige ? `PRESTIGE ${PRESTIGE_ROMANS[prestige]}` : 'STANDARD DESCENT'; }
function boardDimensionsForFloor(floor) { const prestige = prestigeLevelForFloor(floor); return { cols: 9 + prestige, rows: 7 + Math.floor(prestige / 2) }; }
function enemyCountForFloor(floor) { const base = floor >= 6 ? 5 : floor >= 4 ? 4 : 3; return Math.min(12, base + difficultyTierForFloor(floor)); }
function hazardCountForFloor(floor) { const base = floor >= 8 ? 5 : 1 + Math.floor(floor / 2); return Math.min(13, base + difficultyTierForFloor(floor) * 2); }
const BOSS_DEFS = {
  ashcolossus: { name: 'Ash Colossus', role: 'boss / quake engine', icon: 'AC', maxHp: 22, hp: 22, damage: 3, range: 1, move: 1, description: 'Every second turn the Colossus fractures the floor with a room-wide quake.', color: 'crimson' },
  bellwidow: { name: 'Bell Widow', role: 'boss / brood caller', icon: 'BW', maxHp: 18, hp: 18, damage: 2, range: 3, move: 2, description: 'The Widow rings a summons into existence and webs the safest tile.', color: 'crimson' }
};
const SUB_BOSS_DEFS = {
  riftstalker: { name: 'Rift Stalker Alpha', description: 'A reinforced rift hunter blinks into the party and punishes isolated heroes.' },
  mossoracle: { name: 'Moss Oracle Prime', description: 'A reinforced oracle marks a hero; the next enemy hit against them deals extra damage.' }
};
function bigBadNameForFloor(floor, bossKey) { const title = BIG_BAD_TITLES[Math.max(0, Math.min(BIG_BAD_TITLES.length - 1, Math.floor(floor / 100) - 1))]; return `${BOSS_DEFS[bossKey]?.name || 'The Deep Warden'} · ${title}`; }
function roomTypeFor(floor) { return Number(floor) % 100 === 0 ? 'big-boss' : Number(floor) % 10 === 0 ? 'boss' : Number(floor) % 5 === 0 ? 'sub-boss' : 'regular'; }
function roomTypeLabel(floor) { const type = roomTypeFor(floor); return type === 'big-boss' ? 'BIG BAD BOSS ROOM' : type === 'boss' ? 'BOSS ROOM' : type === 'sub-boss' ? 'SUB-BOSS ROOM' : 'PROCEDURAL ROOM'; }
function marketOpensAfterRoom(floor) { return Number(floor) > 0 && Number(floor) % 2 === 0; }
function marketAvailableForRoom(floor) { return marketOpensAfterRoom(floor) && Number(state.expedition.marketClaimedRoom || 0) < Number(floor); }
function normalizePartyFormation(party, coreClass, unlocked, slots = BASE_TEAM_SIZE, companionUnlocked = STARTER_COMPANIONS) {
  const recruitable = [...new Set((Array.isArray(companionUnlocked) ? companionUnlocked : STARTER_COMPANIONS).filter(id => Object.hasOwn(HERO_DEFS, id) && id !== 'warden'))];
  const savedCompanions = Array.isArray(party) ? (party[0] === 'warden' ? party.slice(1) : party) : [];
  const chosen = [];
  for (const id of savedCompanions) if (recruitable.includes(id) && chosen.length < slots - 1) chosen.push(id);
  const fallbacks = [...recruitable, ...DEFAULT_PARTY.slice(1).filter(id => recruitable.includes(id))];
  let fallbackIndex = 0;
  while (chosen.length < slots - 1) chosen.push(fallbacks[fallbackIndex++ % fallbacks.length] || 'emberling');
  return ['warden', ...chosen.slice(0, slots - 1)];
}

const state = loadState() || freshState();
normalizeState(state);
document.documentElement.dataset.reducedMotion = String(Boolean(state.settings.reducedMotion));
let selectedUnitId = state.screen === 'battle' && state.battle
  ? (state.battle.heroes?.find(hero => hero.alive && !hero.acted)?.id || state.battle.heroes?.find(hero => hero.alive)?.id || null)
  : null;
let actionMode = null;
let pendingMove = false;
let settingsOpen = false;
let helpOpen = false;
let actionPulseId = null;
let audioContext = null;
let audioBus = null;
let audioCompressor = null;
let musicBus = null;
let musicAnalyser = null;
let musicTimer = null;
let musicStep = 0;
let ambientBus = null;
let ambientSource = null;
let ambientFilter = null;
let ambientTimer = null;
let trophyPreviewBus = null;
let trophyPreviewTimer = null;
let trophyPreviewLastCue = 0;
let visualizerFrame = null;
let metaTreeFrame = null;
let visualizerPulse = 0;
let combatFxQueue = [];
let combatFxId = 0;
let movementTrails = [];
let hapticTimer = null;
let lastHapticAt = 0;
function haptic(kind = 'tap') {
  if (!state.settings?.touchHaptics) return;
  const patterns = { tap: 8, move: [8, 22, 8], hit: [14, 24, 26], warning: [34, 28, 34], victory: [12, 34, 12, 34, 26] };
  const now = Date.now();
  if (kind !== 'warning' && now - lastHapticAt < 55) return;
  lastHapticAt = now;
  try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(patterns[kind] || patterns.tap); } catch (_) {}
  if (!app) return;
  app.dataset.haptic = kind;
  app.classList.remove('haptic-feedback');
  void app.offsetWidth;
  app.classList.add('haptic-feedback');
  window.clearTimeout(hapticTimer);
  hapticTimer = window.setTimeout(() => app.classList.remove('haptic-feedback'), 260);
}

function freshState(meta = null) {
  return {
    version: 1,
    screen: 'expedition',
    expedition: { floor: 1, runComplete: false, seed: makeRunSeed(), completed: [], emberShards: 0, relics: [], relicLevels: {}, marketStock: [], marketBought: [], marketVisit: 0, marketClaimedRoom: 0, lastReward: null },
    meta: meta || { shards: 0, unlocked: [...STARTER_MAIN_CLASSES.slice(1)], startingClass: 'warden', coreLevels: {}, classNodes: {}, companionUnlocked: [...STARTER_COMPANIONS], party: [...DEFAULT_PARTY], classXP: {}, classLevels: {} },
    history: [],
    achievements: { earned: [], showcase: [] },
    battle: null,
    settings: { reducedMotion: false, sound: true, soundMuted: false, masterVolume: 0.55, battleMusic: true, battleMusicMuted: false, battleMusicVolume: 0.28, colorAssist: false, touchHaptics: true },
    updatedAt: new Date().toISOString()
  };
}

function makeRunSeed() { return Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase().padStart(8, '0'); }

function normalizeState(current) {
  current.expedition ||= {};
  current.expedition.runComplete = Boolean(current.expedition.runComplete);
  current.expedition.floor = current.expedition.runComplete ? MAX_FLOOR + 1 : Math.min(MAX_FLOOR, Math.max(1, Math.floor(Number(current.expedition.floor || 1))));
  current.expedition.seed ||= makeRunSeed();
  current.expedition.completed ||= [];
  current.expedition.emberShards ||= 0;
  current.expedition.relics ||= [];
  if (!Array.isArray(current.expedition.relics)) current.expedition.relics = [];
  current.expedition.relics = [...new Set(current.expedition.relics.filter(id => typeof id === 'string'))];
  if (!current.expedition.relicLevels || typeof current.expedition.relicLevels !== 'object' || Array.isArray(current.expedition.relicLevels)) current.expedition.relicLevels = {};
  current.expedition.relics.forEach(id => { if (!Number(current.expedition.relicLevels[id])) current.expedition.relicLevels[id] = 1; });
  Object.entries(current.expedition.relicLevels).forEach(([id, level]) => {
    const numericLevel = Math.floor(Number(level) || 0);
    if (numericLevel > 0) {
      current.expedition.relicLevels[id] = Math.min(numericLevel, RELICS[id]?.maxLevel || 1);
      if (!current.expedition.relics.includes(id)) current.expedition.relics.push(id);
    } else delete current.expedition.relicLevels[id];
  });
  if (!Array.isArray(current.expedition.marketStock)) current.expedition.marketStock = [];
  if (!Array.isArray(current.expedition.marketBought)) current.expedition.marketBought = [];
  current.expedition.marketVisit = Math.max(0, Number(current.expedition.marketVisit || 0));
  current.expedition.marketClaimedRoom = Math.max(0, Number(current.expedition.marketClaimedRoom || 0));
  current.expedition.lastReward ||= null;
  current.meta ||= {};
  current.meta.shards = Math.max(0, Number(current.meta.shards) || 0);
  current.meta.unlocked = Array.isArray(current.meta.unlocked) ? current.meta.unlocked : [];
  STARTER_MAIN_CLASSES.slice(1).forEach(id => { if (!current.meta.unlocked.includes(id)) current.meta.unlocked.push(id); });
  current.meta.startingClass = STARTING_CLASSES[current.meta.startingClass] ? current.meta.startingClass : 'warden';
  current.meta.companionUnlocked = Array.isArray(current.meta.companionUnlocked) ? current.meta.companionUnlocked : [...STARTER_COMPANIONS];
  current.meta.companionUnlocked = [...new Set(current.meta.companionUnlocked.filter(id => Object.hasOwn(HERO_DEFS, id) && id !== 'warden'))];
  STARTER_COMPANIONS.forEach(id => { if (!current.meta.companionUnlocked.includes(id)) current.meta.companionUnlocked.push(id); });
  const legacyCoreLevel = Object.prototype.hasOwnProperty.call(current.meta, 'coreLevel')
    ? Number(current.meta.coreLevel) || 0
    : Math.max(0, (Number(current.meta.classLevels?.[current.meta.startingClass]) || 1) - 1);
  if (!current.meta.coreLevels || typeof current.meta.coreLevels !== 'object' || Array.isArray(current.meta.coreLevels)) {
    current.meta.coreLevels = {};
    if (legacyCoreLevel > 0) current.meta.coreLevels[current.meta.startingClass] = legacyCoreLevel;
  }
  for (const classId of Object.keys(STARTING_CLASSES)) current.meta.coreLevels[classId] = Math.max(0, Math.min(CORE_MAX_LEVEL, Math.floor(Number(current.meta.coreLevels[classId]) || 0)));
  if (!current.meta.classNodes || typeof current.meta.classNodes !== 'object' || Array.isArray(current.meta.classNodes)) current.meta.classNodes = {};
  for (const classId of Object.keys(STARTING_CLASSES)) current.meta.classNodes[classId] = [...new Set((Array.isArray(current.meta.classNodes[classId]) ? current.meta.classNodes[classId] : []).filter(suffix => CLASS_TREE_UPGRADES.some(node => node.suffix === suffix)))];
  delete current.meta.coreLevel;
  if (!Array.isArray(current.meta.party)) current.meta.party = [...DEFAULT_PARTY];
  current.meta.party = normalizePartyFormation(current.meta.party, current.meta.startingClass, current.meta.unlocked, partySizeForFloor(current.expedition.floor), current.meta.companionUnlocked);
  const playableKinds = new Set([...Object.keys(HERO_DEFS), ...Object.keys(STARTING_CLASSES)]);
  if (!current.meta.classXP || typeof current.meta.classXP !== 'object' || Array.isArray(current.meta.classXP)) current.meta.classXP = {};
  if (!current.meta.classLevels || typeof current.meta.classLevels !== 'object' || Array.isArray(current.meta.classLevels)) current.meta.classLevels = {};
  for (const kind of playableKinds) {
    current.meta.classXP[kind] = Math.max(0, Number(current.meta.classXP[kind]) || 0);
    current.meta.classLevels[kind] = Math.max(1, Math.min(CLASS_MAX_LEVEL, Number(current.meta.classLevels[kind]) || 1));
  }
  delete current.challenge;
  if (current.battle?.challenge) { current.battle.floor = current.expedition.floor; current.battle.maxRounds = MAX_ROUNDS; delete current.battle.challenge; }
  current.history ||= [];
  if (!Array.isArray(current.history)) current.history = [];
  current.history.forEach(record => { if (record && typeof record === 'object') { delete record.daily; delete record.challenge; } });
  if (current.battle) {
    current.battle.floor = Math.max(1, Number(current.battle.floor || current.expedition.floor));
    current.battle.roomType ||= roomTypeFor(current.battle.floor);
    current.battle.board = boardDimensionsForFloor(current.battle.floor);
    if (current.battle.roomType === 'big-boss') current.battle.maxRounds = BIG_BAD_ROUNDS;
  }
  current.achievements ||= { earned: [], showcase: [] };
  current.achievements.earned ||= [];
  current.achievements.showcase ||= [];
  current.settings = { ...freshState().settings, ...(current.settings || {}) };
}

function seededRandom(seed) {
  let value = 0;
  for (let i = 0; i < String(seed).length; i += 1) value = (value * 31 + String(seed).charCodeAt(i)) >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(BACKUP_KEY) || localStorage.getItem(LEGACY_SAVE_KEY) || localStorage.getItem(LEGACY_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !parsed.expedition) return null;
    return parsed;
  } catch (error) {
    console.warn('Hexfall save could not be read', error);
    return null;
  }
}

function persist(message = 'Local save written') {
  state.updatedAt = new Date().toISOString();
  const serialized = JSON.stringify(state);
  try {
    localStorage.setItem(BACKUP_KEY, serialized);
    localStorage.setItem(SAVE_KEY, serialized);
    saveStateEl.innerHTML = '<i class="status-dot"></i> WARD SAVE READY';
    if (message) toast(message);
  } catch (error) {
    saveStateEl.innerHTML = '<i class="status-dot" style="background:var(--crimson)"></i> SAVE BLOCKED';
    toast('The browser blocked local storage.', true);
  }
}

function toast(message, accent = false) {
  const el = document.createElement('div');
  el.className = `toast${accent ? ' accent' : ''}`;
  el.textContent = message;
  toastRegion.appendChild(el);
  window.setTimeout(() => el.remove(), 2600);
}

function relicLevel(id) {
  const savedLevel = Number(state.expedition.relicLevels?.[id]);
  if (Number.isFinite(savedLevel) && savedLevel > 0) return Math.floor(savedLevel);
  return state.expedition.relics?.includes(id) ? 1 : 0;
}
function hasRelic(id) { return relicLevel(id) > 0; }
function partyHasClass(id) {
  if (state.battle && !state.battle.outcome && Array.isArray(state.battle.heroes)) return state.battle.heroes.some(hero => unitClassId(hero) === id);
  return state.meta.party?.some(kind => kind === id || (kind === 'warden' && state.meta.startingClass === id)) || false;
}
function romanTier(level) { const index = Math.max(0, Math.min(3, Number(level) || 0)); return ['', 'I', 'II', 'III'][index] || ''; }
function relicPrice(id, currentLevel = relicLevel(id)) { return Math.ceil(RELICS[id].cost * (1 + currentLevel * .75)); }
function rollMarketStock() {
  const available = Object.entries(RELICS).filter(([id, relic]) => relicLevel(id) < relic.maxLevel).map(([id]) => id);
  for (let index = available.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [available[index], available[swap]] = [available[swap], available[index]];
  }
  const stock = available.slice(0, 8);
  const previous = state.expedition.marketStock || [];
  const sameSet = stock.length === previous.length && stock.every(id => previous.includes(id));
  if (sameSet && available.length > stock.length) {
    const replacement = available.find(id => !previous.includes(id));
    if (replacement) stock[stock.length - 1] = replacement;
  }
  return stock;
}
function openMarket() {
  const clearedRoom = state.battle?.floor || state.expedition.floor - 1;
  if (!marketAvailableForRoom(clearedRoom)) { toast('The relic market returns after every two cleared rooms.'); return; }
  state.expedition.marketClaimedRoom = clearedRoom;
  state.expedition.marketVisit = (state.expedition.marketVisit || 0) + 1;
  state.expedition.marketStock = rollMarketStock();
  state.expedition.marketBought = [];
  state.screen = 'shop';
  persist('The market stock has shifted');
  render();
}
function unitClassId(unit) {
  if (!unit) return 'warden';
  if (unit.kind === 'warden') return unit.startingClass || state.meta.startingClass || 'warden';
  return unit.kind;
}
function classLevel(id) { return Math.max(1, Math.min(CLASS_MAX_LEVEL, Number(state.meta.classLevels?.[id]) || 1)); }
function classPromotionCost(id) { return CLASS_PROMOTION_COSTS[classLevel(id)] || Infinity; }
function className(id) { return STARTING_CLASSES[id]?.name || HERO_DEFS[id]?.name || id; }
function mainClassStats(id) {
  const profile = STARTING_CLASSES[id] || STARTING_CLASSES.warden;
  const base = HERO_DEFS.warden;
  const tree = classTreeStats(id);
  return { hp: Math.max(1, base.maxHp + profile.maxHp + tree.maxHp), damage: Math.max(1, base.damage + profile.damage + tree.damage), range: Math.max(1, base.range + profile.range + tree.range), move: Math.max(1, base.move + profile.move + tree.move) };
}
function availablePartyKinds() {
  return [...new Set((state.meta.companionUnlocked || STARTER_COMPANIONS).filter(id => Object.hasOwn(HERO_DEFS, id) && id !== 'warden'))];
}
function companionPartyKinds() { return availablePartyKinds(); }

function activeCompanionSynergies(party = null) {
  const battleParty = state.battle && !state.battle.outcome ? state.battle.heroes : null;
  const kinds = party || (battleParty || state.meta.party || []).map(unit => typeof unit === 'string' ? unit : unit.kind);
  return COMPANION_SYNERGIES.filter(synergy => synergy.pair.every(kind => kinds.includes(kind)));
}
function companionSynergyFor(kind, party = null) {
  return activeCompanionSynergies(party).filter(synergy => synergy.pair.includes(kind));
}
function companionSynergyStats(kind) {
  const stats = { maxHp: 0, damage: 0, range: 0, move: 0, guard: 0 };
  companionSynergyFor(kind).forEach(synergy => {
    if (synergy.id === 'rooted-citadel') { stats.maxHp += 2; stats.guard += 1; }
    if (synergy.id === 'veiled-citadel' && kind === 'gravebastion') { stats.range += 1; }
    if (synergy.id === 'smoke-and-spark') { stats.damage += 1; }
    if (synergy.id === 'mended-bulwark') { stats.maxHp += 1; stats.guard += 1; }
    if (synergy.id === 'prism-rift') { stats.range += 1; stats.move += 1; }
    if (synergy.id === 'lantern-archive') { stats.range += 1; }
  });
  return stats;
}
function companionSynergySummary(party = null) {
  return activeCompanionSynergies(party).map(synergy => `${synergy.name} · ${synergy.effect}`);
}
function emitClassFx(unit, mode = 'strike') {
  const classKey = unit?.side === 'ally' ? unitClassId(unit) : null;
  if (!unit || !classKey || !CLASS_SIGNATURE_KEYS.includes(classKey) || !state.battle) return;
  combatFxQueue.push({ id: combatFxId += 1, targetId: unit.id, text: '', tone: 'class-signature', burst: false, shake: false, critical: false, scale: 1, visualKind: classKey, visualMode: mode });
}
function coreClassId() { return state.meta.startingClass || 'warden'; }
function coreLevelFor(classId = coreClassId()) { return Math.max(0, Math.min(CORE_MAX_LEVEL, Number(state.meta.coreLevels?.[classId]) || 0)); }
function coreUnitKind() { return 'warden'; }
function setPartySlot(index, kind) {
  const party = [...state.meta.party];
  if (!Number.isInteger(index) || index <= 0 || index >= party.length) return toast('The Main Class slot is fixed. Choose a different leader in the Meta Tree.', true);
  if (!companionPartyKinds().includes(kind)) return;
  party[index] = kind;
  state.meta.party = ['warden', ...party.slice(1).filter(kind => companionPartyKinds().includes(kind))];
  persist('Companion formation saved');
  render();
}
function canChangeBattleFormation() {
  return Boolean(state.battle && state.battle.phase === 'plan' && state.battle.round === 1 && state.battle.heroes?.every(hero => !hero.moved && !hero.acted) && !state.battle.formationLocked);
}
function changeBattleCompanion(index, kind) {
  if (!canChangeBattleFormation() || !Number.isInteger(index) || index <= 0 || index >= state.meta.party.length || !companionPartyKinds().includes(kind)) return;
  const party = [...state.meta.party];
  party[index] = kind;
  state.meta.party = ['warden', ...party.slice(1).filter(kind => companionPartyKinds().includes(kind))];
  state.battle = createBattle();
  selectedUnitId = state.battle.heroes[0]?.id || null;
  actionMode = null;
  persist('Deployment updated before the first move');
  render();
}
function upgradeCoreClass() {
  const classId = coreClassId();
  const level = coreLevelFor(classId);
  if (level >= CORE_MAX_LEVEL) return;
  const cost = CORE_UPGRADE_COSTS[level];
  if (state.meta.shards < cost) return toast(`Need ${cost - state.meta.shards} more meta-shards.`, true);
  state.meta.shards -= cost;
  state.meta.coreLevels[classId] = level + 1;
  persist(`${className(classId)} main-class mastery increased to ${level + 1}`);
  render();
}
function upgradeClass(id) {
  if (id === coreClassId()) return toast('Your main class is upgraded with Meta-shards in the Meta Tree.', true);
  const level = classLevel(id);
  const cost = classPromotionCost(id);
  if (!Number.isFinite(cost) || (state.meta.classXP[id] || 0) < cost) return;
  state.meta.classXP[id] -= cost;
  state.meta.classLevels[id] = level + 1;
  persist(`${className(id)} promoted to level ${level + 1}`);
  render();
}
function awardPartyClassXP(outcome) {
  const award = outcome === 'victory' ? 20 : 10;
  const participating = new Set((state.battle?.heroes || []).map(unitClassId));
  participating.forEach(id => { if (id !== coreClassId()) state.meta.classXP[id] = (state.meta.classXP[id] || 0) + award; });
}
function unlockClassesForFloor(floor) {
  const newlyUnlocked = []; // Main Classes are unlocked only through Meta Tree purchases.
  if (!newlyUnlocked.length) return;
  state.meta.unlocked.push(...newlyUnlocked);
  newlyUnlocked.forEach(id => toast(`${className(id)} unlocked as a Main Class and companion.`, true));
}
function hasMetaSynergy(id) {
  const synergy = META_SYNERGIES.find(item => item.id === id);
  return Boolean(synergy && synergy.nodes.every(node => state.meta.unlocked.includes(node)));
}
function activeMetaSynergies() { return META_SYNERGIES.filter(synergy => hasMetaSynergy(synergy.id)); }
function evaluateAchievements() {
  state.achievements ||= { earned: [] };
  state.achievements.earned ||= [];
  const newlyEarned = ACHIEVEMENTS.filter(achievement => !state.achievements.earned.includes(achievement.id) && achievement.condition());
  newlyEarned.forEach(achievement => state.achievements.earned.push(achievement.id));
  newlyEarned.forEach(achievement => {
    toast(`Badge earned: ${achievement.name}`, true);
    if (achievement.id.includes('forged') || achievement.id === 'legendary-triad') celebrateLegendaryBadge(achievement);
  });
  return newlyEarned;
}

function celebrateLegendaryBadge(achievement) {
  const context = getAudioContext();
  if (context && state.settings.sound && !state.settings.soundMuted) {
    const now = context.currentTime + .02;
    [261.63, 392, 523.25, 783.99].forEach((frequency, index) => playTone(context, frequency, now + index * .09, .34, index === 3 ? 'triangle' : 'sine', .06, 2400, index % 2 ? 4 : -4));
  }
  const celebration = document.createElement('div');
  celebration.className = 'achievement-celebration';
  celebration.innerHTML = `<div class="achievement-celebration-core"><span>${svgIcon('legendary')}</span><strong>${achievement.name}</strong><small>LEGENDARY BADGE AWAKENED</small></div><div class="achievement-particles"></div>`;
  const particleLayer = celebration.querySelector('.achievement-particles');
  for (let index = 0; index < 28; index += 1) {
    const particle = document.createElement('i');
    particle.style.setProperty('--angle', `${(index / 28) * 360}deg`);
    particle.style.setProperty('--distance', `${48 + (index % 5) * 18}px`);
    particle.style.setProperty('--delay', `${(index % 7) * 25}ms`);
    particleLayer.appendChild(particle);
  }
  document.body.appendChild(celebration);
  window.setTimeout(() => celebration.remove(), 2100);
}

function toggleShowcase(id) {
  if (!state.achievements.earned.includes(id)) return;
  const showcase = state.achievements.showcase;
  const index = showcase.indexOf(id);
  if (index >= 0) showcase.splice(index, 1);
  else if (showcase.length < 6) showcase.push(id);
  else return toast('The trophy room has six display plinths.', true);
  persist(index >= 0 ? 'Badge removed from trophy room' : 'Badge displayed in trophy room');
  render();
}

function startTrophyPreviewAudio(legendary = false) {
  stopTrophyPreviewAudio();
  const context = getAudioContext();
  if (!context || !state.settings.sound || state.settings.soundMuted) return;
  trophyPreviewBus = context.createGain();
  trophyPreviewBus.gain.setValueAtTime(.0001, context.currentTime);
  trophyPreviewBus.gain.exponentialRampToValueAtTime(Math.max(.012, Number(state.settings.masterVolume ?? .55) * (legendary ? .045 : .028)), context.currentTime + .35);
  trophyPreviewBus.connect(audioCompressor);
  const notes = legendary ? [130.81, 164.81, 196, 246.94, 196, 164.81] : [146.83, 174.61, 220, 174.61];
  let step = 0;
  const schedule = () => {
    if (!audioContext || !trophyPreviewBus) return;
    const now = audioContext.currentTime + .02;
    const note = notes[step % notes.length];
    playTone(context, note, now, .72, 'sine', legendary ? .34 : .22, 900, 0, trophyPreviewBus);
    if (legendary && step % 2 === 0) playTone(context, note * 2, now + .08, .42, 'triangle', .12, 1500, 4, trophyPreviewBus);
    step += 1;
  };
  schedule();
  trophyPreviewTimer = window.setInterval(schedule, 680);
}

function stopTrophyPreviewAudio() {
  if (trophyPreviewTimer) window.clearInterval(trophyPreviewTimer);
  trophyPreviewTimer = null;
  if (trophyPreviewBus && audioContext) {
    const bus = trophyPreviewBus;
    bus.gain.cancelScheduledValues(audioContext.currentTime);
    bus.gain.setTargetAtTime(.0001, audioContext.currentTime, .06);
    window.setTimeout(() => { try { bus.disconnect(); } catch (error) { /* already disconnected */ } }, 260);
  }
  trophyPreviewBus = null;
}

function playTrophyPreviewCue(kind = 'hover') {
  const context = getAudioContext();
  if (!context || !state.settings.sound || state.settings.soundMuted) return;
  const now = context.currentTime + .005;
  if (kind === 'open') {
    playTone(context, 261.63, now, .13, 'triangle', .045, 1800, 0);
    playTone(context, 392, now + .07, .2, 'sine', .035, 2100, 3);
  } else if (kind === 'close') {
    playTone(context, 392, now, .12, 'sine', .03, 1400, -3);
    playTone(context, 261.63, now + .07, .16, 'triangle', .025, 1000, 0);
  } else {
    playTone(context, 660, now, .055, 'sine', .018, 2600, 6);
  }
}

function openTrophyPreview(id) {
  const achievement = ACHIEVEMENTS.find(item => item.id === id);
  if (!achievement) return;
  const legendary = achievement.id.includes('forged') || achievement.id === 'legendary-triad';
  const overlay = document.createElement('div');
  overlay.className = `trophy-preview-backdrop ${legendary ? 'legendary' : ''}`;
  overlay.innerHTML = `<div class="trophy-preview-modal" role="dialog" aria-modal="true" aria-label="${achievement.name} badge preview"><button class="trophy-preview-close" data-preview-close aria-label="Close badge preview">×</button><div class="trophy-preview-stage"><div class="trophy-preview-badge"><span>${svgIcon(achievement.icon)}</span><i></i></div></div><div class="eyebrow">Trophy room / close inspection</div><h2>${achievement.name}</h2><p>${achievement.description}</p><small>Move your pointer to rotate · ambient audio follows the display.</small></div>`;
  document.body.appendChild(overlay);
  startTrophyPreviewAudio(legendary);
  playTrophyPreviewCue('open');
  const modal = overlay.querySelector('.trophy-preview-modal');
  const stage = overlay.querySelector('.trophy-preview-stage');
  stage.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 28;
    const rotateX = (((event.clientY - rect.top) / rect.height) - .5) * -24;
    modal.style.setProperty('--preview-rotate-x', `${rotateX.toFixed(2)}deg`);
    modal.style.setProperty('--preview-rotate-y', `${rotateY.toFixed(2)}deg`);
    if (performance.now() - trophyPreviewLastCue > 180) { trophyPreviewLastCue = performance.now(); playTrophyPreviewCue('hover'); }
  });
  stage.addEventListener('pointerleave', () => { modal.style.setProperty('--preview-rotate-x', '0deg'); modal.style.setProperty('--preview-rotate-y', '0deg'); });
  let closed = false;
  const close = () => { if (closed) return; closed = true; playTrophyPreviewCue('close'); stopTrophyPreviewAudio(); document.removeEventListener('keydown', onKey); overlay.remove(); };
  const onKey = event => { if (event.key === 'Escape') close(); };
  overlay.querySelector('[data-preview-close]').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
}

function cloneUnit(id, side, kind, pos, elite = null, floorOverride = null) {
  const def = side === 'ally' ? (HERO_DEFS[kind] || (STARTING_CLASSES[kind] ? HERO_DEFS.warden : null)) : (ENEMY_DEFS[kind] || BOSS_DEFS[kind]);
  const isHero = side === 'ally';
  const classKey = isHero ? (kind === 'warden' ? state.meta.startingClass || 'warden' : STARTING_CLASSES[kind] ? kind : kind) : 'warden';
  const startingClass = isHero ? STARTING_CLASSES[classKey] : null;
  const classTree = isHero ? classTreeStats(classKey) : { maxHp: 0, damage: 0, range: 0, move: 0, guard: 0 };
  const level = isHero ? (kind === 'warden' ? 1 : classLevel(classKey)) : 1;
  const isCore = isHero && kind === 'warden';
  const coreLevel = isCore ? coreLevelFor(classKey) : 0;
  const enemyDifficulty = isHero ? 0 : difficultyTierForFloor(floorOverride || state.battle?.floor || state.expedition.floor);
  const relicWard = isHero ? relicLevel('ward-thread') * 2 : 0;
  const classNameBonus = startingClass ? startingClass.name : def.name;
  const arcanistPresent = partyHasClass('arcanist');
  const synergyRange = isHero && arcanistPresent && kind === 'wayfarer' ? 1 : 0;
  const synergyDamage = isHero && arcanistPresent && kind === 'emberling' ? 1 : 0;
  const companionSynergy = isHero && kind !== 'warden' ? companionSynergyStats(kind) : { maxHp: 0, damage: 0, range: 0, move: 0, guard: 0 };
  const maxHp = Math.max(1, def.maxHp + companionSynergy.maxHp + relicWard + (isHero && hasRelic('colossus-heart') ? 4 : 0) + (startingClass?.maxHp || 0) + classTree.maxHp + (isHero && state.meta.unlocked.includes('field-rations') ? 1 : 0) + (isHero && state.meta.unlocked.includes('battlefield-cache') && !isCore ? 1 : 0) + (isHero && state.meta.unlocked.includes('iron-roots') ? 2 : 0) + (isHero && state.meta.unlocked.includes('legendary-worldroot') ? 3 : 0) + (isHero && level >= 2 ? 1 : 0) + (isCore && coreLevel >= 1 ? 1 : 0) + enemyDifficulty * 2);
  const damage = def.damage + companionSynergy.damage + (isHero ? relicLevel('ember-lens') : 0) + (isHero && state.meta.unlocked.includes('cinder-core') ? 1 : 0) + (isHero && state.meta.unlocked.includes('companion-oath') && !isCore ? 1 : 0) + (startingClass?.damage || 0) + classTree.damage + (isHero && level >= 3 ? 1 : 0) + (isCore && coreLevel >= 2 ? 1 : 0) + (isHero ? 0 : enemyDifficulty);
  const guard = isHero ? relicLevel('echo-charm') + companionSynergy.guard + (state.meta.unlocked.includes('ward-lattice') ? 1 : 0) + (state.meta.unlocked.includes('iron-vow') ? 1 : 0) + (hasMetaSynergy('molten-bastion') ? 1 : 0) + (isCore ? classTree.guard : 0) : 0;
  const range = def.range + (isHero && hasRelic('widow-eye') ? 1 : 0) + (isHero ? relicLevel('moon-glass') : 0) + (startingClass?.range || 0) + classTree.range + synergyRange + (isHero && level >= 5 ? 1 : 0) + (isCore && coreLevel >= 3 ? 1 : 0);
  const name = isHero ? classNameBonus : def.name;
  const role = isHero && startingClass ? startingClass.role : def.role;
  return { id, side, kind, name: elite ? `${elite.name} ${name}` : name, baseName: name, role, icon: def.icon, maxHp, hp: maxHp, damage: damage + synergyDamage, range, move: Math.max(1, def.move + (elite?.key === 'swift' ? 1 : 0) + (startingClass?.move || 0) + classTree.move + (isHero && state.meta.unlocked.includes('quickstep-archive') ? 1 : 0) + (isHero && state.meta.unlocked.includes('rallying-step') ? 1 : 0) + (isHero ? relicLevel('sable-compass') : 0) + (isHero && level >= 4 ? 1 : 0) + (isCore && coreLevel >= 3 ? 1 : 0)), x: pos.x, y: pos.y, guard: elite?.key === 'fortified' ? 3 : guard, status: [], moved: false, acted: false, abilityUsed: false, alive: true, startingClass: classKey, terrainWard: false, statusWardUsed: false, mirrorWardUsed: false, roundAttackUsed: false, elite: elite ? { key: elite.key, name: elite.name, description: elite.description } : null, bossKey: BOSS_DEFS[kind] ? kind : null };
}

function createBattle() {
  const floor = Math.min(MAX_FLOOR, state.expedition.floor);
  const prestige = prestigeLevelForFloor(floor);
  const difficultyTier = difficultyTierForFloor(floor);
  const partySize = partySizeForFloor(floor);
  const seed = state.expedition.seed;
  const roomType = roomTypeFor(floor);
  const isBigBadRoom = roomType === 'big-boss';
  const isBossRoom = isBigBadRoom || roomType === 'boss';
  const isSubBossRoom = roomType === 'sub-boss';
  const board = boardDimensionsForFloor(floor);
  const maxRounds = isBigBadRoom ? BIG_BAD_ROUNDS : MAX_ROUNDS;
  state.meta.party = normalizePartyFormation(state.meta.party, state.meta.startingClass, state.meta.unlocked, partySize, state.meta.companionUnlocked);
  const random = seededRandom(`${seed}:${floor}`);
  const heroPositions = deploymentPositions(partySize, board);
  const heroes = state.meta.party.slice(0, partySize).map((kind, index) => cloneUnit(`hero-${kind}-${index}`, 'ally', kind, heroPositions[index], null, floor));
  const bossKey = isBigBadRoom ? (Math.floor(floor / 100) % 2 === 0 ? 'bellwidow' : 'ashcolossus') : isBossRoom ? (floor % 20 === 0 ? 'bellwidow' : 'ashcolossus') : null;
  const subBossKey = isSubBossRoom ? (floor % 20 === 5 ? 'riftstalker' : 'mossoracle') : null;
  const enemyPool = floor >= 6 ? ['husk', 'wisp', 'rootmother', 'skitter', 'mireling', 'shade', 'riftstalker', 'mossoracle'] : floor >= 4 ? ['husk', 'wisp', 'rootmother', 'skitter', 'mireling', 'shade', 'riftstalker'] : floor >= 3 ? ['husk', 'wisp', 'rootmother', 'skitter', 'mireling'] : ['husk', 'wisp', 'rootmother'];
  const rollEnemies = count => Array.from({ length: count }, () => enemyPool[Math.floor(random() * enemyPool.length)]);
  const bossEscortCount = isBigBadRoom ? Math.min(8, 3 + difficultyTier) : 2 + difficultyTier;
  const enemyKinds = bossKey ? [bossKey, ...rollEnemies(bossEscortCount)] : subBossKey ? [subBossKey, ...rollEnemies(2 + difficultyTier)] : rollEnemies(enemyCountForFloor(floor));
  state.meta.party = normalizePartyFormation(state.meta.party, state.meta.startingClass, state.meta.unlocked, partySize, state.meta.companionUnlocked);
  const openCells = validCells(board).filter(cell => !heroes.some(hero => distance(hero, cell) < 3));
  const takeCell = () => openCells.splice(Math.floor(random() * openCells.length), 1)[0] || validCells(board).find(cell => !occupied(cell.x, cell.y)) || { x: board.cols - 2, y: Math.floor(board.rows / 2) };
  const traitKeys = Object.keys(ELITE_TRAITS);
  const bigBadName = isBigBadRoom ? bigBadNameForFloor(floor, bossKey) : null;
  const enemies = enemyKinds.map((kind, index) => {
    const isSubBoss = isSubBossRoom && index === 0;
    const eliteKey = !BOSS_DEFS[kind] && !isSubBoss && floor >= 2 && random() < Math.min(.78, .18 + Math.min(floor, 8) * .08 + difficultyTier * .025) ? traitKeys[Math.floor(random() * traitKeys.length)] : null;
    const trait = eliteKey ? { key: eliteKey, ...ELITE_TRAITS[eliteKey] } : null;
    const enemy = cloneUnit(`enemy-${kind}-${index}`, 'enemy', kind, takeCell(), trait, floor);
    if (isSubBoss) {
      const rank = difficultyTier;
      const identity = SUB_BOSS_DEFS[kind];
      enemy.name = identity.name;
      enemy.baseName = identity.name;
      enemy.role = 'sub-boss';
      enemy.subBoss = true;
      enemy.maxHp += 7 + rank * 3;
      enemy.hp = enemy.maxHp;
      enemy.damage += 1 + rank;
      enemy.guard += rank > 0 ? 1 : 0;
    }
    if (isBigBadRoom && index === 0) {
      enemy.name = bigBadName;
      enemy.baseName = bigBadName;
      enemy.role = 'big bad boss';
      enemy.bigBad = true;
      enemy.maxHp += 16 + prestige * 3 + difficultyTier * 8;
      enemy.hp = enemy.maxHp;
      enemy.damage += 2 + difficultyTier + Math.floor(prestige / 3);
      enemy.guard += Math.min(5, prestige);
    }
    return enemy;
  });
  const hazards = [{ x: Math.min(4, board.cols - 2), y: Math.min(1, board.rows - 1), type: 'objective' }];
  for (let i = 0; i < hazardCountForFloor(floor); i += 1) {
    const cell = takeCell();
    if (cell && !hazards.some(hazard => key(hazard.x, hazard.y) === key(cell.x, cell.y))) hazards.push({ ...cell, type: 'bramble' });
  }
  const subBoss = subBossKey ? { key: subBossKey, name: SUB_BOSS_DEFS[subBossKey].name, description: SUB_BOSS_DEFS[subBossKey].description } : null;
  const boss = bossKey ? { key: bossKey, relic: bossKey === 'ashcolossus' ? 'colossus-heart' : 'widow-eye', bigBad: isBigBadRoom, prestige, name: bigBadName || BOSS_DEFS[bossKey].name } : null;
  const objective = boss ? `Defeat ${boss.name} within ${maxRounds} rounds.` : subBoss ? `Defeat ${subBoss.name} within ${maxRounds} rounds; its escorts scatter when it falls.` : `Survive the procedural floor for ${maxRounds} rounds.`;
  const roomLog = boss ? `${boss.name} has claimed this room.` : subBoss ? `${subBoss.name} commands this sub-boss room.` : `${enemies.filter(enemy => enemy.elite).length} elite signatures detected.`;
  return { floor, seed, prestige, difficultyTier, roomType, board, round: 1, maxRounds, phase: 'plan', heroes, enemies, hazards, intents: {}, combo: { count: 0, multiplier: partyHasClass('duelist') || state.meta.unlocked.includes('combo-memory') ? 1.25 : 1 }, reviveUsed: false, boss, subBoss, log: [`Room ${floor} generated from seed ${seed}.`, roomLog], objective, formationLocked: false, outcome: null };
}

function startBattle() {
  if (state.expedition.runComplete || state.expedition.floor > MAX_FLOOR) return toast('This 1,000-floor expedition is complete. Start a new expedition to descend again.', true);
  state.meta.party = normalizePartyFormation(state.meta.party, state.meta.startingClass, state.meta.unlocked, partySizeForFloor(state.expedition.floor), state.meta.companionUnlocked);
  state.battle = createBattle();
  state.screen = 'battle';
  selectedUnitId = state.battle.heroes[0]?.id || null;
  actionMode = null;
  refreshIntents();
  persist('Expedition entered');
  render();
  ensureBattleMusic();
}


function getUnits() { return [...(state.battle?.heroes || []), ...(state.battle?.enemies || [])]; }
function getUnit(id) { return getUnits().find(unit => unit.id === id); }
function living(side) { return getUnits().filter(unit => unit.side === side && unit.alive); }
function key(x, y) { return `${x},${y}`; }
const BOARD_CELL_CACHE = new Map();
function currentBoardDimensions() { return state.battle?.board || boardDimensionsForFloor(state.expedition.floor); }
function boardCellData(board = currentBoardDimensions()) {
  const cols = Math.max(9, Number(board?.cols) || 9);
  const rows = Math.max(7, Number(board?.rows) || 7);
  const cacheKey = `${cols}x${rows}`;
  if (!BOARD_CELL_CACHE.has(cacheKey)) {
    const cells = [];
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const clipped = (y === 0 && x === 0) || (y === 1 && x === cols - 1) || (y === rows - 2 && x === 0) || (y === rows - 1 && x === cols - 1);
        if (!clipped) cells.push({ x, y });
      }
    }
    BOARD_CELL_CACHE.set(cacheKey, { cells, set: new Set(cells.map(cell => key(cell.x, cell.y))) });
  }
  return BOARD_CELL_CACHE.get(cacheKey);
}
function validCells(board = currentBoardDimensions()) { return boardCellData(board).cells; }
const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
function neighbors(cell) { const cellSet = boardCellData().set; return DIRECTIONS.map(([dx, dy]) => ({ x: cell.x + dx, y: cell.y + dy })).filter(c => cellSet.has(key(c.x, c.y))); }
function deploymentPositions(count, board = currentBoardDimensions()) {
  const middle = Math.floor(board.rows / 2);
  const candidates = [
    { x: 1, y: middle }, { x: 2, y: middle + 1 }, { x: 1, y: middle - 1 },
    { x: 2, y: middle + 2 }, { x: 1, y: middle - 2 }, { x: 3, y: middle }, { x: 2, y: middle - 1 },
    ...Array.from({ length: board.rows }, (_, index) => ({ x: 3, y: index }))
  ];
  const valid = boardCellData(board).set;
  const positions = [];
  for (const cell of candidates) if (positions.length < count && valid.has(key(cell.x, cell.y)) && !positions.some(pos => key(pos.x, pos.y) === key(cell.x, cell.y))) positions.push(cell);
  for (const cell of validCells(board)) if (positions.length < count && cell.x < Math.ceil(board.cols / 3) && !positions.some(pos => key(pos.x, pos.y) === key(cell.x, cell.y))) positions.push(cell);
  return positions.slice(0, count);
}
function distance(a, b) { return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs((a.x - a.y) - (b.x - b.y))); }
function occupied(x, y, exceptId = null) { return getUnits().some(unit => unit.alive && unit.id !== exceptId && unit.x === x && unit.y === y); }
function isHazard(x, y, type) { return state.battle.hazards.some(hazard => hazard.x === x && hazard.y === y && (!type || hazard.type === type)); }
function manhattan(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }

function reachable(unit) {
  const seen = new Map([[key(unit.x, unit.y), 0]]);
  const queue = [{ x: unit.x, y: unit.y }];
  while (queue.length) {
    const current = queue.shift();
    const cost = seen.get(key(current.x, current.y));
    if (cost >= unit.move) continue;
    neighbors(current).forEach(next => {
      const nextKey = key(next.x, next.y);
      const tileCost = isHazard(next.x, next.y, 'bramble') ? 2 : 1;
      if (!occupied(next.x, next.y, unit.id) && (!seen.has(nextKey) || seen.get(nextKey) > cost + tileCost) && cost + tileCost <= unit.move) {
        seen.set(nextKey, cost + tileCost);
        queue.push(next);
      }
    });
  }
  return [...seen.keys()].filter(item => item !== key(unit.x, unit.y)).map(item => { const [x, y] = item.split(',').map(Number); return { x, y }; });
}

function addLog(text) {
  state.battle.log.unshift(text);
  state.battle.log = state.battle.log.slice(0, 8);
}

function emitCombatFx(target, text, tone = 'damage', options = {}) {
  if (!target || !state.battle) return;
  if (options.shake !== false) playImpactCue(options.critical ? 'critical' : 'hit');
  combatFxQueue.push({
    id: combatFxId += 1,
    targetId: target.id,
    text,
    tone,
    burst: options.burst !== false,
    shake: options.shake !== false,
    critical: Boolean(options.critical),
    scale: Math.max(1, Number(options.scale || 1))
  });
}

function addStatus(target, status, sourceName = '') {
  if (!target?.status || target.status.includes(status)) return;
  if (target.side === 'ally' && ['burn', 'poison', 'bleeding'].includes(status) && hasRelic('moth-censer') && !target.statusWardUsed) {
    target.statusWardUsed = true;
    emitCombatFx(target, 'CENSER WARD', 'guard', { burst: false, shake: false });
    addLog(`${target.name}'s Moth Censer turns aside ${status}.`);
    return;
  }
  target.status.push(status);
  playStatusCue(status);
  emitCombatFx(target, status.toUpperCase(), 'status', { burst: false, shake: false });
  if (partyHasClass('conduit')) emitCombatFx(target, 'RESONANCE', 'cue', { shake: false });
  if (sourceName) addLog(`${sourceName} marks ${target.name} with ${status}.`);
}

function combatPoint(unit) {
  const board = document.querySelector('#battle-board');
  const layer = document.querySelector('#combat-fx');
  if (!board || !unit) return null;
  const rect = board.getBoundingClientRect();
  const layerRect = layer?.getBoundingClientRect() || rect;
  const point = svgPoint(unit);
  return { x: ((point.cx / 720) * rect.width) + (rect.left - layerRect.left), y: ((point.cy / 500) * rect.height) + (rect.top - layerRect.top) };
}

function spawnCombatFx(fx, delay = 0) {
  window.setTimeout(() => {
    const layer = document.querySelector('#combat-fx');
    const target = getUnit(fx.targetId);
    const point = combatPoint(target);
    if (!layer || !point) return;
    if (fx.visualKind) {
      const visual = document.createElement('div');
      visual.className = `companion-fx fx-${fx.visualKind} fx-${fx.visualMode || 'strike'}`;
      visual.setAttribute('aria-hidden', 'true');
      for (let index = 0; index < 10; index += 1) { const particle = document.createElement('i'); particle.style.setProperty('--fx-angle', `${index * 36}deg`); particle.style.setProperty('--fx-delay', `${index * 18}ms`); visual.appendChild(particle); }
      visual.style.left = `${point.x}px`; visual.style.top = `${point.y}px`; layer.appendChild(visual); window.setTimeout(() => visual.remove(), 900);
    }
    if (!fx.text) return;
    const text = document.createElement('div');
    text.className = `combat-float ${fx.tone}${fx.critical ? ' critical' : ''}`;
    text.textContent = fx.text;
    text.style.setProperty('--combo-scale', fx.scale);
    text.style.left = `${point.x}px`;
    text.style.top = `${point.y}px`;
    layer.appendChild(text);
    window.setTimeout(() => text.remove(), 1050);
    if (fx.burst && !state.settings.reducedMotion) {
      const burst = document.createElement('div');
      burst.className = `combat-burst ${fx.tone}${fx.critical ? ' critical' : ''}`;
      burst.style.left = `${point.x}px`;
      burst.style.top = `${point.y}px`;
      for (let i = 0; i < 8; i += 1) {
        const spark = document.createElement('i');
        spark.style.setProperty('--angle', `${i * 45}deg`);
        burst.appendChild(spark);
      }
      layer.appendChild(burst);
      window.setTimeout(() => burst.remove(), 620);
    }
    if (fx.shake && !state.settings.reducedMotion) {
      const boardPanel = document.querySelector('.board-panel');
      boardPanel?.classList.remove('combat-shake');
      void boardPanel?.offsetWidth;
      boardPanel?.classList.add('combat-shake');
      window.setTimeout(() => boardPanel?.classList.remove('combat-shake'), 360);
    }
  }, delay);
}

function flushCombatFx() {
  const queue = combatFxQueue;
  combatFxQueue = [];
  queue.forEach((fx, index) => spawnCombatFx(fx, index * 105));
}

function updateAudioBus() {
  if (!audioContext) return;
  if (audioBus) {
    const volume = state.settings.sound && !state.settings.soundMuted ? Math.max(0, Math.min(1, Number(state.settings.masterVolume ?? 0.55))) : 0;
    audioBus.gain.setTargetAtTime(volume, audioContext.currentTime, 0.018);
  }
  if (musicBus) {
    const battleHeat = state.screen === 'battle' && state.battle ? 1.35 : 1;
    const volume = state.settings.battleMusic !== false && !state.settings.battleMusicMuted ? Math.min(0.72, Math.max(0, Math.min(1, Number(state.settings.battleMusicVolume ?? 0.28))) * battleHeat) : 0;
    musicBus.gain.setTargetAtTime(volume, audioContext.currentTime, 0.035);
  }
  if (ambientBus) {
    const volume = state.screen === 'battle' && state.settings.battleMusic !== false && !state.settings.battleMusicMuted ? Math.min(.08, Math.max(0, Number(state.settings.battleMusicVolume ?? .28)) * .18) : 0;
    ambientBus.gain.setTargetAtTime(volume, audioContext.currentTime, 0.12);
  }
}

function getAudioContext() {
  const audioScreens = ['battle', 'meta', 'expedition', 'history', 'shop'];
  const audioEnabled = state.settings.sound || (audioScreens.includes(state.screen) && state.settings.battleMusic !== false);
  if (!audioEnabled || !('AudioContext' in window || 'webkitAudioContext' in window)) return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  audioContext ||= new AudioCtor();
  if (!audioCompressor) {
    audioCompressor = audioContext.createDynamicsCompressor();
    audioCompressor.threshold.value = -18;
    audioCompressor.knee.value = 12;
    audioCompressor.ratio.value = 4;
    audioCompressor.attack.value = 0.006;
    audioCompressor.release.value = 0.16;
    audioCompressor.connect(audioContext.destination);
  }
  if (!audioBus) {
    audioBus = audioContext.createGain();
    audioBus.connect(audioCompressor);
  }
  updateAudioBus();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playDungeonDrip(context) {
  if (!context || !ambientBus || state.screen !== 'battle' || state.settings.battleMusicMuted) return;
  const now = context.currentTime + .02;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(360 + (musicStep % 4) * 38, now);
  oscillator.frequency.exponentialRampToValueAtTime(190, now + .28);
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.045, now + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .34);
  oscillator.connect(filter).connect(gain).connect(ambientBus);
  oscillator.start(now);
  oscillator.stop(now + .36);
}

function ensureDungeonAmbience(context) {
  if (!context || state.screen !== 'battle' || state.settings.battleMusic === false || state.settings.battleMusicMuted) return;
  if (!ambientBus) {
    ambientBus = context.createGain();
    ambientFilter = context.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.value = 460;
    ambientFilter.Q.value = .7;
    ambientBus.connect(ambientFilter).connect(audioCompressor);
    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * .34;
    ambientSource = context.createBufferSource();
    ambientSource.buffer = buffer;
    ambientSource.loop = true;
    ambientSource.connect(ambientBus);
    ambientSource.start();
  }
  updateAudioBus();
  if (!ambientTimer) {
    const scheduleDrip = () => {
      ambientTimer = null;
      if (state.screen !== 'battle' || state.settings.battleMusic === false || state.settings.battleMusicMuted) return;
      playDungeonDrip(context);
      ambientTimer = window.setTimeout(scheduleDrip, 4200 + (musicStep % 5) * 680);
    };
    scheduleDrip();
  }
}

function ensureBattleMusic() {
  const context = getAudioContext();
  if (!context || !['battle', 'meta', 'expedition', 'history', 'shop'].includes(state.screen) || state.settings.battleMusic === false || state.settings.battleMusicMuted) return;
  ensureDungeonAmbience(context);
  if (!musicBus) {
    musicBus = context.createGain();
    musicAnalyser = context.createAnalyser();
    musicAnalyser.fftSize = 128;
    musicAnalyser.smoothingTimeConstant = 0.78;
    musicBus.connect(musicAnalyser).connect(audioCompressor);
  }
  updateAudioBus();
  if (musicTimer) return;
  const fieldNotes = [110, 130.81, 146.83, 98, 123.47, 164.81, 146.83, 130.81];
  const battleNotes = [55, 65.41, 73.42, 49, 55, 82.41, 61.74, 73.42];
  const scheduleStep = () => {
    musicTimer = null;
    if (!audioContext || !musicBus || !['battle', 'meta', 'expedition', 'history', 'shop'].includes(state.screen) || state.settings.battleMusic === false || state.settings.battleMusicMuted) return;
    const now = audioContext.currentTime + 0.025;
    const inBattle = state.screen === 'battle' && state.battle && !state.battle.outcome;
    if (inBattle) {
      const note = battleNotes[musicStep % battleNotes.length];
      const heat = Math.min(1.35, 0.86 + (state.battle.round || 1) * 0.08 + (state.battle.boss ? 0.18 : 0));
      playTone(context, note, now, 0.31, 'sawtooth', 0.18 * heat, 420, musicStep % 2 ? -4 : 4, musicBus);
      playTone(context, note * 2, now + 0.015, 0.23, 'triangle', 0.085 * heat, 950, musicStep % 2 ? 7 : -7, musicBus);
      if (musicStep % 4 === 0) playBattleDrum(context, now, 'kick', heat, musicBus);
      else if (musicStep % 4 === 2) playBattleDrum(context, now, 'tom', heat, musicBus);
      if (musicStep % 8 === 6) playTone(context, note * 5.99, now + 0.03, 0.12, 'triangle', 0.075 * heat, 3000, 11, musicBus);
    } else {
      const note = fieldNotes[musicStep % fieldNotes.length];
      playTone(context, note, now, 0.48, 'triangle', 0.18, 720, musicStep % 2 ? -5 : 5, musicBus);
      playTone(context, note * 2, now + 0.04, 0.32, 'sine', 0.045, 1800, 0, musicBus);
    }
    musicStep += 1;
    musicTimer = window.setTimeout(scheduleStep, inBattle ? 330 : 540);
  };
  scheduleStep();
}

function stopBattleMusic() {
  if (musicTimer) { window.clearTimeout(musicTimer); window.clearInterval(musicTimer); }
  musicTimer = null;
  musicStep = 0;
  if (musicBus && audioContext) musicBus.gain.setTargetAtTime(0, audioContext.currentTime, 0.04);
  if (ambientTimer) { window.clearTimeout(ambientTimer); ambientTimer = null; }
  if (ambientBus && audioContext) ambientBus.gain.setTargetAtTime(0, audioContext.currentTime, 0.08);
}

function animateMetaTree() {
  const tree = document.querySelector('.meta-tree-art');
  if (!tree || state.settings.reducedMotion) {
    if (metaTreeFrame) window.cancelAnimationFrame(metaTreeFrame);
    metaTreeFrame = null;
    return;
  }
  let energy = .16;
  if (musicAnalyser) {
    const bins = new Uint8Array(musicAnalyser.frequencyBinCount);
    musicAnalyser.getByteFrequencyData(bins);
    const sample = bins.slice(0, Math.max(4, Math.floor(bins.length * .38)));
    energy = sample.reduce((sum, value) => sum + value, 0) / sample.length / 255;
  }
  const pulse = Math.min(1, .18 + energy * 1.35);
  tree.style.setProperty('--audio-pulse', pulse.toFixed(3));
  tree.querySelectorAll('.growth-branch').forEach((branch, index) => {
    const offset = (index % 5) * .025;
    branch.style.opacity = `${Math.min(1, .48 + pulse + offset)}`;
    branch.style.strokeWidth = `${1 + pulse * (index % 3 === 0 ? 1.8 : .9)}`;
  });
  tree.querySelectorAll('.growth-square.unlocked').forEach((square, index) => {
    square.style.transform = `scale(${1 + pulse * .16}) rotate(${12 + index * 7}deg)`;
    square.style.transformOrigin = 'center';
  });
  metaTreeFrame = window.requestAnimationFrame(animateMetaTree);
}

function playTone(context, frequency, start, duration, type = 'sine', volume = 0.035, filterFrequency = 1800, detune = 0, destination = audioBus) {
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(detune, start);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFrequency, start);
  filter.Q.setValueAtTime(0.7, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.025, duration - 0.018));
  oscillator.connect(filter).connect(gain).connect(destination || audioBus);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playBattleDrum(context, start, kind = 'kick', intensity = 1, destination = musicBus) {
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const kick = kind === 'kick';
  oscillator.type = kick ? 'sine' : kind === 'tom' ? 'triangle' : 'sawtooth';
  oscillator.frequency.setValueAtTime(kick ? 118 : kind === 'tom' ? 205 : 155, start);
  oscillator.frequency.exponentialRampToValueAtTime(kick ? 42 : kind === 'tom' ? 92 : 68, start + (kick ? 0.16 : 0.105));
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(kick ? 180 : kind === 'tom' ? 680 : 520, start);
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime((kick ? 0.32 : 0.2) * intensity, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + (kick ? 0.22 : 0.15));
  oscillator.connect(filter).connect(gain).connect(destination || audioBus);
  oscillator.start(start);
  oscillator.stop(start + 0.24);
}

function playStatusCue(status) {
  const context = getAudioContext();
  if (!context || state.settings.soundMuted) return;
  const frequencies = { burn: 622.25, bleeding: 207.65, bramble: 146.83, poison: 277.18 };
  const frequency = frequencies[status] || 330;
  const start = context.currentTime + 0.005;
  playTone(context, frequency, start, .16, status === 'burn' ? 'sawtooth' : 'sine', .038, status === 'burn' ? 2600 : 1200, -4);
  playTone(context, frequency * 1.5, start + .055, .12, 'triangle', .022, 1800, 5);
}

function playImpactCue(kind = 'hit') {
  const context = getAudioContext();
  if (!context || state.settings.soundMuted) return;
  const start = context.currentTime + 0.002;
  if (kind === 'critical') {
    playBattleDrum(context, start, 'kick', 1.12, audioBus);
    playTone(context, 370, start + .045, .2, 'sawtooth', .085, 2400, 7);
    playTone(context, 554.37, start + .085, .16, 'triangle', .045, 3200, -9);
  } else {
    playBattleDrum(context, start, 'hit', .78, audioBus);
    playTone(context, 128, start + .012, .14, 'square', .052, 580, -5);
  }
}

function playUiCue(kind = 'navigate') {
  const context = getAudioContext();
  if (!context || state.settings.soundMuted) return;
  const start = context.currentTime + .002;
  const patterns = {
    navigate: [[220, 0, .07, 'sine', 1100, 0]],
    confirm: [[293.66, 0, .08, 'triangle', 1500, 0], [440, .055, .13, 'triangle', 1900, 3]],
    purchase: [[392, 0, .09, 'triangle', 1700, -2], [523.25, .07, .16, 'sine', 2300, 4]],
    toggle: [[330, 0, .055, 'sine', 1800, 0]],
    warning: [[155.56, 0, .12, 'square', 700, -4], [130.81, .08, .14, 'square', 620, 3]],
    battle: [[220, .025, .09, 'triangle', 950, -4], [440, .08, .11, 'sawtooth', 2100, 6]]
  };
  if (kind === 'battle') playBattleDrum(context, start, 'hit', .62, audioBus);
  (patterns[kind] || patterns.navigate).forEach(([frequency, offset, duration, type, filter, detune]) => playTone(context, frequency, start + offset, duration, type, kind === 'battle' ? .046 : .028, filter, detune));
}

function playActionCue(unit) {
  const context = getAudioContext();
  if (!context) return;
  triggerVisualizer(unit);
  const patterns = {
    warden: [[196, 0, .16, 'triangle', 900, -5], [293.66, .09, .22, 'triangle', 1400, 4]],
    emberling: [[329.63, 0, .08, 'sawtooth', 2200, -9], [523.25, .07, .2, 'sawtooth', 3200, 8]],
    wayfarer: [[440, 0, .08, 'square', 2600, -12], [659.25, .1, .18, 'square', 3600, 12]],
    husk: [[110, 0, .2, 'square', 600, -6]],
    wisp: [[587.33, 0, .1, 'sine', 3600, 10], [783.99, .12, .18, 'sine', 4800, -4]],
    rootmother: [[146.83, 0, .24, 'triangle', 800, -8], [98, .13, .26, 'triangle', 520, 6]]
  };
  const start = context.currentTime + 0.005;
  const audioClassKey = unit.side === 'ally' ? unitClassId(unit) : unit.kind;
  const cuePattern = classAudioPattern(audioClassKey) || patterns[unit.kind] || [[220, 0, .15, 'sine', 1600, 0]];
  cuePattern.forEach(([frequency, offset, duration, type, filterFrequency, detune], index) => playTone(context, frequency, start + offset, duration, type, (unit.side === 'enemy' ? 0.025 : 0.035) * (index ? 0.82 : 1), filterFrequency, detune));
}

function playSynergyCue(synergyId) {
  const context = getAudioContext();
  if (!context || state.settings.soundMuted) return;
  const patterns = {
    'three-point-ward': [523.25, 659.25, 783.99],
    'ashen-reprieve': [196, 293.66, 392],
    'veiled-citadel': [246.94, 329.63, 493.88],
    'iron-and-ember': [138.59, 207.65, 277.18],
    'moonlit-ambush': [587.33, 783.99, 1174.66]
  };
  const start = context.currentTime + .004;
  (patterns[synergyId] || [330, 440, 554.37]).forEach((frequency, index) => playTone(context, frequency, start + index * .055, .15, index === 1 ? 'triangle' : 'sine', .045, 2600, index % 2 ? 5 : -3));
}
function triggerSynergyCue(unit, synergyId, label) {
  playSynergyCue(synergyId);
  emitCombatFx(unit, label, 'cue', { burst: true, shake: false, scale: 1.05 });
}

function triggerVisualizer(unit) {
  const canvas = document.querySelector('#combat-visualizer');
  if (!canvas) return;
  canvas.dataset.actor = unit.kind;
  visualizerPulse = 1;
  emitCombatFx(unit, unit.side === 'enemy' ? 'HOSTILE CUE' : 'ACTION CUE', 'cue', { shake: false });
  canvas.classList.remove('visualizer-hit');
  void canvas.offsetWidth;
  canvas.classList.add('visualizer-hit');
}

function drawCombatVisualizer() {
  const canvas = document.querySelector('#combat-visualizer');
  if (canvas && musicAnalyser) {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(rect.width * scale) || canvas.height !== Math.floor(rect.height * scale)) {
      canvas.width = Math.floor(rect.width * scale); canvas.height = Math.floor(rect.height * scale);
    }
    const ctx = canvas.getContext('2d'); ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const values = new Uint8Array(musicAnalyser.frequencyBinCount); musicAnalyser.getByteFrequencyData(values);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const bars = Math.min(28, values.length); const gap = 3; const barWidth = Math.max(2, (rect.width - gap * (bars - 1)) / bars);
    for (let i = 0; i < bars; i += 1) { const energy = Math.min(1, values[i] / 255 + visualizerPulse * (i % 3 === 0 ? .5 : .18)); const height = Math.max(2, energy * rect.height * .72); ctx.fillStyle = `rgba(228,111,69,${.18 + energy * .7})`; ctx.fillRect(i * (barWidth + gap), rect.height - height, barWidth, height); }
    visualizerPulse *= .86;
  } else if (canvas) {
    const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); const bars = 28; const gap = 3; const barWidth = Math.max(2, (rect.width - gap * (bars - 1)) / bars);
    ctx.clearRect(0, 0, rect.width, rect.height);
    for (let i = 0; i < bars; i += 1) { const energy = visualizerPulse * (i % 4 === 0 ? 1 : .25); const height = Math.max(1, energy * rect.height * .72); ctx.fillStyle = `rgba(228,111,69,${.12 + energy * .7})`; ctx.fillRect(i * (barWidth + gap), rect.height - height, barWidth, height); }
    visualizerPulse *= .86;
  }
  visualizerFrame = window.requestAnimationFrame(drawCombatVisualizer);
}

function pulseUnit(unitId) {
  actionPulseId = unitId;
  const unit = getUnit(unitId);
  if (unit) playActionCue(unit);
}

function registerCombo(attacker, dealt) {
  if (!attacker || dealt <= 0 || !state.battle) return null;
  state.battle.combo ||= { count: 0, multiplier: 1 };
  state.battle.combo.count += 1;
  state.battle.combo.multiplier = Math.min(2.5, 1 + state.battle.combo.count * 0.25);
  return { count: state.battle.combo.count, multiplier: state.battle.combo.multiplier };
}

function damageUnit(target, amount, sourceName, options = {}) {
  if (!target?.alive) return;
  const markedBonus = target.status.includes('marked') ? 1 : 0;
  if (markedBonus) target.status = target.status.filter(status => status !== 'marked');
  const mirrorWard = target.side === 'ally' && hasRelic('hollow-mirror') && !target.mirrorWardUsed ? relicLevel('hollow-mirror') : 0;
  if (mirrorWard) {
    target.mirrorWardUsed = true;
    emitCombatFx(target, `MIRROR -${mirrorWard}`, 'guard', { burst: false, shake: false });
  }
  const incoming = Math.max(0, amount + markedBonus - mirrorWard);
  haptic(sourceName === 'Burn' || sourceName === 'Poison' ? 'tap' : target.side === 'ally' ? 'warning' : 'hit');
  const bypassedGuard = Math.min(target.guard, Math.max(0, Number(options.guardPierce) || 0));
  const absorbed = Math.min(Math.max(0, target.guard - bypassedGuard), incoming);
  target.guard -= absorbed;
  const dealt = incoming - absorbed;
  const combo = registerCombo(options.attacker, dealt);
  target.hp -= dealt;
  const comboLabel = combo && combo.count > 1 ? ` · COMBO x${combo.count}` : '';
  const hitText = options.critical ? `CRIT! -${dealt}` : absorbed ? (dealt ? `-${dealt}  /  BLOCK ${absorbed}` : `BLOCK ${absorbed}`) : `-${dealt}`;
  emitCombatFx(target, `${hitText}${comboLabel}`, options.critical ? 'critical' : absorbed ? 'guard' : 'damage', { critical: options.critical, scale: combo?.multiplier || 1 });
  if (absorbed) addLog(`${sourceName} meets ${target.name}'s guard for ${dealt} damage.`);
  else addLog(`${sourceName} hits ${target.name} for ${dealt} damage.`);
  if (target.hp <= 0) {
    if (target.side === 'ally' && hasRelic('last-cinder') && !state.battle.reviveUsed) {
      target.hp = Math.min(3, target.maxHp);
      target.alive = true;
      target.guard = 1;
      state.battle.reviveUsed = true;
      emitCombatFx(target, 'LAST CINDER', 'critical', { shake: true, scale: 1.3 });
      addLog(`${target.name} returns through the Last Cinder.`);
      return;
    }
    target.hp = 0;
    target.alive = false;
    target.acted = true;
    emitCombatFx(target, 'DOWN', 'death', { shake: true });
    addLog(`${target.name} falls out of the light.`);
    if (target.elite?.key === 'volatile') {
      living().filter(unit => unit.id !== target.id && distance(unit, target) <= 1).forEach(unit => damageUnit(unit, 1, `${target.name} burst`));
      addLog(`${target.name}'s volatile core bursts on defeat.`);
    }
    if (target.side === 'ally') toast(`${target.name} is down.`, true);
    const primaryDefeated = target.side === 'enemy' && (state.battle.boss?.key === target.kind || (state.battle.subBoss && target.subBoss));
    if (primaryDefeated) { addLog(`${target.name} falls; its remaining escorts break formation.`); finishBattle('victory'); }
  }
}

function moveUnit(unit, destination) {
  if (state.battle) state.battle.formationLocked = true;
  haptic(unit.side === 'ally' ? 'move' : 'tap');
  pulseUnit(unit.id);
  const firstMoveThisRound = !unit.moved;
  const origin = { x: unit.x, y: unit.y };
  movementTrails.push({ unitId: unit.id, side: unit.side, from: origin, to: { x: destination.x, y: destination.y } });
  movementTrails = movementTrails.slice(-12);
  unit.x = destination.x;
  unit.y = destination.y;
  unit.moved = true;
  if (unit.side === 'ally' && firstMoveThisRound && unitClassId(unit) === 'riftblade') {
    unit.guard += 1;
    emitCombatFx(unit, 'RIFT GUARD +1', 'guard', { burst: false, shake: false });
  }
  if (isHazard(unit.x, unit.y, 'bramble')) {
    if ((partyHasClass('geomancer') || hasRelic('root-knot')) && unit.side === 'ally' && !unit.terrainWard) {
      unit.terrainWard = true;
      emitCombatFx(unit, 'GROUND SAFE', 'guard', { shake: false });
      addLog(`${unit.name} crosses the bramble unharmed.`);
    } else {
      addStatus(unit, 'bleeding', 'Bramble');
      damageUnit(unit, 1, 'Bramble');
    }
  }
  addLog(`${unit.name} moves to ${unit.x + 1}.${unit.y + 1}.`);
}

function adjacentAlly(unit) {
  return living('ally').find(other => other.id !== unit.id && distance(unit, other) === 1);
}

function healMostWoundedAlly(amount, sourceName) {
  const wounded = living('ally').filter(hero => hero.hp < hero.maxHp).sort((a, b) => (b.maxHp - b.hp) - (a.maxHp - a.hp))[0];
  if (!wounded) return null;
  const healed = Math.min(amount, wounded.maxHp - wounded.hp);
  wounded.hp += healed;
  emitCombatFx(wounded, `MENDED +${healed}`, 'guard', { shake: false });
  addLog(`${sourceName} restores ${healed} HP to ${wounded.name}.`);
  return wounded;
}

function attackTarget(attacker, target, bonus = 0) {
  if (!attacker || !target || !target.alive) return;
  if (state.battle) state.battle.formationLocked = true;
  pulseUnit(attacker.id);
  emitClassFx(attacker, actionMode === 'ability' ? 'signature' : 'strike');
  const classKey = attacker.side === 'ally' ? unitClassId(attacker) : null;
  const comboMultiplier = state.battle.combo?.multiplier || 1;
  const relicCrit = relicLevel('lucky-nail') * .12;
  const metaCrit = state.meta.unlocked.includes('first-breath') ? .10 : 0;
  const companionOpening = attacker.side === 'ally' && ['knifewisp', 'moonquill'].includes(attacker.kind) && activeCompanionSynergies().some(synergy => synergy.id === 'moonlit-ambush') && !attacker.roundAttackUsed ? 1 : 0;
  const synergyCrit = (hasMetaSynergy('edge-theory') ? .08 : 0) + (hasMetaSynergy('perfect-opening') && attacker.side === 'ally' && !attacker.roundAttackUsed ? .05 : 0) + (companionOpening ? .10 : 0);
  const legendaryOpening = state.meta.unlocked.includes('legendary-singularity') && attacker.side === 'ally' && state.battle.round === 1 && !attacker.roundAttackUsed;
  const critical = legendaryOpening || Math.random() < Math.min(.54, .12 + relicCrit + metaCrit + synergyCrit + ((state.battle.combo?.count || 0) * .04));
  const closeStrikeBonus = ['vanguard'].includes(classKey) && distance(attacker, target) <= 1 ? 1 : 0;
  const scoutRunBonus = classKey === 'scout' && attacker.moved ? 1 : 0;
  const duelistCritBonus = classKey === 'duelist' && critical ? 1 : 0;
  const geomancerTerrainBonus = classKey === 'geomancer' && state.battle.hazards.some(hazard => hazard.type === 'bramble' && distance(target, hazard) <= 1) ? 1 : 0;
  const classAttackBonus = closeStrikeBonus + scoutRunBonus + duelistCritBonus + geomancerTerrainBonus + companionOpening;
  const ambushBonus = attacker.side === 'ally' && partyHasClass('scout') && state.battle.round === 1 ? 1 : 0;
  const crownBonus = attacker.side === 'ally' && !attacker.roundAttackUsed ? relicLevel('ashen-crown') : 0;
  const perfectOpeningBonus = attacker.side === 'ally' && hasMetaSynergy('perfect-opening') && !attacker.roundAttackUsed ? 1 : 0;
  const hunterBonus = attacker.side === 'ally' && (target.bossKey || target.elite) ? relicLevel('hunter-bell') : 0;
  const chantBonus = attacker.side === 'ally' && (state.battle.combo?.count || 0) >= 1 ? relicLevel('war-chant') : 0;
  const saltBonus = attacker.side === 'ally' && target.status.length ? relicLevel('black-salt') : 0;
  const companionStatusBonus = attacker.side === 'ally' && ['cinderwake', 'ruinpike'].includes(attacker.kind) && activeCompanionSynergies().some(synergy => synergy.id === 'iron-and-ember') && target.status.length ? 1 : 0;
  const signatureBonus = attacker.side === 'ally' && actionMode === 'ability' ? relicLevel('scribe-seal') : 0;
  const critMultiplier = 1.6 + relicLevel('glass-fang') * .18;
  const amount = Math.max(1, Math.round((attacker.damage + bonus + classAttackBonus + ambushBonus + crownBonus + perfectOpeningBonus + hunterBonus + chantBonus + saltBonus + companionStatusBonus + signatureBonus) * comboMultiplier * (critical ? critMultiplier : 1)));
  attacker.roundAttackUsed = true;
  damageUnit(target, amount, attacker.name, { attacker, critical, guardPierce: ['riftblade', 'rifthound'].includes(classKey) ? 1 : 0 });
  if (companionOpening) triggerSynergyCue(attacker, 'moonlit-ambush', 'MOONLIT AMBUSH');
  if (companionStatusBonus) triggerSynergyCue(attacker, 'iron-and-ember', 'IRON & EMBER');
  if (attacker.side === 'ally' && ['wayfarer', 'moonquill'].includes(attacker.kind) && activeCompanionSynergies().some(synergy => synergy.id === 'three-point-ward') && !state.battle.synergyTriggers?.threePointWard) {
    state.battle.synergyTriggers ||= {};
    state.battle.synergyTriggers.threePointWard = true;
    attacker.guard += 1;
    triggerSynergyCue(attacker, 'three-point-ward', 'THREE-POINT WARD');
    emitCombatFx(attacker, 'RANGED WARD +1', 'guard', { burst: false, shake: false });
  }
  if (['emberling', 'arcanist', 'cinderwake'].includes(classKey) && target.alive) addStatus(target, 'burn', attacker.name);
  if (attacker.side === 'ally' && classKey === 'cinderwake' && activeCompanionSynergies().some(synergy => synergy.id === 'ashen-reprieve') && !state.battle.synergyTriggers?.ashenReprieve) {
    state.battle.synergyTriggers ||= {};
    state.battle.synergyTriggers.ashenReprieve = true;
    healMostWoundedAlly(1, 'Ashen Reprieve');
    triggerSynergyCue(attacker, 'ashen-reprieve', 'ASHEN REPRIEVE');
    emitCombatFx(attacker, 'REPRIEVE +1', 'guard', { burst: false, shake: false });
  }
  if (attacker.side === 'ally' && actionMode !== 'ability') {
    if (classKey === 'warden') { attacker.guard += 1; emitCombatFx(attacker, 'GUARD +1', 'guard', { burst: false, shake: false }); }
    if (classKey === 'conduit' || classKey === 'stormcaller') {
      const echo = living('enemy').filter(enemy => enemy.id !== target.id && distance(target, enemy) <= 2).sort((a, b) => distance(target, a) - distance(target, b))[0];
      if (echo) { damageUnit(echo, 1, classKey === 'conduit' ? 'Arc shot' : 'Static lance', { attacker }); emitCombatFx(echo, 'ARC -1', 'critical', { shake: false }); }
    }
    if (classKey === 'soulweaver') healMostWoundedAlly(1, 'Life thread');
  }
  if (attacker.side === 'ally' && critical && relicLevel('storm-coil')) {
    const echo = living('enemy').filter(enemy => enemy.id !== target.id).sort((a, b) => distance(target, a) - distance(target, b))[0];
    if (echo) {
      damageUnit(echo, relicLevel('storm-coil'), 'Storm Coil', { attacker });
      emitCombatFx(echo, 'ARC', 'critical', { shake: false, scale: 1.15 });
      addLog(`Storm Coil arcs into ${echo.name}.`);
    }
  }
  if (attacker.side === 'ally' && relicLevel('mending-loop')) {
    state.battle.mendingLoopHits = (state.battle.mendingLoopHits || 0) + 1;
    if (state.battle.mendingLoopHits % 3 === 0) {
      const wounded = living('ally').filter(hero => hero.hp < hero.maxHp).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (wounded) {
        const healed = Math.min(relicLevel('mending-loop'), wounded.maxHp - wounded.hp);
        wounded.hp += healed;
        emitCombatFx(wounded, `MENDED +${healed}`, 'guard', { shake: false });
        addLog(`Mending Loop restores ${healed} HP to ${wounded.name}.`);
      }
    }
  }
  attacker.acted = true;
  refreshIntents();
}

function abilityClass(unit) { return unit.kind === 'warden' ? (unit.startingClass || state.meta.startingClass) : unit.kind; }
function abilityTargetRange(unit) { const classKey = abilityClass(unit); return classKey === 'wayfarer' ? 4 : classKey === 'riftblade' ? 5 : unit.range; }
function abilityNeedsEnemyTarget(unit) { return !['warden', 'soulweaver', 'stitchmoth', 'paleScribe', 'rootbound', 'veilmender', 'gravebastion', 'oathroot'].includes(abilityClass(unit)); }

function useAbility(unit, chosenTarget = null) {
  if (unit.abilityUsed || unit.acted || !unit.alive || state.battle.phase !== 'plan') return;
  pulseUnit(unit.id);
  if (!abilityNeedsEnemyTarget(unit)) emitClassFx(unit, 'signature');
  const classKey = abilityClass(unit);
  const target = chosenTarget || living('enemy').filter(enemy => distance(unit, enemy) <= abilityTargetRange(unit)).sort((a, b) => distance(unit, a) - distance(unit, b))[0];
  if (classKey === 'warden') {
    if (state.battle) state.battle.formationLocked = true;
    unit.guard = Math.max(unit.guard, 3);
    emitCombatFx(unit, 'GUARD +3', 'guard', { burst: false, shake: false });
    const ally = adjacentAlly(unit);
    if (ally) {
      ally.guard = Math.max(ally.guard, 2);
      emitCombatFx(ally, 'GUARD +2', 'guard', { burst: false, shake: false });
    }
    addLog(`${unit.name} braces the line.`);
  } else if (classKey === 'vanguard') {
    if (!target) return toast('No target is close enough for Bulwark Crash.', true);
    unit.guard = Math.max(unit.guard, 4);
    const ally = adjacentAlly(unit);
    if (ally) ally.guard = Math.max(ally.guard, 1);
    attackTarget(unit, target, 2);
    addLog('Bulwark Crash turns the formation into a weapon.');
  } else if (classKey === 'arcanist') {
    if (!target) return toast('No target is in Prism Bolt range.', true);
    attackTarget(unit, target, 3);
    if (target.alive) addStatus(target, 'burn', unit.name);
    addLog('Prism Bolt leaves a geometric ember scar.');
  } else if (classKey === 'scout') {
    if (!target) return toast('No target is in Evasive Volley range.', true);
    attackTarget(unit, target, 1);
    const sidestep = validCells().filter(tile => distance(unit, tile) === 1 && !occupied(tile.x, tile.y, unit.id) && distance(tile, target) > distance(unit, target)).sort((a, b) => distance(b, target) - distance(a, target))[0];
    if (sidestep) moveUnit(unit, sidestep);
    addLog('Evasive Volley cuts away from the counterstrike.');
  } else if (classKey === 'duelist') {
    if (!target) return toast('No target is close enough for Riposte.', true);
    attackTarget(unit, target, 2);
    unit.guard = Math.max(unit.guard, 2);
    addLog('Riposte converts the enemy swing into momentum.');
  } else if (classKey === 'geomancer') {
    if (!target) return toast('No target is in Faultline range.', true);
    attackTarget(unit, target, 1);
    const cell = neighbors(target).find(tile => !occupied(tile.x, tile.y) && !isHazard(tile.x, tile.y));
    if (cell) state.battle.hazards.push({ ...cell, type: 'bramble' });
    addLog('Faultline turns the target tile into hostile ground.');
  } else if (classKey === 'conduit') {
    if (!target) return toast('No target is in Resonant Chain range.', true);
    attackTarget(unit, target);
    const echo = living('enemy').find(enemy => enemy.id !== target.id && distance(target, enemy) <= 2);
    if (echo) damageUnit(echo, 2, 'Resonant Chain', { attacker: unit });
    addLog('Resonant Chain carries the hit into a second shadow.');
  } else if (classKey === 'riftblade') {
    if (!target) return toast('No target is in Riftcut range.', true);
    if (distance(unit, target) > 1) {
      const landing = validCells().filter(tile => distance(tile, target) === 1 && !occupied(tile.x, tile.y, unit.id)).sort((a, b) => distance(unit, a) - distance(unit, b))[0];
      if (landing) moveUnit(unit, landing);
    }
    attackTarget(unit, target, 2);
    addLog('Riftcut folds the distance and opens a phase wound.');
  } else if (classKey === 'stormcaller') {
    if (!target) return toast('No target is in Thunderclap range.', true);
    attackTarget(unit, target, 1);
    const arcs = living('enemy').filter(enemy => enemy.id !== target.id && distance(target, enemy) <= 2).sort((a, b) => distance(target, a) - distance(target, b)).slice(0, 2);
    arcs.forEach(enemy => { damageUnit(enemy, 2, 'Thunderclap', { attacker: unit }); emitCombatFx(enemy, 'THUNDER -2', 'critical', { shake: false }); });
    addLog(`Thunderclap leaps into ${arcs.length} nearby foe${arcs.length === 1 ? '' : 's'}.`);
  } else if (classKey === 'soulweaver') {
    healMostWoundedAlly(3, 'Lifeline');
    living('ally').filter(ally => distance(unit, ally) <= 2).forEach(ally => {
      ally.guard += 2;
      emitCombatFx(ally, 'GUARD +2', 'guard', { burst: false, shake: false });
    });
    addLog('Lifeline mends the most wounded ally and steadies nearby friends.');
  } else if (unit.kind === 'emberling') {
    const targets = living('enemy').filter(enemy => distance(unit, enemy) <= unit.range).sort((a, b) => distance(unit, a) - distance(unit, b));
    if (!targets[0]) return toast('No enemy is close enough for Cinder Arc.', true);
    attackTarget(unit, targets[0], 1);
    const splash = living('enemy').find(enemy => enemy.id !== targets[0].id && distance(targets[0], enemy) === 1);
    if (splash) damageUnit(splash, 1, 'Cinder Arc', { attacker: unit });
    addStatus(targets[0], 'burn', 'Cinder Arc');
    addLog('Cinder Arc leaves a coal-bright wound.');
  } else if (unit.kind === 'wayfarer') {
    const targets = living('enemy').filter(enemy => distance(unit, enemy) <= 4).sort((a, b) => distance(unit, a) - distance(unit, b));
    if (!targets[0]) return toast('Nothing is in the Wayfarer\'s line.', true);
    attackTarget(unit, targets[0], 2);
    addLog('Thread the Needle finds the seam in the dark.');
  } else if (unit.kind === 'cinderjaw' || unit.kind === 'ashcap') {
    if (!target) return toast(`No target is in ${unit.kind === 'cinderjaw' ? 'Furnace Bite' : 'Sporefall'} range.`, true);
    const abilityName = unit.kind === 'cinderjaw' ? 'Furnace Bite' : 'Sporefall';
    const status = unit.kind === 'cinderjaw' ? 'burn' : 'poison';
    attackTarget(unit, target, 1);
    living('enemy').filter(enemy => enemy.id !== target.id && distance(target, enemy) <= 1).forEach(enemy => {
      damageUnit(enemy, 1, abilityName, { attacker: unit });
      addStatus(enemy, status, abilityName);
    });
    addStatus(target, status, abilityName);
    addLog(`${abilityName} blooms across the clustered hexes.`);
  } else if (unit.kind === 'veilmender') {
    const healed = healMostWoundedAlly(3, 'Veil Stitch');
    if (healed && activeCompanionSynergies().some(synergy => synergy.id === 'veiled-citadel')) { healed.guard += 1; triggerSynergyCue(healed, 'veiled-citadel', 'VEILED CITADEL'); emitCombatFx(healed, 'VEIL GUARD +1', 'guard', { burst: false, shake: false }); }
    addLog(`${unit.name} restores ${healed ? healed.name : 'the party'} through the veil.`);
  } else if (unit.kind === 'stitchmoth') {
    const healed = healMostWoundedAlly(3, 'Silk Mend');
    const ally = adjacentAlly(unit);
    if (ally) {
      ally.guard += 1;
      emitCombatFx(ally, 'SILK GUARD +1', 'guard', { burst: false, shake: false });
    }
    addLog(`${unit.name} stitches ${healed ? healed.name : 'the party'} back into the fight.`);
  } else if (unit.kind === 'paleScribe') {
    living('ally').forEach(ally => {
      const healed = Math.min(1, ally.maxHp - ally.hp);
      ally.hp += healed;
      ally.status = ally.status.filter(status => !['burn', 'poison', 'bleeding'].includes(status));
      if (healed) emitCombatFx(ally, 'LITANY +1', 'guard', { burst: false, shake: false });
    });
    addLog('Whiteout Litany clears harm from every living ally.');
  } else if (unit.kind === 'rootbound') {
    unit.guard = Math.max(unit.guard, 4);
    living('ally').filter(ally => ally.id !== unit.id && distance(unit, ally) <= 1).forEach(ally => {
      ally.guard += 1;
      emitCombatFx(ally, 'ROOT WARD +1', 'guard', { burst: false, shake: false });
    });
    emitCombatFx(unit, 'IRONROOT +4', 'guard', { burst: false, shake: false });
    addLog('Ironroot Stand locks the formation in place.');
  } else if (unit.kind === 'bellguard') {
    if (!target) return toast('No enemy is close enough for Tollbreaker.', true);
    unit.guard = Math.max(unit.guard, 3);
    attackTarget(unit, target, 1);
    addLog('Tollbreaker answers the threat with a warding strike.');
  } else if (unit.kind === 'glassjack') {
    if (!target) return toast('No enemy is close enough for Shard Rush.', true);
    attackTarget(unit, target, 2);
    unit.guard += 1;
    addLog('Shard Rush turns a narrow opening into a glass-bright wound.');
  } else if (unit.kind === 'rifthound') {
    if (!target) return toast('No enemy is close enough for Phase Maul.', true);
    attackTarget(unit, target, 1);
    addLog('Phase Maul tears through the target\'s guard seam.');
  } else if (unit.kind === 'gravebastion' || unit.kind === 'oathroot') {
    unit.guard = Math.max(unit.guard, unit.kind === 'gravebastion' ? 4 : 3);
    living('ally').filter(ally => ally.id !== unit.id && distance(unit, ally) <= 1).forEach(ally => { ally.guard += 1; emitCombatFx(ally, 'ROOT GUARD +1', 'guard', { burst: false, shake: false }); });
    addLog(`${unit.name} anchors the formation in a living wall.`);
  } else if (unit.kind === 'knifewisp' || unit.kind === 'ruinpike') {
    if (!target) return toast(`No enemy is close enough for ${unit.kind === 'knifewisp' ? 'Flicker Cut' : 'Pikefall'}.`, true);
    attackTarget(unit, target, 2);
    if (unit.kind === 'knifewisp') { const step = validCells().find(tile => distance(unit, tile) === 1 && !occupied(tile.x, tile.y, unit.id)); if (step) moveUnit(unit, step); }
    addLog(`${unit.name} turns a narrow opening into a decisive wound.`);
  } else if (unit.kind === 'moonquill') {
    if (!target) return toast('No target is in Silver Sentence range.', true);
    attackTarget(unit, target, 3);
    addStatus(target, 'marked', 'Silver Sentence');
    addLog('Silver Sentence writes the target into the moonlight.');
  } else if (unit.kind === 'lanternmote') {
    if (!target) return toast('No target is in Guiding Mark range.', true);
    attackTarget(unit, target, 1);
    addStatus(target, 'marked', 'Guiding Mark');
    addLog('Guiding Mark fixes a pale target in the dark.');
  } else if (unit.kind === 'sootscribe') {
    if (!target) return toast('No target is in Blackline range.', true);
    attackTarget(unit, target, 2);
    addStatus(target, 'burn', 'Blackline');
    addLog('Blackline writes a burning sentence across the enemy.');
  }
  unit.abilityUsed = true;
  unit.acted = true;
  persist(null);
  render();
}

function chooseHero(id) {
  const unit = getUnit(id);
  if (!unit || !unit.alive || unit.side !== 'ally' || state.battle.phase !== 'plan') return;
  haptic('tap');
  selectedUnitId = id;
  actionMode = null;
  render();
}

function selectAction(mode) {
  const unit = getUnit(selectedUnitId);
  if (!unit || !unit.alive || unit.acted || state.battle.phase !== 'plan') return;
  haptic('tap');
  if (mode === 'ability' && !unit.abilityUsed && !abilityNeedsEnemyTarget(unit)) {
    actionMode = null;
    useAbility(unit);
    return;
  }
  actionMode = actionMode === mode ? null : mode;
  render();
}

function handleCellClick(x, y) {
  const unit = getUnit(selectedUnitId);
  if (!unit || state.battle.phase !== 'plan') return;
  const clickedUnit = getUnits().find(item => item.alive && item.x === x && item.y === y);
  if (clickedUnit?.side === 'ally') return chooseHero(clickedUnit.id);
  if (actionMode === 'move') {
    if (!unit.moved && reachable(unit).some(cell => cell.x === x && cell.y === y)) {
      moveUnit(unit, { x, y });
      actionMode = null;
      persist(null);
      refreshIntents();
      render();
    } else toast('That tile is not reachable.', true);
  } else if (actionMode === 'attack' || actionMode === 'ability') {
    if (!clickedUnit || clickedUnit.side !== 'enemy') return toast('Choose a marked enemy.', true);
    const range = actionMode === 'ability' ? abilityTargetRange(unit) : unit.range;
    if (distance(unit, clickedUnit) > range) return toast('That enemy is outside the action range.', true);
    if (actionMode === 'attack') attackTarget(unit, clickedUnit);
    else useAbility(unit, clickedUnit);
    actionMode = null;
    persist(null);
    if (living('enemy').length === 0) finishBattle('victory');
    render();
  }
}

function guardUnit() {
  const unit = getUnit(selectedUnitId);
  if (!unit || unit.acted || !unit.alive || state.battle.phase !== 'plan') return;
  if (state.battle) state.battle.formationLocked = true;
  haptic('tap');
  pulseUnit(unit.id);
  const guardTotal = 2 + relicLevel('silver-pact');
  unit.guard = Math.max(unit.guard, guardTotal);
  emitCombatFx(unit, `GUARD +${guardTotal}`, 'guard', { burst: false, shake: false });
  unit.acted = true;
  addLog(`${unit.name} holds the line.`);
  persist(null);
  render();
}

function endHeroTurn() {
  const unit = getUnit(selectedUnitId);
  if (!unit || !unit.alive || unit.acted || state.battle.phase !== 'plan') return;
  if (state.battle) state.battle.formationLocked = true;
  haptic('tap');
  pulseUnit(unit.id);
  unit.acted = true;
  addLog(`${unit.name} waits.`);
  actionMode = null;
  persist(null);
  render();
}

function allHeroesActed() { return living('ally').every(hero => hero.acted); }

function confirmPlan() {
  if (state.battle.phase !== 'plan') return;
  if (state.battle) state.battle.formationLocked = true;
  haptic('warning');
  state.battle.phase = 'enemy';
  actionMode = null;
  persist('Plan committed');
  render();
  window.setTimeout(resolveEnemyPhase, 380);
}

function bestTarget(enemy) {
  return living('ally').sort((a, b) => {
    const scoreA = (a.hp / a.maxHp) * 6 + distance(enemy, a) * 0.45 + (a.guard ? 1 : 0);
    const scoreB = (b.hp / b.maxHp) * 6 + distance(enemy, b) * 0.45 + (b.guard ? 1 : 0);
    return scoreA - scoreB;
  })[0];
}

function stepToward(unit, target, preferAway = false) {
  const options = neighbors(unit).filter(cell => !occupied(cell.x, cell.y, unit.id));
  options.sort((a, b) => {
    const da = distance(a, target); const db = distance(b, target);
    return preferAway ? db - da : da - db;
  });
  return options[0];
}

function makeIntent(enemy) {
  const target = bestTarget(enemy);
  if (!target) return { type: 'hold', text: 'The room is quiet.', targetId: null };
  if (enemy.bossKey === 'ashcolossus' && state.battle.round % 2 === 0) return { type: 'quake', targetId: target.id, text: 'Wind up a room-wide Ash Quake. Guard or spread out.' };
  if (enemy.bossKey === 'bellwidow' && state.battle.round % 2 === 0) {
    const webCell = neighbors(target).find(cell => !occupied(cell.x, cell.y) && !isHazard(cell.x, cell.y));
    return { type: 'webfall', targetId: target.id, tile: webCell, text: 'Webfall and summon a Glass Skitter near the marked hero.' };
  }
  if (enemy.kind === 'riftstalker') {
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Strike ${target.name} from the rift.` };
    const landing = neighbors(target).find(cell => !occupied(cell.x, cell.y, enemy.id) && !isHazard(cell.x, cell.y));
    return landing ? { type: 'blink', targetId: target.id, tile: landing, text: `Phase beside ${target.name}; it will strike next turn.` } : { type: 'move', targetId: target.id, tile: stepToward(enemy, target), text: `Stalk ${target.name} through the ward.` };
  }
  if (enemy.kind === 'mossoracle') {
    const markTarget = living('ally').filter(hero => !hero.status.includes('marked')).sort((a, b) => distance(enemy, a) - distance(enemy, b))[0];
    if (markTarget && distance(enemy, markTarget) <= enemy.range) return { type: 'mark', targetId: markTarget.id, text: `Mark ${markTarget.name}; the next enemy hit deals +1 damage.` };
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Spore-bolt ${target.name}.` };
    const step = stepToward(enemy, target, true) || stepToward(enemy, target);
    return step ? { type: 'move', targetId: target.id, tile: step, text: `Drift into range of ${target.name}.` } : { type: 'guard', text: 'Gather spores.' };
  }
  if (enemy.kind === 'husk') {
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Strike ${target.name}.` };
    const step = stepToward(enemy, target);
    return step ? { type: 'move', targetId: target.id, tile: step, text: `Close on ${target.name}.` } : { type: 'guard', text: 'Hold position.' };
  }
  if (enemy.kind === 'wisp') {
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Mark ${target.name} from afar.` };
    const step = stepToward(enemy, target, true) || stepToward(enemy, target);
    return step ? { type: 'move', targetId: target.id, tile: step, text: `Reposition above ${target.name}.` } : { type: 'guard', text: 'Dim the lantern.' };
  }
  if (enemy.kind === 'skitter') {
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Pounce on ${target.name}.` };
    const step = stepToward(enemy, target);
    return step ? { type: 'move', targetId: target.id, tile: step, text: `Circle toward ${target.name}.` } : { type: 'guard', text: 'Cling to the wall.' };
  }
  if (enemy.kind === 'mireling') {
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Spit mire at ${target.name}.` };
    const hazardCell = neighbors(target).find(cell => !occupied(cell.x, cell.y) && !isHazard(cell.x, cell.y));
    return hazardCell ? { type: 'hazard', targetId: target.id, tile: hazardCell, text: `Pool mire near ${target.name}.` } : { type: 'move', targetId: target.id, tile: stepToward(enemy, target), text: `Creep toward ${target.name}.` };
  }
  if (enemy.kind === 'shade') {
    if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Ambush ${target.name} from the dark.` };
    const step = stepToward(enemy, target, true) || stepToward(enemy, target);
    return step ? { type: 'move', targetId: target.id, tile: step, text: `Slip behind ${target.name}.` } : { type: 'guard', text: 'Become indistinct.' };
  }
  const hazardCell = neighbors(target).find(cell => !occupied(cell.x, cell.y) && !isHazard(cell.x, cell.y));
  if (hazardCell && state.battle.round < MAX_ROUNDS) return { type: 'hazard', targetId: target.id, tile: hazardCell, text: `Root the ground near ${target.name}.` };
  if (distance(enemy, target) <= enemy.range) return { type: 'attack', targetId: target.id, text: `Entangle ${target.name}.` };
  return { type: 'move', targetId: target.id, tile: stepToward(enemy, target), text: `Creep toward ${target.name}.` };
}

function refreshIntents() {
  if (!state.battle) return;
  state.battle.intents = {};
  living('enemy').forEach(enemy => { state.battle.intents[enemy.id] = makeIntent(enemy); });
}

function unitDamage(unit) {
  return unit.damage + (unit.elite?.key === 'frenzied' && unit.hp <= unit.maxHp / 2 ? 1 : 0);
}

function executeBossMechanic(boss, target) {
  if (!boss?.bossKey || !boss.alive) return;
  if (boss.bossKey === 'ashcolossus' && state.battle.round % 2 === 0) {
    living('ally').forEach(hero => {
      if (distance(boss, hero) <= 3) {
        damageUnit(hero, 1, 'Ash Quake');
        emitCombatFx(hero, 'QUAKE', 'status', { burst: false, shake: true });
      }
    });
    addLog('The Ash Colossus fractures the floor with a room-wide quake.');
  }
  if (boss.bossKey === 'bellwidow' && state.battle.round % 2 === 0) {
    const webCell = target ? neighbors(target).find(cell => !occupied(cell.x, cell.y) && !isHazard(cell.x, cell.y)) : null;
    if (webCell) {
      state.battle.hazards.push({ ...webCell, type: 'bramble' });
      emitCombatFx(target, 'WEBFALL', 'status', { burst: false, shake: false });
    }
    if (living('enemy').filter(enemy => enemy.kind === 'skitter').length < 3) {
      const summonCell = validCells().find(cell => !occupied(cell.x, cell.y) && distance(cell, boss) <= 2);
      if (summonCell) {
        const summon = cloneUnit(`enemy-summon-${Date.now()}`, 'enemy', 'skitter', summonCell);
        state.battle.enemies.push(summon);
        emitCombatFx(boss, 'SUMMON', 'cue', { burst: true, shake: false });
        addLog('The Bell Widow rings a Glass Skitter into the room.');
      }
    }
  }
}

function executeIntent(enemy, intent) {
  if (!enemy.alive || !intent) return;
  pulseUnit(enemy.id);
  const target = getUnit(intent.targetId);
  if (intent.type === 'attack') {
    if (target?.alive && distance(enemy, target) <= enemy.range) {
      damageUnit(target, unitDamage(enemy), enemy.name, { attacker: enemy });
      if (enemy.kind === 'mireling' && target.alive) addStatus(target, 'poison', enemy.name);
    }
    else if (target?.alive) {
      const step = stepToward(enemy, target);
      if (step) moveUnit(enemy, step);
    }
  } else if (intent.type === 'move') {
    if (intent.tile && !occupied(intent.tile.x, intent.tile.y, enemy.id)) moveUnit(enemy, intent.tile);
  } else if (intent.type === 'blink') {
    if (intent.tile && !occupied(intent.tile.x, intent.tile.y, enemy.id)) {
      moveUnit(enemy, intent.tile);
      emitCombatFx(enemy, 'RIFT STEP', 'cue', { burst: true, shake: false });
      addLog(`${enemy.name} slips through a rift and lands beside ${target?.name || 'the party'}.`);
    }
  } else if (intent.type === 'mark') {
    if (target?.alive && !target.status.includes('marked')) {
      target.status.push('marked');
      haptic('warning');
      emitCombatFx(target, 'MARKED', 'status', { burst: false, shake: false });
      addLog(`${enemy.name} marks ${target.name}; the next enemy hit will deal +1 damage.`);
    }
  } else if (intent.type === 'quake' || intent.type === 'webfall') {
    emitCombatFx(enemy, intent.type === 'quake' ? 'QUAKE' : 'WEBFALL', 'status', { burst: true, shake: false });
  } else if (intent.type === 'hazard') {
    if (intent.tile && !isHazard(intent.tile.x, intent.tile.y)) {
      state.battle.hazards.push({ x: intent.tile.x, y: intent.tile.y, type: 'bramble' });
      const hazardTarget = getUnit(intent.targetId);
      if (hazardTarget) emitCombatFx(hazardTarget, 'BRAMBLE', 'status', { burst: false, shake: false });
      addLog(`${enemy.name} twists the floor into bramble.`);
    }
  } else if (intent.type === 'guard') enemy.guard = 2;
  executeBossMechanic(enemy, target);
}

function resolveEnemyPhase() {
  if (!state.battle || state.battle.outcome) return;
  const enemyList = [...living('enemy')].sort((a, b) => a.id.localeCompare(b.id));
  enemyList.forEach(enemy => executeIntent(enemy, state.battle.intents[enemy.id]));
  getUnits().filter(unit => unit.alive && unit.status.includes('burn')).forEach(unit => {
    damageUnit(unit, 1 + relicLevel('venom-quill'), 'Burn');
    emitCombatFx(unit, 'BURN', 'status', { burst: false, shake: false });
    unit.status = unit.status.filter(status => status !== 'burn');
  });
  getUnits().filter(unit => unit.alive && unit.status.includes('poison')).forEach(unit => {
    damageUnit(unit, 1 + relicLevel('venom-quill'), 'Poison');
    emitCombatFx(unit, 'POISON', 'status', { burst: false, shake: false });
    unit.status = unit.status.filter(status => status !== 'poison');
  });
  if (living('ally').length === 0) return finishBattle('defeat');
  if (state.battle.round >= (state.battle.maxRounds || MAX_ROUNDS)) return finishBattle(state.battle.boss || state.battle.subBoss ? 'defeat' : 'victory');
  state.battle.round += 1;
  living('ally').forEach(hero => { hero.acted = false; hero.moved = false; hero.roundAttackUsed = false; hero.mirrorWardUsed = false; hero.guard = Math.max(0, hero.guard - 1); hero.abilityUsed = false; });
  state.battle.combo = { count: 0, multiplier: 1 };
  state.battle.synergyTriggers = {};
  state.battle.phase = 'plan';
  refreshIntents();
  selectedUnitId = living('ally')[0]?.id || null;
  addLog(`Round ${state.battle.round}. The ward is still holding.`);
  persist('Round advanced');
  render();
}

function recordRunTelemetry(outcome) {
  if (!state.battle || state.battle.historyRecorded) return;
  const synergies = activeMetaSynergies().map(synergy => synergy.id);
  state.history.unshift({
    id: `${Date.now()}-${state.battle.seed}`,
    date: new Date().toISOString(),
    outcome,
    floor: state.battle.floor || state.expedition.floor,
    seed: state.battle.seed,
    rounds: state.battle.round,
    boss: state.battle.boss?.key || null,
    bossName: state.battle.boss?.name || null,
    prestige: state.battle.prestige || 0,
    subBoss: state.battle.subBoss?.key || null,
    startingClass: state.meta.startingClass,
    party: state.battle.heroes.map(unitClassId),
    relics: [...state.expedition.relics],
    metaNodes: [...state.meta.unlocked],
    synergies
  });
  state.history = state.history.slice(0, 40);
  state.battle.historyRecorded = true;
  evaluateAchievements();
}

function finishBattle(outcome) {
  if (state.battle.outcome) return;
  haptic(outcome === 'victory' ? 'victory' : 'warning');
  stopBattleMusic();
  recordRunTelemetry(outcome);
  awardPartyClassXP(outcome);
  state.battle.outcome = outcome;
  state.battle.phase = 'result';
  if (outcome === 'victory') {
    const clearedFloor = state.battle.floor || state.expedition.floor;
    if (!state.expedition.completed.includes(`floor-${clearedFloor}`)) state.expedition.completed.push(`floor-${clearedFloor}`);
    state.expedition.runComplete = clearedFloor >= MAX_FLOOR;
    state.expedition.floor = state.expedition.runComplete ? MAX_FLOOR + 1 : clearedFloor + 1;
    state.meta.party = normalizePartyFormation(state.meta.party, state.meta.startingClass, state.meta.unlocked, partySizeForFloor(state.expedition.floor), state.meta.companionUnlocked);
    unlockClassesForFloor(state.expedition.floor);
    const subBossBonus = state.battle.subBoss ? 2 : 0;
    const bigBadBonus = state.battle.boss?.bigBad ? 8 + state.battle.boss.prestige * 2 : 0;
    const shardReward = 3 + (state.meta.unlocked.includes('ember-well') ? 1 : 0) + (hasMetaSynergy('deep-reserve') ? 1 : 0) + (state.meta.unlocked.includes('legendary-emberheart') ? 2 : 0) + relicLevel('shard-purse') + subBossBonus + bigBadBonus;
    state.expedition.emberShards += shardReward;
    state.meta.shards += 3 + (state.battle.boss?.bigBad ? 5 + state.battle.boss.prestige : 0);
    const bossDrop = state.battle.boss?.relic ? BOSS_RELICS[state.battle.boss.relic] : null;
    if (bossDrop && !hasRelic(state.battle.boss.relic)) state.expedition.relics.push(state.battle.boss.relic);
    const roomReward = state.battle.boss?.bigBad ? `${state.battle.boss.name} defeated · ` : state.battle.subBoss ? `${state.battle.subBoss.name} defeated · ` : '';
    state.expedition.lastReward = bossDrop ? `${shardReward} ember shards · ${bossDrop.name} · ${roomReward}room ${clearedFloor} cleared` : `${shardReward} ember shards · ${roomReward}room ${clearedFloor} cleared${state.expedition.runComplete ? ' · 1,000-floor descent complete' : ''}`;
    addLog(bossDrop ? `${bossDrop.name} drops from the boss heart.` : state.battle.subBoss ? `${state.battle.subBoss.name} yields a two-shard bounty.` : `Room ${clearedFloor} answers with a low, warm note.`);
    persist('Expedition room complete');
    toast(state.expedition.runComplete ? 'Worldbreaker defeated. All 1,000 floors are complete.' : state.battle.boss?.bigBad ? `${state.battle.boss.name} defeated. Prestige rewards secured.` : state.battle.subBoss ? 'Sub-boss defeated. Bonus ember shards secured.' : bossDrop ? `${bossDrop.name} acquired.` : 'Room secured.', true);
  } else {
    persist('Defeat recorded');
    toast('The dark gets the last word.', true);
  }
  render();
}

function exportSave() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'hexfall-save.json';
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Save exported');
}

function importSave(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (imported?.version !== 1 || !imported.expedition || !Array.isArray(imported.expedition.completed)) throw new Error('Invalid save');
      Object.assign(state, imported);
      persist('Save imported');
      render();
    } catch (error) { toast('That file is not a valid Hexfall save.', true); }
  };
  reader.readAsText(file);
}

function hexVertices(cx, cy, radius = 34, depth = 0) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) + depth };
  });
}
function hexPoints(cx, cy, radius = 34) {
  return hexVertices(cx, cy, radius).map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
}
function extrudedHexFaces(cx, cy, radius = 34, depth = 9, classes = '') {
  const top = hexVertices(cx, cy, radius);
  const bottom = hexVertices(cx, cy, radius, depth);
  return [[1, 2], [2, 3], [3, 4]].map(([a, b], index) => `<polygon class="${classes} hex-side-${index}" points="${top[a].x.toFixed(1)},${top[a].y.toFixed(1)} ${top[b].x.toFixed(1)},${top[b].y.toFixed(1)} ${bottom[b].x.toFixed(1)},${bottom[b].y.toFixed(1)} ${bottom[a].x.toFixed(1)},${bottom[a].y.toFixed(1)}"></polygon>`).join('');
}
function svgPoint(cell) { return { cx: 66 + cell.x * 67 + (cell.y % 2) * 33, cy: 68 + cell.y * 59 }; }

function buyMeta(id) {
  const node = META_NODES[id];
  if (!node || state.meta.unlocked.includes(id)) return;
  const missing = (node.prerequisites || []).filter(prerequisite => !state.meta.unlocked.includes(prerequisite));
  if (missing.length) return toast(`Requires ${missing.map(item => META_NODES[item]?.name || item).join(' + ')}.`, true);
  if (state.meta.shards < node.cost) return toast('Not enough meta-shards yet.', true);
  state.meta.shards -= node.cost;
  state.meta.unlocked.push(id);
  evaluateAchievements();
  persist(Object.hasOwn(STARTING_CLASSES, id) ? `${node.name} unlocked as a Main Class.` : `${node.name} unlocked permanently`);
  render();
}

function buyClassNode(classId, suffix) {
  if (!STARTING_CLASSES[classId] || !CLASS_TREE_UPGRADES.some(node => node.suffix === suffix)) return;
  const node = CLASS_TREE_UPGRADES.find(item => item.suffix === suffix);
  if (classNodeOwned(classId, suffix)) return;
  const missing = (node.prerequisites || []).filter(prerequisite => !classNodeOwned(classId, prerequisite));
  if (missing.length) return toast(`Requires ${missing.map(id => CLASS_TREE_UPGRADES.find(item => item.suffix === id)?.name || id).join(' + ')} first.`, true);
  if (state.meta.shards < node.cost) return toast(`Need ${node.cost - state.meta.shards} more meta-shards.`, true);
  state.meta.shards -= node.cost;
  state.meta.classNodes[classId] ||= [];
  state.meta.classNodes[classId].push(suffix);
  persist(`${className(classId)} learned ${node.name}`);
  render();
}
function chooseStartingClass(classKey) {
  if (classKey !== 'warden' && !state.meta.unlocked.includes(classKey)) return;
  if (state.battle && !state.battle.outcome) return toast('Finish the active battle before changing your main class.', true);
  state.meta.startingClass = classKey;
  state.meta.party = normalizePartyFormation(state.meta.party, classKey, state.meta.unlocked, partySizeForFloor(state.expedition.floor), state.meta.companionUnlocked);
  persist(`${STARTING_CLASSES[classKey].name} selected for the next floor`);
  render();
}

function renderMetaTreeArt() {
  const generalIds = ['cinder-core', 'iron-roots', 'ward-lattice', 'field-rations', 'quickstep-archive', 'companion-oath', 'battlefield-cache', 'rallying-step'];
  const classNodes = classTreeNodes(coreClassId());
  const splitLabel = label => label.split(' ').map((word, index, words) => `<tspan x="0" dy="${index ? 9 : 0}">${word}${index === words.length - 1 ? '' : ''}</tspan>`).join('');
  const nodeSvg = (id, x, y, label, owned, accent = 'ember') => `<g class="tree-map-node ${owned ? 'owned' : ''} tree-node-${accent}" transform="translate(${x} ${y})"><title>${label}</title><circle class="tree-node-halo" r="16"></circle><circle class="tree-node-core ${owned ? 'unlocked' : ''}" r="7"></circle><text y="27" text-anchor="middle">${splitLabel(label)}</text></g>`;
  const treeSvg = (ids, isClass = false) => {
    if (isClass) {
      const points = { 'tempered-sigil': [115, 128], 'sharpened-instinct': [345, 128], 'iron-will': [115, 67], 'far-reach': [345, 67], 'focused-core': [115, 14], quickstep: [345, 14] };
      const bySuffix = Object.fromEntries(ids.map(node => [node.suffix, node]));
      const rootEdges = ids.filter(node => !(node.prerequisites || []).length).map(node => { const [x, y] = points[node.suffix]; return `<path class="growth-branch ${classNodeOwned(coreClassId(), node.suffix) ? 'active' : ''}" d="M230 184 L${x} ${y + 10}"></path>`; }).join('');
      const dependencyEdges = ids.flatMap(node => (node.prerequisites || []).map(parentSuffix => { const [px, py] = points[parentSuffix]; const [x, y] = points[node.suffix]; return `<path class="growth-branch ${classNodeOwned(coreClassId(), node.suffix) ? 'active' : ''}" d="M${px} ${py - 8} L${x} ${y + 8}"></path>`; })).join('');
      const nodes = ids.map(node => { const [x, y] = points[node.suffix]; return nodeSvg(node.id, x, y, node.name, classNodeOwned(coreClassId(), node.suffix), 'cyan'); }).join('');
      return `<svg viewBox="0 0 460 210" role="img" aria-label="${className(coreClassId())} selected class dependency tree"><path class="growth-branch active" d="M230 184 V174"></path>${rootEdges}${dependencyEdges}${nodes}<rect x="224" y="178" width="12" height="12" class="growth-root"></rect></svg>`;
    }
    const bottomCount = Math.ceil(ids.length / 2);
    const xPositions = bottomCount === 4 ? [55, 172, 288, 405] : bottomCount === 3 ? [78, 230, 382] : [115, 345];
    const positions = ids.map((_, index) => [xPositions[index % bottomCount], index < bottomCount ? 117 : 49]);
    const points = ids.map((id, index) => positions[index]);
    const lines = points.map(([x, y], index) => {
      const item = isClass ? ids[index] : ids[index];
      const owned = isClass ? classNodeOwned(coreClassId(), item.suffix) : state.meta.unlocked.includes(item);
      return index < bottomCount ? `<path class="growth-branch ${owned ? 'active' : ''}" d="M230 155 L${x} ${y + 18}"></path>` : `<path class="growth-branch ${owned ? 'active' : ''}" d="M${points[index - bottomCount][0]} ${points[index - bottomCount][1] - 3} L${x} ${y + 15}"></path>`;
    }).join('');
    const nodes = ids.map((item, index) => { const id = isClass ? item.id : item; const label = isClass ? item.name : META_NODES[id]?.name || id; const owned = isClass ? classNodeOwned(coreClassId(), item.suffix) : state.meta.unlocked.includes(id); return nodeSvg(id, points[index][0], points[index][1], label, owned, isClass ? 'cyan' : index > 3 ? 'gold' : 'ember'); }).join('');
    return `<svg viewBox="0 0 460 210" role="img" aria-label="${isClass ? `${className(coreClassId())} selected class upgrade tree` : 'General team upgrade tree'}"><path class="growth-branch active" d="M230 184 V155"></path>${lines}${nodes}<rect x="224" y="178" width="12" height="12" class="growth-root"></rect></svg>`;
  };
  return `<div class="meta-tree-art"><div class="meta-tree-art-label">TWO PATHS / PURCHASE MAP</div><div class="tree-map-grid"><section class="tree-map-panel"><strong>GENERAL TEAM TREE</strong><small>Formation-wide upgrades · buy any available branch</small>${treeSvg(generalIds)}</section><section class="tree-map-panel selected"><strong>${className(coreClassId()).toUpperCase()} TREE</strong><small>Selected Main Class · upgrades stay with this class</small>${treeSvg(classNodes, true)}</section></div><div class="meta-tree-art-caption">Root → branch → purchase · ${activeMetaSynergies().length} permanent synergies active</div></div>`;
}
function renderMeta() {
  const generalNodes = Object.entries(META_NODES).filter(([id]) => !Object.hasOwn(STARTING_CLASSES, id));
  const nodes = generalNodes.map(([id, node]) => {
    const owned = state.meta.unlocked.includes(id);
    const missing = (node.prerequisites || []).filter(prerequisite => !state.meta.unlocked.includes(prerequisite));
    const lockedByPrerequisite = missing.length > 0;
    return `<article class="meta-node-card ${owned ? 'owned' : ''} ${node.legendary ? 'legendary' : ''}"><div class="meta-node-head"><span class="meta-node-mark">${svgIcon(owned ? 'check' : node.legendary ? 'legendary' : 'node')}</span><div><h2>${node.name}</h2><span>${node.legendary ? 'LEGENDARY · ' : ''}${node.effect}</span></div></div><p>${node.description}</p>${node.prerequisites ? `<div class="prerequisite-line">Requires: ${node.prerequisites.map(prerequisite => META_NODES[prerequisite]?.name || prerequisite).join(' · ')}</div>` : ''}<div class="meta-node-footer"><strong>${owned ? 'OWNED · PERMANENT' : lockedByPrerequisite ? 'LOCKED · PREREQUISITES' : `${node.cost} META-SHARDS`}</strong><button class="secondary-button" data-meta="${id}" ${owned || lockedByPrerequisite || state.meta.shards < node.cost ? 'disabled' : ''}>${owned ? 'Owned' : lockedByPrerequisite ? 'View requirements' : 'Unlock benefit'}</button></div></article>`;
  }).join('');
  const ownedClasses = Object.entries(STARTING_CLASSES).filter(([id]) => id === 'warden' || state.meta.unlocked.includes(id));
  const classChoices = ownedClasses.map(([id, item]) => {
    const stats = mainClassStats(id);
    const selected = coreClassId() === id;
    return `<button class="main-class-choice ${selected ? 'selected' : ''}" data-class="${id}" aria-pressed="${selected}"><span class="main-class-choice-head"><span class="main-class-sigil">${characterSvg(id)}</span><span><strong>${item.name}</strong><small>${item.role}</small></span></span><span class="main-class-statline"><i>HP <b>${stats.hp}</b></i><i>DMG <b>${stats.damage}</b></i><i>RANGE <b>${stats.range}</b></i><i>MOVE <b>${stats.move}</b></i></span><span class="main-class-style"><b>MOVE</b><span>${item.movementStyle}</span></span><span class="main-class-style"><b>BASIC ATTACK</b><span>${item.attackStyle}</span></span><span class="main-class-signature"><b>SIGNATURE · ${item.ability}</b><span>${item.abilityText}</span></span><span class="main-class-choice-action">${selected ? 'ACTIVE MAIN CLASS' : 'MAKE MAIN CLASS'}</span></button>`;
  }).join('');
  const unboughtClasses = Object.entries(STARTING_CLASSES).filter(([id]) => id !== 'warden' && !state.meta.unlocked.includes(id));
  const classStore = unboughtClasses.map(([id, item]) => {
    const node = META_NODES[id];
    const stats = mainClassStats(id);
    return `<article class="locked-main-class" data-main-class="${id}"><div class="locked-main-class-head"><span class="main-class-sigil">${characterSvg(id)}</span><span><small>UNBOUGHT MAIN CLASS</small><strong>${item.name}</strong><em>${item.role}</em></span></div><p>${item.description}</p><div class="locked-class-stats"><span>${stats.hp} HP</span><span>${stats.damage} DMG</span><span>${stats.range} RANGE</span><span>${stats.move} MOVE</span></div><div class="locked-class-detail"><b>MOVE</b><span>${item.movementStyle}</span><b>BASIC ATTACK</b><span>${item.attackStyle}</span><b>SIGNATURE · ${item.ability}</b><span>${item.abilityText}</span></div><div class="locked-class-footer"><span>${node.cost} META-SHARDS</span><button class="secondary-button" data-meta="${id}" ${state.meta.shards < node.cost ? 'disabled' : ''}>Unlock class</button></div><small class="class-floor-note">Unlock this Main Class in the Meta Tree with Meta-shards.</small></article>`;
  }).join('');
  const synergyCards = META_SYNERGIES.map(synergy => `<article class="synergy-card ${hasMetaSynergy(synergy.id) ? 'active' : ''}"><div><strong>${synergy.name}</strong><span>${synergy.nodes.map(id => META_NODES[id]?.name || id).join(' + ')}</span></div><p>${synergy.description}</p><em>${hasMetaSynergy(synergy.id) ? 'ACTIVE · PERMANENT' : `UNLOCK BOTH · ${synergy.effect}`}</em></article>`).join('');
  const mainClass = coreClassId();
  const masteryLevel = coreLevelFor(mainClass);
  const classUpgradeCards = classTreeNodes(mainClass).map(node => { const owned = classNodeOwned(mainClass, node.suffix); const missing = (node.prerequisites || []).filter(prerequisite => !classNodeOwned(mainClass, prerequisite)); const locked = missing.length > 0; const requirementText = missing.map(id => CLASS_TREE_UPGRADES.find(item => item.suffix === id)?.name || id).join(' + '); return `<article class="class-upgrade-card ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}"><div class="meta-node-head"><span class="meta-node-mark">${svgIcon(owned ? 'check' : locked ? 'lock' : 'node')}</span><div><h3>${node.name}</h3><span>${node.effect}</span></div></div><p>${node.description}</p>${locked ? `<div class="class-prerequisite">Requires: ${requirementText}</div>` : ''}<div class="meta-node-footer"><strong>${owned ? 'OWNED · THIS CLASS' : locked ? 'LOCKED · FOLLOW THE BRANCH' : `${node.cost} META-SHARDS`}</strong><button class="secondary-button" data-class-node="${mainClass}:${node.suffix}" ${owned || locked || state.meta.shards < node.cost ? 'disabled' : ''}>${owned ? 'Owned' : locked ? 'Locked' : 'Buy upgrade'}</button></div></article>`; }).join('');
  const mainClassCount = ownedClasses.length;
  const generalOwned = generalNodes.filter(([id]) => state.meta.unlocked.includes(id)).length;
  app.innerHTML = `<section class="screen-shell meta-screen"><div class="meta-header"><div><div class="eyebrow">Permanent progression / Meta-shard tree</div><h1 class="display-title">The Meta Tree<br><em>remembers.</em></h1><p class="lede">Meta-shards are permanent. Keep team-wide benefits, main-class unlocks, and your chosen main-class mastery in separate branches so every upgrade is easy to understand.</p></div><div class="meta-wallet"><span>META-SHARDS</span><strong>${state.meta.shards}</strong><small>Permanent · earned from cleared floors</small></div></div>${renderMetaTreeArt()}<div class="tree-summary"><div><span>GENERAL BENEFITS</span><strong>${generalOwned} / ${generalNodes.length}</strong></div><div><span>MAIN CLASSES</span><strong>${mainClassCount} / ${Object.keys(STARTING_CLASSES).length}</strong></div><div><span>ACTIVE MAIN</span><strong>${className(mainClass)}</strong></div></div><nav class="tree-jump-nav" aria-label="Meta Tree sections"><a href="#general-benefits"><b>01</b> General team tree</a><a href="#main-classes"><b>02</b> Main class unlocks</a><a href="#selected-class-tree"><b>03</b> Selected class tree</a><a href="#branch-synergies"><b>04</b> Synergies</a></nav><section id="general-benefits" class="meta-section tree-section"><div class="section-heading"><div><span class="eyebrow">01 / EVERY EXPEDITION</span><h2>General team tree</h2></div><span>These purchases affect every formation and remain active when you change your leader.</span></div><div class="meta-grid">${nodes}</div></section><section id="main-classes" class="main-class-section tree-section"><div class="section-heading"><div><span class="eyebrow">02 / YOUR LEADER</span><h2>Main classes</h2></div><span>Your selected main class leads from slot one. Compare movement, basic attack, and signature before choosing.</span></div><div class="main-class-subhead"><span class="eyebrow">UNLOCKED · SELECT ONE</span><small>Changing your main class does not erase its own mastery ranks.</small></div><div class="main-class-choice-grid">${classChoices}</div>${unboughtClasses.length ? `<div class="main-class-subhead unbought-subhead"><span class="eyebrow">UNBOUGHT · META-SHARD UNLOCKS</span><small>Unlock any class here with Meta-shards; Main Classes never enter the companion roster.</small></div><div class="locked-main-class-grid">${classStore}</div>` : `<div class="all-classes-unlocked">Every main class has been unlocked. Choose any active leader above.</div>`}</section><section id="selected-class-tree" class="main-class-mastery tree-section"><div class="section-heading"><div><span class="eyebrow">03 / ONLY ${className(mainClass).toUpperCase()}</span><h2>Selected class tree</h2></div><span>These three ranks improve only ${className(mainClass)}. Each unlocked main class keeps its own mastery.</span></div><article class="main-mastery-card"><div class="main-mastery-sigil">${characterSvg(mainClass)}</div><div class="main-mastery-copy"><div class="main-mastery-title"><strong>${className(mainClass)} · RANK ${masteryLevel} / ${CORE_MAX_LEVEL}</strong><span>${masteryLevel >= CORE_MAX_LEVEL ? 'FULLY MASTERED' : `NEXT · ${CORE_UPGRADE_REWARDS[masteryLevel]}`}</span></div><p>Spend Meta-shards to permanently strengthen this main class without changing general benefits or companion XP levels.</p><div class="core-mastery-track"><i style="width:${Math.round((masteryLevel / CORE_MAX_LEVEL) * 100)}%"></i></div><small>${masteryLevel >= CORE_MAX_LEVEL ? 'MASTERY COMPLETE' : `Cost: ${CORE_UPGRADE_COSTS[masteryLevel]} Meta-shards`}</small></div><button class="primary-button" data-core-upgrade ${masteryLevel >= CORE_MAX_LEVEL || state.meta.shards < CORE_UPGRADE_COSTS[masteryLevel] ? 'disabled' : ''}>${masteryLevel >= CORE_MAX_LEVEL ? 'Mastered' : 'Upgrade this class'}</button></article><div class="class-upgrade-grid">${classUpgradeCards}</div></section><section id="branch-synergies" class="synergy-section tree-section"><div class="section-heading"><div><span class="eyebrow">04 / COMBINATION BONUSES</span><h2>Branch synergies</h2></div><span>Unlock both named benefits to activate each permanent combination.</span></div><div class="synergy-grid">${synergyCards}</div></section><div class="meta-bottom-actions"><button class="quiet-button" data-action="history-meta">Open run telemetry</button><button class="quiet-button" data-action="back-meta">Return to expedition</button></div></section>`;
  app.querySelectorAll('[data-meta]').forEach(button => button.addEventListener('click', () => buyMeta(button.dataset.meta)));
  app.querySelectorAll('[data-class-node]').forEach(button => button.addEventListener('click', () => { const [classId, suffix] = button.dataset.classNode.split(':'); buyClassNode(classId, suffix); }));
  app.querySelector('[data-core-upgrade]')?.addEventListener('click', upgradeCoreClass);
  app.querySelectorAll('[data-class]').forEach(button => button.addEventListener('click', () => chooseStartingClass(button.dataset.class)));
  ensureBattleMusic();
  animateMetaTree();
  app.querySelector('[data-action="back-meta"]').addEventListener('click', () => { stopBattleMusic(); state.screen = 'expedition'; render(); });
  app.querySelector('[data-action="history-meta"]').addEventListener('click', () => { stopBattleMusic(); state.screen = 'history'; render(); });
}

function renderPartyManagement(rosterLocked) {
  const options = companionPartyKinds();
  const partySize = partySizeForFloor(state.expedition.floor);
  const slots = state.meta.party.slice(0, partySize).map((kind, index) => {
    const mark = index === 0 ? coreClassId() : kind;
    const selectedClass = index === 0 ? coreClassId() : kind;
    const locked = rosterLocked;
    return `<label class="party-slot ${index === 0 ? 'core-slot' : ''}"><span class="party-slot-index">SLOT 0${index + 1}</span><span class="party-slot-sigil">${characterSvg(mark)}</span>${index === 0 ? `<div class="party-slot-fixed" aria-label="Fixed main class">${className(coreClassId())} · MAIN</div>` : `<select data-party-slot="${index}" aria-label="Choose companion for team slot ${index + 1}" ${locked ? 'disabled' : ''}>${options.map(option => `<option value="${option}" ${option === kind ? 'selected' : ''}>${className(option)}</option>`).join('')}</select>`}<small>${index === 0 ? `${className(coreClassId())} · MAIN CLASS · MASTERY RANK ${coreLevelFor()}` : `${className(selectedClass)} · LEVEL ${classLevel(selectedClass)}`}</small></label>`;
  }).join('');
  const progressionIds = [...new Set(state.meta.party.slice(1))];
  const rewards = ['', '+1 maximum health', '+1 base damage', '+1 movement', '+1 attack range'];
  const cards = progressionIds.map(id => { const level = classLevel(id); const xp = state.meta.classXP[id] || 0; const cost = classPromotionCost(id); const mastered = level >= CLASS_MAX_LEVEL; const progress = mastered ? 100 : Math.min(100, Math.round((xp / cost) * 100)); const action = mastered ? 'MASTERED' : xp >= cost ? `PROMOTE · ${cost} XP` : `NEED ${cost - xp} XP`; return `<article class="class-growth-card"><div class="class-growth-top"><span class="class-growth-sigil">${characterSvg(id)}</span><span class="class-growth-level">LEVEL ${level} / ${CLASS_MAX_LEVEL}</span></div><h3>${className(id)}${id === coreClassId() ? ' · MAIN CLASS' : ''}</h3><p>${mastered ? 'This class has reached its full potential.' : `Next promotion: ${rewards[level]}. Earn XP by taking this class into battle.`}</p><div class="class-xp-track"><i style="width:${progress}%"></i></div><div class="class-xp-line"><span>${mastered ? 'MAXIMUM LEVEL' : `${xp} / ${cost} XP`}</span><button class="quiet-button" data-class-upgrade="${id}" ${rosterLocked || mastered || xp < cost || id === coreClassId() ? 'disabled' : ''}>${id === coreClassId() ? 'META TREE' : action}</button></div></article>`; }).join('');
  const nextUnlock = Object.entries(STARTING_CLASSES).find(([id]) => id !== 'warden' && !state.meta.unlocked.includes(id));
  const prestige = prestigeLevelForFloor(state.expedition.floor);
  const nextPartyPrestige = partySize >= MAX_TEAM_SIZE ? null : Math.max(2, (partySize - BASE_TEAM_SIZE + 1) * 2);
  const nextPartyFloor = nextPartyPrestige ? nextPartyPrestige * 100 + 1 : null;
  const slotCopy = nextPartyPrestige ? `next companion at Prestige ${PRESTIGE_ROMANS[nextPartyPrestige]} / floor ${nextPartyFloor}` : 'maximum team size reached';
  const unlockCopy = state.expedition.runComplete ? 'Full roster · final descent complete' : `${nextUnlock ? `Next Main Class · ${className(nextUnlock[0])} in Meta Tree` : 'Every Main Class unlocked'} · ${slotCopy}`;
  const synergyCards = COMPANION_SYNERGIES.map(synergy => { const active = activeCompanionSynergies().some(item => item.id === synergy.id); return `<article class="companion-synergy-card ${active ? 'active' : ''}" style="--synergy-accent:${synergy.accent}"><div><span class="synergy-pair">${synergy.pair.map(className).join(' + ')}</span><strong>${synergy.name}</strong></div><p>${synergy.trait}</p><small>${active ? 'ACTIVE IN FORMATION' : 'PAIR TO UNLOCK'} · ${synergy.effect}</small></article>`; }).join('');
  return `<section class="party-management"><div class="party-management-head"><div><span class="eyebrow">Formation / Archive roster</span><h2>Build your descent team.</h2><p>${rosterLocked ? 'The active battle has locked this formation.' : 'Your main class is fixed in slot one. Companions are recruited in the shard shop; duplicate companions are allowed. Every two prestige ranks adds one companion.'}</p></div><span class="party-unlock-note">${unlockCopy}</span></div><div class="party-slots">${slots}</div><section class="companion-synergy-panel"><div class="eyebrow">Companion pairings / bonus traits</div><div class="companion-synergy-grid">${synergyCards}</div></section><div class="class-growth-heading"><span class="eyebrow">Companion growth</span><span>Companions earn XP · promote them here · upgrade your main class with Meta-shards in the Meta Tree</span><button class="quiet-button" data-action="core-tree">Upgrade ${className(coreClassId())} in Meta Tree →</button></div><div class="class-growth-grid">${cards}</div></section>`;
}

function resetExpedition() {
  const nextMeta = { ...state.meta, party: normalizePartyFormation(state.meta.party, state.meta.startingClass, state.meta.unlocked, BASE_TEAM_SIZE, state.meta.companionUnlocked) };
  const next = freshState(nextMeta);
  next.history = state.history;
  next.achievements = state.achievements;
  next.settings = state.settings;
  Object.assign(state, next);
  persist('New expedition ready');
  render();
}

function beginNewExpedition() {
  const hasProgress = state.expedition.floor > 1 || state.expedition.completed.length > 0 || state.expedition.emberShards > 0 || state.expedition.relics.length > 0 || Boolean(state.battle && !state.battle.outcome);
  if (!hasProgress) return resetExpedition();
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop reset-backdrop';
  modal.innerHTML = `<div class="modal reset-modal" role="dialog" aria-modal="true" aria-labelledby="new-run-title"><button class="modal-close" data-action="cancel" aria-label="Keep current run">×</button><div class="eyebrow">Start over / current run</div><h2 id="new-run-title">Begin a new expedition?</h2><p>Your current floor, ember shards, run relics, and any active battle will reset. Your permanent unlocks, meta-shards, party, class XP and levels, badges, run history, and settings will stay.</p><div class="button-row"><button class="secondary-button" data-action="cancel">Keep this run</button><button class="danger-button" data-action="confirm">Start new expedition</button></div></div>`;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelectorAll('[data-action="cancel"]').forEach(button => button.addEventListener('click', close));
  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => { modal.remove(); resetExpedition(); });
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  modal.querySelector('[data-action="cancel"]').focus();
}

function renderHubOverview() {
  return `<section class="seo-about" aria-labelledby="seo-overview-title">
    <div class="seo-about-heading">
      <p class="eyebrow">THE DESCENT / FIELD GUIDE</p>
      <h2 id="seo-overview-title">A thousand floors of tactical descent.</h2>
      <p>Hexfall: Hexa Battle is a turn-based hex dungeon crawler about reading enemy intent, placing your party, and choosing the right moment to spend each signature.</p>
    </div>
    <div class="seo-about-grid">
      <article><span>01 / COMBAT</span><h3>Win the hexes</h3><p>Move, attack, guard, and use class abilities in readable turn-based battles. Sub-bosses arrive every five rooms, full bosses every ten, and a Big Bad waits every hundred floors.</p></article>
      <article><span>02 / FORMATION</span><h3>Shape your party</h3><p>Choose from ten distinct Main Classes, recruit companions, and repeat a class when its tactics fit your formation. Companions earn experience while Main-Class mastery grows permanently.</p></article>
      <article><span>03 / RELICS</span><h3>Prepare between rooms</h3><p>Every two cleared rooms, a shifting market offers eight relics from a 21-item catalogue. Upgrade owned relics through tiers I–III and adapt your run to the next threat.</p></article>
      <article><span>04 / PRESTIGE</span><h3>Descend farther</h3><p>Clear the 100-floor standard descent, then press through Prestige I–IX. Enemies strengthen, battlefields expand, and the party grows to seven heroes.</p></article>
    </div>
  </section>`;
}

function renderExpedition() {
  const treeButtonArt = renderMetaTreeArt().match(/<svg\b[^>]*>[\s\S]*?<\/svg>/)?.[0]?.replace('<svg ', '<svg class="hub-tree-svg" aria-hidden="true" ') || '';
  const hasSave = Boolean(state.battle && !state.battle.outcome);
  const runComplete = Boolean(state.expedition.runComplete);
  const floor = Math.min(MAX_FLOOR, state.expedition.floor);
  state.meta.party = normalizePartyFormation(state.meta.party, state.meta.startingClass, state.meta.unlocked, partySizeForFloor(floor), state.meta.companionUnlocked);
  const partySize = partySizeForFloor(floor);
  const prestige = prestigeLevelForFloor(floor);
  const board = boardDimensionsForFloor(floor);
  const cleared = state.expedition.completed.length;
  const nextMarketRoom = floor % 2 === 0 ? floor + 2 : floor + 1;
  const previewPositions = deploymentPositions(partySize, board);
  const team = state.battle?.heroes || state.meta.party.slice(0, partySize).map((kind, index) => cloneUnit(`preview-${kind}-${index}`, 'ally', kind, previewPositions[index], null, floor));
  const teamStatus = team.map(hero => `<div class="team-status-row"><span class="team-status-gem ${hero.alive === false ? 'down' : ''}">${characterSvg(hero.kind === 'warden' ? (hero.startingClass || state.meta.startingClass) : hero.kind)}</span><span class="team-status-name">${hero.name}</span><span class="team-status-hp">${hero.hp}/${hero.maxHp}</span><span class="team-status-bar"><i style="width:${Math.max(0, (hero.hp / hero.maxHp) * 100)}%"></i></span></div>`).join('');
  app.innerHTML = `<main class="screen-shell expedition-home"><section class="expedition-layout">
    <div class="expedition-copy">
      <div class="eyebrow">Procedural run / seed ${state.expedition.seed}</div>
      <h1 class="display-title">${runComplete ? 'The 1,000th floor' : `Floor ${floor}`}<br><em>${runComplete ? 'is conquered.' : 'is waiting.'}</em></h1>
      <p class="lede">${runComplete ? 'The final Big Bad has fallen. Your 1,000-floor descent is complete; start a new expedition whenever you are ready.' : `The first 100 floors are the standard descent. Each new 100-floor band raises Prestige; every two prestige ranks adds one companion and stronger enemies. The board grows with each prestige. Bring ${partySize} heroes, face a Big Bad every 100th floor, and visit the market after every two cleared rooms.`}</p>
      <div class="expedition-steps"><span class="eyebrow">${runComplete ? 'EXPEDITION COMPLETE' : 'QUICK START'}</span><ol><li><b>1</b><span>${runComplete ? '1,000 floors cleared' : `Choose a main class + ${partySize - 1} companions`}</span></li><li><b>2</b><span>${runComplete ? 'Prestige IX · final Big Bad defeated' : 'Move (optional), then act'}</span></li><li><b>3</b><span>${runComplete ? 'Begin a new expedition below' : 'Shop every 2 rooms; descend'}</span></li></ol></div>
      <div class="button-row">
        ${runComplete ? '<button class="primary-button" disabled>Run complete · 1,000 floors</button>' : hasSave ? '<button class="primary-button" data-action="continue">Resume floor</button>' : `<button class="primary-button" data-action="battle">Enter floor ${floor}</button>`}
        <button class="secondary-button" data-action="new">New expedition</button>
      </div>
      <div class="hub-destinations" aria-label="Expedition destinations">
        <button class="hub-destination tree-destination" data-action="meta" aria-label="Open the Meta Tree and permanent upgrades">
          <span class="hub-destination-art tree-destination-art" aria-hidden="true">${treeButtonArt}</span>
          <span class="hub-destination-copy"><span class="hub-destination-kicker">PERMANENT PROGRESSION</span><strong>Meta Tree</strong><span class="hub-destination-description">Spend ${state.meta.shards} Meta-shards · strengthen your Main Class and unlock paths.</span></span>
          <span class="hub-destination-arrow" aria-hidden="true">↗</span>
        </button>
        <button class="hub-destination archive-destination" data-action="history" aria-label="Open the Expedition Archive">
          <span class="hub-destination-art archive-destination-art" aria-hidden="true"><svg class="archive-svg" viewBox="0 0 160 140" fill="none"><path class="archive-case" d="M29 48h102v73H29z"/><path class="archive-lid" d="M21 31h118v22H21z"/><path class="archive-rim" d="M35 24h90v7H35zM39 55v61M121 55v61"/><path class="archive-seal" d="m80 63 15 9v18l-15 9-15-9V72l15-9Z"/><path class="archive-mark" d="M74 77h12M74 84h12M80 72v18"/><path class="archive-base" d="M23 121h114M37 112h10M113 112h10"/></svg></span>
          <span class="hub-destination-copy"><span class="hub-destination-kicker">RUNS · BADGES · RECORDS</span><strong>Expedition Archive</strong><span class="hub-destination-description">Review past descents, achievements, and your best floor.</span></span>
          <span class="hub-destination-arrow" aria-hidden="true">↗</span>
        </button>
      </div>
      <div class="note-list">
        <div class="note-row"><span>Run seed</span><strong class="mono">${state.expedition.seed}</strong></div>
        <div class="note-row"><span>Floors cleared</span><strong>${cleared}</strong></div>
        <div class="note-row"><span>Carry</span><strong>${state.expedition.emberShards} ember shards</strong></div>
      </div>
      
    </div>
    <div class="expedition-aside">
      <div class="run-dashboard"><div class="dashboard-kicker">RUN STATUS / LIVE ARCHIVE</div><div class="floor-readout"><span class="floor-index">${String(floor).padStart(2, '0')}</span><div><strong>${runComplete ? '1,000-FLOOR RUN COMPLETE' : roomTypeLabel(floor)}</strong><small>${runComplete ? 'All prestige bands cleared' : `${prestigeLabelForFloor(floor)} · market after room ${nextMarketRoom}`}</small></div></div><div class="dashboard-divider"></div><div class="dashboard-section"><div class="dashboard-section-title">TEAM CONDITION · ${partySize} ACTIVE</div>${teamStatus}</div><div class="dashboard-section"><div class="dashboard-section-title">NEXT GENERATION · PRESTIGE ${PRESTIGE_ROMANS[prestige] || '0'}</div><div class="generation-grid"><span><b>${enemyCountForFloor(floor)}</b><small>threats</small></span><span><b>${hazardCountForFloor(floor)}</b><small>hazards</small></span><span><b>${board.cols}×${board.rows}</b><small>battlefield</small></span></div></div><div class="dashboard-footer"><span>FLOORS CLEARED ${cleared}</span><span>${state.expedition.lastReward || 'No reward logged'}</span></div></div>${renderTrophyRoom()}
    </div>
  </section>${renderPartyManagement(hasSave)}${renderHubOverview()}</main>`;
  app.querySelectorAll('[data-action="battle"]').forEach(button => button.addEventListener('click', startBattle));
  app.querySelector('[data-action="continue"]')?.addEventListener('click', () => { state.screen = state.battle ? 'battle' : 'expedition'; render(); });
  app.querySelector('[data-action="new"]')?.addEventListener('click', beginNewExpedition);
  app.querySelector('[data-action="meta"]')?.addEventListener('click', () => { state.screen = 'meta'; render(); });
  app.querySelector('[data-action="core-tree"]')?.addEventListener('click', () => { state.screen = 'meta'; render(); });
  app.querySelectorAll('[data-party-slot]').forEach(select => select.addEventListener('change', () => setPartySlot(Number(select.dataset.partySlot), select.value)));
  app.querySelectorAll('[data-class-upgrade]').forEach(button => button.addEventListener('click', () => upgradeClass(button.dataset.classUpgrade)));
  app.querySelector('[data-action="history"]')?.addEventListener('click', () => { state.screen = 'history'; render(); });
  app.querySelectorAll('[data-showcase]').forEach(button => button.addEventListener('click', () => toggleShowcase(button.dataset.showcase)));
  app.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => openTrophyPreview(button.dataset.preview)));
  ensureBattleMusic();
}

function renderTrophyRoom() {
  const showcased = state.achievements.showcase || [];
  const legendaryCount = showcased.filter(id => id.includes('forged') || id === 'legendary-triad').length;
  const ambientParticles = Array.from({ length: 8 + legendaryCount * 8 }, (_, index) => `<i class="trophy-ambient-particle" style="--particle-x:${(index * 37) % 100}%;--particle-y:${(index * 61) % 100}%;--particle-delay:${(index % 9) * -0.7}s;--particle-size:${2 + (index % 3)}px"></i>`).join('');
  const plinths = Array.from({ length: 6 }, (_, index) => {
    const achievement = ACHIEVEMENTS.find(item => item.id === showcased[index]);
    return achievement ? `<div class="trophy-plinth filled"><button class="trophy-preview" data-preview="${achievement.id}" title="Inspect ${achievement.name}"><span>${svgIcon(achievement.icon)}</span><strong>${achievement.name}</strong><small>INSPECT</small></button><button class="trophy-remove" data-showcase="${achievement.id}" title="Remove ${achievement.name}">×</button></div>` : `<div class="trophy-plinth"><span>${svgIcon('node')}</span><small>EMPTY PLINTH</small></div>`;
  }).join('');
  return `<section class="trophy-room" style="--legendary-count:${legendaryCount};--legendary-glow:${(.04 + legendaryCount * .035).toFixed(3)};--legendary-radius:${18 + legendaryCount * 12}px"><div class="trophy-ambient">${ambientParticles}</div><div class="trophy-heading"><span class="eyebrow">Hub showcase / trophy room</span><span>${showcased.length} / 6 displayed · ${legendaryCount} legendary</span></div><div class="trophy-plinth-grid">${plinths}</div><div class="trophy-room-note">Earn badges in telemetry, then inspect or pin your favorites here.</div></section>`;
}

function renderHistory() {
  const newlyEarned = evaluateAchievements();
  if (newlyEarned.length) persist(null);
  const records = state.history || [];
  const victories = records.filter(record => record.outcome === 'victory').length;
  const bestFloor = records.reduce((best, record) => Math.max(best, Number(record.floor) || 0), 0);
  const synergyTotals = META_SYNERGIES.map(synergy => ({ ...synergy, count: records.filter(record => record.synergies?.includes(synergy.id)).length })).sort((a, b) => b.count - a.count);
  const rows = records.length ? records.map(record => { const relics = record.relics || []; const synergies = record.synergies || []; return `<article class="history-row"><div class="history-result ${record.outcome}"><strong>${record.outcome === 'victory' ? 'CLEARED' : 'FELL'}</strong><span>ROOM ${String(record.floor).padStart(2, '0')}</span></div><div class="history-main"><strong>${STARTING_CLASSES[record.startingClass]?.name || record.startingClass} expedition</strong><span class="mono">${record.seed} · ${record.rounds} round${record.rounds === 1 ? '' : 's'}${record.boss ? ` · ${record.bossName || BOSS_DEFS[record.boss]?.name || record.boss}` : record.subBoss ? ` · ${SUB_BOSS_DEFS[record.subBoss]?.name || 'Sub-boss'}` : ''}</span></div><div class="history-detail"><span>${relics.length} relic${relics.length === 1 ? '' : 's'}</span><span>${synergies.length} synerg${synergies.length === 1 ? 'y' : 'ies'}</span><time>${new Date(record.date).toLocaleDateString()}</time></div></article>`; }).join('') : '<div class="history-empty">No completed runs yet. Your first clear or defeat will be archived here.</div>';
  const synergyRows = synergyTotals.map(synergy => `<div class="telemetry-synergy"><span>${synergy.name}</span><i><b style="width:${records.length ? Math.min(100, (synergy.count / records.length) * 100) : 0}%"></b></i><strong>${synergy.count}</strong></div>`).join('');
  const earnedBadges = state.achievements.earned;
  const badgeRows = ACHIEVEMENTS.map(achievement => { const earned = earnedBadges.includes(achievement.id); const showcased = state.achievements.showcase.includes(achievement.id); return `<article class="badge-card ${earned ? 'earned' : 'locked'}"><span class="badge-icon">${svgIcon(achievement.icon)}</span><div><strong>${achievement.name}</strong><p>${achievement.description}</p></div><div class="badge-actions"><em>${earned ? 'EARNED' : 'LOCKED'}</em>${earned ? `<button class="badge-pin ${showcased ? 'pinned' : ''}" data-showcase="${achievement.id}">${showcased ? 'PINNED' : 'PIN'}</button>` : ''}</div></article>`; }).join('');
  app.innerHTML = `<section class="screen-shell history-screen"><div class="history-header"><div><div class="eyebrow">Archive telemetry / run history</div><h1 class="display-title">The archive<br><em>keeps score.</em></h1><p class="lede">Every run leaves a compact trace: outcome, seed, relic loadout, main class, and the synergy branches active at the time.</p></div><div class="history-actions"><button class="secondary-button" data-action="history-meta">Open meta-tree</button><button class="quiet-button" data-action="history-back">Return to run status</button></div></div><div class="telemetry-stats"><div><span>RUNS LOGGED</span><strong>${records.length}</strong></div><div><span>VICTORIES</span><strong>${victories}</strong></div><div><span>BEST FLOOR</span><strong>${bestFloor || '—'}</strong></div><div><span>WIN RATE</span><strong>${records.length ? `${Math.round((victories / records.length) * 100)}%` : '—'}</strong></div></div><section class="telemetry-section"><div class="section-heading"><span class="eyebrow">Achievement badges</span><span>${earnedBadges.length} / ${ACHIEVEMENTS.length} earned</span></div><div class="badge-grid">${badgeRows}</div></section><section class="telemetry-section"><div class="section-heading"><span class="eyebrow">Synergy telemetry</span><span>Runs with each branch active</span></div><div class="telemetry-synergy-list">${synergyRows}</div></section><section class="telemetry-section"><div class="section-heading"><span class="eyebrow">Recent runs</span><span>${records.length} / 40 retained locally</span></div><div class="history-list">${rows}</div></section></section>`;
  app.querySelector('[data-action="history-back"]').addEventListener('click', () => { state.screen = 'expedition'; render(); });
  app.querySelector('[data-action="history-meta"]').addEventListener('click', () => { state.screen = 'meta'; render(); });
  app.querySelectorAll('[data-showcase]').forEach(button => button.addEventListener('click', () => toggleShowcase(button.dataset.showcase)));
  ensureBattleMusic();
}

function renderTimeline() {
  const units = getUnits().sort((a, b) => (a.side === b.side ? a.id.localeCompare(b.id) : a.side === 'ally' ? -1 : 1));
  return `<div class="timeline"><span class="timeline-label">ORDER</span>${units.map(unit => `<button type="button" class="timeline-unit ${unit.side} ${unit.id === selectedUnitId ? 'active' : ''} ${unit.acted ? 'spent' : ''} ${!unit.alive ? 'dead' : ''}" data-unit="${unit.id}" aria-label="${unit.side === 'ally' ? 'Select' : 'Target'} ${unit.name}${unit.acted ? ', turn spent' : ''}"><span class="timeline-sigil">${characterSvg(unitSigilKey(unit))}</span>${unit.name}</button>`).join('')}</div>`;
}

function unitInsignia(unit, point) {
  const sigilKey = unitSigilKey(unit);
  const artwork = SIGIL_ART[sigilKey] || SIGIL_ART.warden;
  return `<g class="unit-insignia insignia-${sigilKey}" transform="translate(${point.cx} ${point.cy})" aria-hidden="true"><circle class="unit-core-ring" r="18"></circle><g transform="translate(-16 -16)">${SIGIL_FRAME}${artwork}</g></g>`;
}

function renderBoard() {
  const battle = state.battle;
  const selected = getUnit(selectedUnitId);
  const reachableKeys = selected && selected.side === 'ally' && !selected.moved && !selected.acted && actionMode === 'move' ? new Set(reachable(selected).map(cell => key(cell.x, cell.y))) : new Set();
  const targetKeys = selected && selected.side === 'ally' && !selected.acted && (actionMode === 'attack' || (actionMode === 'ability' && abilityNeedsEnemyTarget(selected))) ? new Set(living('enemy').filter(enemy => distance(selected, enemy) <= (actionMode === 'ability' ? abilityTargetRange(selected) : selected.range)).map(enemy => key(enemy.x, enemy.y))) : new Set();
  const cells = validCells();
  const cellSvg = cells.map(cell => {
    const point = svgPoint(cell); const k = key(cell.x, cell.y);
    const classes = ['hex'];
    if (reachableKeys.has(k)) classes.push('reachable');
    if (targetKeys.has(k)) classes.push('targetable');
    if (selected && selected.x === cell.x && selected.y === cell.y) classes.push('selected');
    if (isHazard(cell.x, cell.y, 'bramble')) classes.push('hazard');
    if (isHazard(cell.x, cell.y, 'objective')) classes.push('objective');
    return `<g class="cell" data-x="${cell.x}" data-y="${cell.y}">${extrudedHexFaces(point.cx, point.cy, 34, 9, `hex-side ${classes.join(' ')}`)}<polygon class="${classes.join(' ')}" points="${hexPoints(point.cx, point.cy)}"></polygon></g>`;
  }).join('');
  const intentSvg = '';
  /* Enemy intent remains available in the inspector, but the room no longer
     draws aim lines, arrows, warning zones, or warning labels. */
  /* Object.entries(battle.intents).map(([enemyId, intent]) => {
    const enemy = getUnit(enemyId); if (!enemy?.alive) return '';
    const start = svgPoint(enemy); const target = intent.targetId ? getUnit(intent.targetId) : null; const endCell = intent.tile || target; if (!endCell) return '';
    const end = svgPoint(endCell);
    if (intent.type === 'hazard') return `<g><polygon class="intent-zone" points="${hexPoints(end.cx, end.cy, 29)}"></polygon><text class="intent-label" x="${end.cx}" y="${end.cy - 38}" text-anchor="middle">BRAMBLE</text></g>`;
    if (intent.type === 'quake') return `<g>${living('ally').filter(hero => distance(enemy, hero) <= 3).map(hero => { const point = svgPoint(hero); return `<polygon class="intent-zone intent-quake-zone" points="${hexPoints(point.cx, point.cy, 29)}"></polygon>`; }).join('')}<text class="intent-label" x="${start.cx}" y="${start.cy - 38}" text-anchor="middle">ASH QUAKE</text></g>`;
    if (intent.type === 'webfall') { const webCell = target?.alive ? neighbors(target).find(cell => !occupied(cell.x, cell.y) && !isHazard(cell.x, cell.y)) : null; const dangerCell = webCell || (intent.tile && !occupied(intent.tile.x, intent.tile.y) && !isHazard(intent.tile.x, intent.tile.y) ? intent.tile : null); const tile = dangerCell ? svgPoint(dangerCell) : start; return `<g>${dangerCell ? `<polygon class="intent-zone intent-web-zone" points="${hexPoints(tile.cx, tile.cy, 29)}"></polygon>` : ''}<text class="intent-label" x="${tile.cx}" y="${tile.cy - 38}" text-anchor="middle">WEBFALL</text><text class="intent-label" x="${start.cx}" y="${start.cy + 48}" text-anchor="middle">SUMMON</text></g>`; }
    if (intent.type === 'mark') return `<g><polygon class="intent-zone intent-mark-zone" points="${hexPoints(end.cx, end.cy, 29)}"></polygon><text class="intent-label" x="${end.cx}" y="${end.cy - 38}" text-anchor="middle">MARK</text></g>`;
    if (intent.type === 'blink') return `<g><polygon class="intent-zone intent-blink-zone" points="${hexPoints(end.cx, end.cy, 29)}"></polygon><text class="intent-label" x="${end.cx}" y="${end.cy - 38}" text-anchor="middle">RIFT LANDING</text><line class="intent-line" x1="${start.cx}" y1="${start.cy}" x2="${end.cx}" y2="${end.cy}"></line></g>`;
    if (intent.type === 'guard') return `<text class="intent-label" x="${start.cx}" y="${start.cy - 40}" text-anchor="middle">GUARD</text>`;
    return `<line class="intent-line" x1="${start.cx}" y1="${start.cy}" x2="${end.cx}" y2="${end.cy}"></line>`;
  }).join(''); */
  const trailSvg = movementTrails.map((trail, index) => {
    const from = svgPoint(trail.from); const to = svgPoint(trail.to); const pathId = `move-path-${index}-${trail.unitId}`;
    return `<g class="move-trail ${trail.side}"><path id="${pathId}" class="trail-line" d="M${from.cx} ${from.cy} L${to.cx} ${to.cy}"></path>${state.settings.reducedMotion ? '' : [0, 1, 2].map((particle, particleIndex) => `<circle class="trail-particle" r="${particleIndex === 0 ? 3 : 2}"><animateMotion dur="620ms" begin="${particleIndex * 90}ms" fill="freeze"><mpath href="#${pathId}"></mpath></animateMotion></circle>`).join('')}</g>`;
  }).join('');
  const unitSvg = getUnits().map(unit => {
    if (!unit.alive) return '';
    const point = svgPoint(unit); const selectedClass = unit.id === selectedUnitId ? 'selected' : '';
    const roleClass = unit.side === 'ally' ? 'ally' : 'enemy';
    const classKey = unit.kind === 'warden' ? (unit.startingClass || 'warden') : unit.kind;
    const hpWidth = Math.max(0, 32 * unit.hp / unit.maxHp);
    return `<g class="unit ${roleClass} kind-${unit.kind} class-${classKey} ${selectedClass}" data-unit="${unit.id}"><title>${unit.name}</title><circle class="unit-touch-target" cx="${point.cx}" cy="${point.cy}" r="30"></circle><ellipse class="unit-shadow" cx="${point.cx}" cy="${point.cy + 26}" rx="19" ry="6"></ellipse>${unit.id === selectedUnitId ? `<circle class="unit-aura" cx="${point.cx}" cy="${point.cy}" r="29"></circle>` : ''}${unit.elite ? `<circle class="elite-ring" cx="${point.cx}" cy="${point.cy}" r="27"></circle>` : ''}${extrudedHexFaces(point.cx, point.cy, 22, 7, 'unit-body-side')}<polygon class="unit-body" points="${hexPoints(point.cx, point.cy, 22)}"></polygon>${unitInsignia(unit, point)}<rect class="unit-hp-bg" x="${point.cx - 16}" y="${point.cy + 29}" width="32" height="4" rx="2"></rect><rect class="unit-hp" x="${point.cx - 16}" y="${point.cy + 29}" width="${hpWidth}" height="4" rx="2"></rect>${unit.guard ? `<rect class="unit-guard" x="${point.cx - 16}" y="${point.cy + 36}" width="${Math.min(32, unit.guard * 11)}" height="3" rx="1.5"></rect>` : ''}</g>`;
  }).join('');
  const board = battle.board || boardDimensionsForFloor(battle.floor);
  const viewWidth = Math.max(720, 180 + (board.cols - 1) * 67);
  const viewHeight = Math.max(500, 136 + (board.rows - 1) * 59);
  const boardStyle = (battle.prestige || 0) > 0 ? `style="width:${viewWidth}px;height:${viewHeight}px;max-height:none"` : '';
  return `<svg id="battle-board" ${boardStyle} viewBox="0 0 ${viewWidth} ${viewHeight}" role="img" aria-label="Prestige ${battle.prestige || 0} hex battlefield, ${board.cols} columns by ${board.rows} rows">${cellSvg}${trailSvg}${unitSvg}</svg>`;
}

function renderInspector() {
  const selected = getUnit(selectedUnitId) || living('ally')[0];
  if (!selected) return '<div class="inspector"><div class="inspector-main"><h2>No one is left standing.</h2></div></div>';
  const def = selected.side === 'ally' ? (HERO_DEFS[selected.kind] || HERO_DEFS.warden) : (ENEMY_DEFS[selected.kind] || BOSS_DEFS[selected.kind]);
  const classProfile = selected.side === 'ally' ? (selected.kind === 'warden' ? STARTING_CLASSES[selected.startingClass || state.meta.startingClass || 'warden'] : STARTING_CLASSES[selected.kind] || null) : null;
  const classType = selected.subBoss ? 'Sub-boss' : classProfile ? classProfile.name : def.classType || (selected.side === 'enemy' && BOSS_DEFS[selected.kind] ? 'Boss' : def.role.includes('area') || def.role.includes('controller') || def.role.includes('support') ? 'Controller' : def.role.includes('ranged') || def.range >= 3 ? 'Ranged' : def.role.includes('front') || def.role.includes('melee') ? 'Bruiser' : 'Skirmisher');
  const attackType = classProfile?.attackType || def.attackType || (def.role.includes('area') || def.role.includes('denial') || def.role.includes('quake') ? 'AOE' : def.range >= 3 ? 'Long range' : 'Short range');
  const intent = state.battle.intents[selected.id];
  const canAct = selected.side === 'ally' && selected.alive && !selected.acted && state.battle.phase === 'plan';
  const unactedCount = living('ally').filter(hero => !hero.acted).length;
  const confirmLabel = unactedCount ? `Resolve enemy turn · skip ${unactedCount}` : 'Resolve enemy turn';
  const actionModeLabel = actionMode === 'move' ? 'MOVE · Pick a teal hex. Moving is optional and does not use your action.' : actionMode === 'attack' ? (living('enemy').some(enemy => distance(selected, enemy) <= selected.range) ? 'ATTACK · Pick a marked enemy. If none is marked, move closer first.' : 'OUT OF RANGE · Choose Move, pick a teal hex, then Attack.') : actionMode === 'ability' ? !abilityNeedsEnemyTarget(selected) ? (classProfile?.ability === 'Lifeline' ? 'LIFELINE · Heals the most wounded ally and grants nearby Guard.' : 'BRACE LINE · Guard yourself and one adjacent ally.') : 'SIGNATURE · Pick a marked enemy to use this class ability.' : canAct ? 'YOUR TURN · Move is optional; choose one action: Attack, Guard, or Signature.' : 'This hero has acted. Select an unused ally, or resolve the enemy turn.';
  const logRows = state.battle.log.map((line, index) => {
    const tone = /damage|strike|hit|burn|poison|falls|defeat/i.test(line) ? 'impact' : /guard|ward|shelter|brace/i.test(line) ? 'ward' : /round|floor|generated|survive/i.test(line) ? 'system' : 'trace';
    const glyph = tone === 'impact' ? '✦' : tone === 'ward' ? '◇' : tone === 'system' ? '⌁' : '·';
    return `<div class="log-line log-${tone}" style="--log-index:${index}"><span class="log-glyph" aria-hidden="true">${glyph}</span><span>${line}</span></div>`;
  }).join('');
  return `<aside class="inspector"><div class="inspector-main">
    <div class="inspector-kicker"><span>${selected.side === 'ally' ? 'YOUR PARTY' : 'HOSTILE / INTENT'}</span><span>${selected.alive ? 'ACTIVE' : 'DOWN'}</span></div>
    <h2 class="inspector-name">${selected.name}</h2><div class="inspector-role ${selected.side === 'enemy' ? 'enemy-role' : ''}">${selected.role}</div><div class="combat-tags"><span class="combat-tag class-tag">CLASS · ${classType}</span><span class="combat-tag attack-tag">ATTACK · ${attackType}</span></div>
    <div class="stat-strip"><div class="stat"><span>VITAL</span><strong>${selected.hp}/${selected.maxHp}</strong></div><div class="stat"><span>RANGE</span><strong>${selected.range}</strong></div><div class="stat"><span>MOVE</span><strong>${selected.move}</strong></div></div>
    <p class="detail-copy">${classProfile?.description || def.description}</p>
    ${selected.side === 'enemy' ? `<div class="intent-card"><div class="intent-title">NEXT INTENT</div><div class="intent-copy">${intent?.text || 'No clear signal.'}</div></div>` : `<div class="intent-card safe"><div class="intent-title">${(classProfile?.ability || def.ability).toUpperCase()}</div><div class="intent-copy">${classProfile?.abilityText || def.abilityText}</div></div><div class="synergy-note"><strong>CLASS IDENTITY</strong>${classProfile?.movementStyle || `Move ${selected.move} hexes`} · ${classProfile?.attackStyle || attackType}</div>`}
    <div class="status-row">${selected.elite ? `<span class="status-pill elite-pill">ELITE / ${selected.elite.name.toUpperCase()}</span>` : ''}${selected.guard ? `<span class="status-pill">GUARD ${selected.guard}</span>` : ''}${selected.status.map(status => `<span class="status-pill">${status.toUpperCase()}</span>`).join('')}${selected.acted ? '<span class="status-pill">TURN SPENT</span>' : ''}</div>
  </div>${selected.side === 'ally' ? `<div class="action-tray"><div class="action-hint">${actionModeLabel}</div><div class="action-buttons"><button class="action-button ${actionMode === 'move' ? 'active' : ''}" data-action="move" ${!canAct || selected.moved ? 'disabled' : ''}>Move<small>${selected.moved ? 'already moved' : `${selected.move} hexes`}</small></button><button class="action-button attack-button ${actionMode === 'attack' ? 'active' : ''}" data-action="attack" ${!canAct ? 'disabled' : ''}>Attack<small>${attackType} · ${selected.damage} damage · ${selected.range} range</small></button><button class="action-button" data-action="guard" ${!canAct ? 'disabled' : ''}>Guard<small>Gain ${2 + relicLevel('silver-pact')} Guard</small></button><button class="action-button signature-button ${actionMode === 'ability' ? 'active' : ''}" data-action="ability" ${!canAct || selected.abilityUsed ? 'disabled' : ''}>${classProfile?.ability || def.ability}<small>${selected.abilityUsed ? 'spent' : !abilityNeedsEnemyTarget(selected) ? (classProfile?.ability === 'Lifeline' ? 'signature · party support' : 'signature · self/ally defense') : `signature · ${attackType}`}</small></button></div><button class="quiet-button" data-action="end" ${!canAct ? 'disabled' : ''}>End ${selected.name}'s turn</button><button class="confirm-button" data-action="confirm" ${state.battle.phase !== 'plan' ? 'disabled' : ''}>${confirmLabel}</button></div>` : `<div class="action-tray"><div class="action-hint">${state.battle.phase === 'enemy' ? 'The room is answering.' : 'Enemy intent is visible on the board.'}</div></div>`}<div class="log-panel"><div class="log-heading"><span>WARD CHRONICLE</span><small>${state.battle.log.length} traces</small></div>${logRows}</div></aside>`;
}

function renderEmberField() {
  if (state.settings.reducedMotion) return '';
  return `<div class="ember-field" aria-hidden="true">${Array.from({ length: 18 }, (_, index) => `<i style="--ember-x:${(index * 37) % 100}%;--ember-delay:${(index % 9) * .62}s;--ember-duration:${5 + (index % 5)}s;--ember-size:${1 + (index % 3)}px"></i>`).join('')}</div>`;
}
function renderBattle(keepOutcomeRoom = false) {
  const battle = state.battle;
  if (battle.outcome && !keepOutcomeRoom) return renderResult();
  const bossLabel = battle.boss ? `${battle.boss.bigBad ? 'BIG BAD' : 'BOSS'} / ${battle.boss.name || BOSS_DEFS[battle.boss.key].name}` : battle.subBoss ? `SUB-BOSS / ${battle.subBoss.name}` : 'PROCEDURAL FLOOR';
  const bossMechanic = battle.boss ? `${BOSS_DEFS[battle.boss.key].description}${battle.boss.bigBad ? ` Prestige ${PRESTIGE_ROMANS[battle.boss.prestige]} · six-round Big Bad encounter.` : ''}` : battle.subBoss ? battle.subBoss.description : `Hold the ward through ${battle.maxRounds || MAX_ROUNDS} generated rounds.`;
  const roundLimit = battle.maxRounds || MAX_ROUNDS;
  app.innerHTML = `<section class="battle-screen"><div class="battle-head"><div><div class="battle-kicker"><span class="phase-chip">${battle.phase === 'plan' ? 'YOUR PLAN' : 'ENEMIES ACT'}</span><span class="round-count">FLOOR ${String(battle.floor || state.expedition.floor).padStart(2, '0')} · ROUND ${String(battle.round).padStart(2, '0')} / ${roundLimit}</span></div><h1 class="battle-title">${bossLabel}</h1></div><div class="battle-objective"><b>GOAL · ${battle.objective || (battle.boss ? bossMechanic : 'Survive the encounter.')}</b><br>Move is optional; each ally gets one action. Commit resolves enemies; unused allies skip.</div></div>${canChangeBattleFormation() ? `<div class="deployment-bar"><div><strong>DEPLOYMENT WINDOW</strong><span>Main Class fixed · change any companion before the first move. Duplicate classes are allowed.</span></div>${state.meta.party.slice(1).map((kind, offset) => { const index = offset + 1; return `<label>COMPANION ${index}<select data-battle-party-slot="${index}">${companionPartyKinds().map(option => `<option value="${option}" ${kind === option ? 'selected' : ''}>${className(option)}</option>`).join('')}</select></label>`; }).join('')}</div>` : ''}${renderTimeline()}<div class="battle-grid"><div class="board-panel"><div class="dungeon-atmosphere" aria-hidden="true"><span class="dungeon-arch"></span><span class="dungeon-sconce sconce-left"></span><span class="dungeon-sconce sconce-right"></span><span class="dungeon-mist"></span></div>${renderEmberField()}<canvas id="combat-visualizer" aria-label="Combat sound visualizer"></canvas><div class="visualizer-label">DUNGEON HUM / WARD RESONANCE</div><div id="combat-fx" aria-live="polite"></div>${activeCompanionSynergies().length ? `<div class="battle-synergy-strip"><span>PAIR TRAITS</span>${activeCompanionSynergies().map(synergy => `<b style="--synergy-accent:${synergy.accent}">${synergy.name}</b>`).join('')}</div>` : ''}<div class="board-wrap">${renderBoard()}</div></div>${renderInspector()}</div></section>`;
  movementTrails = [];
  ensureBattleMusic();
  if (!visualizerFrame) visualizerFrame = window.requestAnimationFrame(drawCombatVisualizer);
  if (actionPulseId) {
    const actor = app.querySelector(`[data-unit="${actionPulseId}"]`);
    actor?.classList.add('acting');
    window.setTimeout(() => actor?.classList.remove('acting'), 720);
    actionPulseId = null;
  }
  flushCombatFx();
  app.querySelectorAll('[data-battle-party-slot]').forEach(select => select.addEventListener('change', () => changeBattleCompanion(Number(select.dataset.battlePartySlot), select.value)));
  const boardWrap = app.querySelector('.board-wrap');
  if (boardWrap) {
    let pan = null;
    const activePointers = new Set();
    let suppressClick = false;
    const finishPan = event => {
      if (event?.pointerId != null) activePointers.delete(event.pointerId);
      if (!pan || (event?.pointerId != null && event.pointerId !== pan.pointerId)) return;
      suppressClick = pan.moved;
      pan = null;
      boardWrap.classList.remove('is-panning');
    };
    boardWrap.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      activePointers.add(event.pointerId);
      if (activePointers.size > 1) {
        pan = null;
        boardWrap.classList.remove('is-panning');
        return;
      }
      pan = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, scrollLeft: boardWrap.scrollLeft, scrollTop: boardWrap.scrollTop, moved: false };
      boardWrap.classList.add('is-panning');
      boardWrap.setPointerCapture?.(event.pointerId);
    });
    boardWrap.addEventListener('pointermove', event => {
      if (!pan || activePointers.size > 1 || event.pointerId !== pan.pointerId) return;
      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      if (!pan.moved && Math.hypot(dx, dy) < 5) return;
      pan.moved = true;
      boardWrap.scrollLeft = pan.scrollLeft - dx;
      boardWrap.scrollTop = pan.scrollTop - dy;
      event.preventDefault();
    });
    boardWrap.addEventListener('pointerup', finishPan);
    boardWrap.addEventListener('pointercancel', finishPan);
    boardWrap.addEventListener('lostpointercapture', finishPan);
    boardWrap.addEventListener('click', event => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }
  app.querySelectorAll('[data-unit]').forEach(el => el.addEventListener('click', event => {
    event.stopPropagation();
    const unit = getUnit(el.dataset.unit);
    if (unit?.side === 'ally') chooseHero(unit.id);
    else if (unit?.side === 'enemy') handleCellClick(unit.x, unit.y);
  }));
  app.querySelectorAll('[data-x]').forEach(el => el.addEventListener('click', () => handleCellClick(Number(el.dataset.x), Number(el.dataset.y))));
  app.querySelector('[data-action="move"]')?.addEventListener('click', () => selectAction('move'));
  app.querySelector('[data-action="attack"]')?.addEventListener('click', () => selectAction('attack'));
  app.querySelector('[data-action="ability"]')?.addEventListener('click', () => selectAction('ability'));
  app.querySelector('[data-action="guard"]')?.addEventListener('click', guardUnit);
  app.querySelector('[data-action="end"]')?.addEventListener('click', endHeroTurn);
  app.querySelector('[data-action="confirm"]')?.addEventListener('click', confirmPlan);
}

function buyRelic(id) {
  const relic = RELICS[id];
  if (!relic || !state.expedition.marketStock.includes(id) || state.expedition.marketBought.includes(id)) return;
  const level = relicLevel(id);
  if (level >= relic.maxLevel) return toast(`${relic.name} is already fully forged.`, true);
  const cost = relicPrice(id, level);
  if (state.expedition.emberShards < cost) return toast('Not enough ember shards.', true);
  state.expedition.emberShards -= cost;
  state.expedition.relicLevels[id] = level + 1;
  if (!state.expedition.relics.includes(id)) state.expedition.relics.push(id);
  state.expedition.marketBought.push(id);
  persist(`${relic.name} ${romanTier(level + 1)} forged`);
  render();
}

function buyCompanion(id) {
  const companion = HERO_DEFS[id];
  const cost = COMPANION_RECRUIT_COSTS[id];
  if (!companion || id === 'warden' || !Number.isFinite(cost) || state.meta.companionUnlocked.includes(id)) return;
  if (state.expedition.emberShards < cost) return toast(`Need ${cost - state.expedition.emberShards} more ember shards.`, true);
  state.expedition.emberShards -= cost;
  state.meta.companionUnlocked.push(id);
  persist(`${companion.name} recruited as a companion`);
  render();
}

function renderShop() {
  if (!Array.isArray(state.expedition.marketStock) || !state.expedition.marketStock.length) {
    state.expedition.marketStock = rollMarketStock();
    state.expedition.marketVisit = Math.max(1, state.expedition.marketVisit || 0);
    persist(null);
  }
  if (!Array.isArray(state.expedition.marketBought)) state.expedition.marketBought = [];
  const currentFloor = Math.max(1, Math.min(MAX_FLOOR, state.expedition.floor - 1));
  const companionOffers = Object.entries(HERO_DEFS).filter(([id]) => id !== 'warden').map(([id, companion]) => {
    const owned = state.meta.companionUnlocked.includes(id);
    const cost = COMPANION_RECRUIT_COSTS[id];
    return `<article class="companion-market-card ${owned ? 'owned' : ''}"><div class="companion-market-head"><span class="companion-market-sigil">${characterSvg(id)}</span><div><h2>${companion.name}</h2><span>${companion.role} · COMPANION</span></div></div><p>${companion.description}</p><div class="companion-market-footer"><strong>${owned ? 'RECRUITED · XP PROMOTIONS' : `${cost} EMBER SHARDS`}</strong><button class="secondary-button" data-companion="${id}" ${owned || state.expedition.emberShards < cost ? 'disabled' : ''}>${owned ? 'Recruited' : 'Recruit companion'}</button></div></article>`;
  }).join('');
  const offers = state.expedition.marketStock.map(id => {
    const relic = RELICS[id];
    if (!relic) return '';
    const level = relicLevel(id);
    const maxed = level >= relic.maxLevel;
    const bought = state.expedition.marketBought.includes(id);
    const nextLevel = Math.min(relic.maxLevel, level + 1);
    const displayLevel = bought || maxed ? Math.max(1, level) : nextLevel;
    const cost = relicPrice(id, level);
    const shortfall = Math.max(0, cost - state.expedition.emberShards);
    const action = bought ? 'Bought this visit' : maxed ? 'Fully forged' : shortfall ? `Need ${shortfall} more shards` : level ? `Upgrade to ${romanTier(nextLevel)}` : 'Acquire I';
    const costText = bought ? 'OFFER SPENT' : maxed ? 'MAXIMUM TIER' : `${cost} EMBER SHARDS`;
    return `<article class="relic-card rarity-${relic.rarity} ${level ? 'owned' : ''} ${maxed ? 'maxed' : ''} ${bought ? 'purchased' : ''}"><div class="relic-card-head"><span class="relic-mark">${relicSvg(id)}</span><div><h2>${relic.name} ${romanTier(displayLevel)}</h2><span class="relic-effect">${relic.effect}</span></div></div><div class="relic-tier-line"><span>${level ? `OWNED · ${romanTier(level)}` : 'UNFORGED'}</span><span>${relic.rarity.toUpperCase()} · ${level}/${relic.maxLevel} TIERS</span></div><p>${relic.description}</p><div class="relic-card-footer"><span class="relic-cost">${costText}</span><button class="secondary-button" data-relic="${id}" ${bought || maxed || state.expedition.emberShards < cost ? 'disabled' : ''}>${action}</button></div></article>`;
  }).join('');
  app.innerHTML = `<section class="screen-shell shop-screen"><div class="shop-header"><div><div class="eyebrow">Every two rooms / Archive exchange · visit ${state.expedition.marketVisit || 1}</div><h1 class="display-title">The relic<br><em>market opens.</em></h1><p class="lede">Recruit companions with Ember shards, then buy each relic offer once per visit. Companions earn XP in battle; Main Classes and their mastery remain in the Meta Tree. ${state.expedition.runComplete ? 'This is the last market stop of the completed 1,000-floor descent.' : 'The next market stop comes after two more cleared rooms.'}</p></div><div class="shard-wallet"><span>EMBER SHARDS</span><strong>${state.expedition.emberShards}</strong><small>${state.expedition.runComplete ? `Floor ${currentFloor} cleared · run complete` : `Floor ${currentFloor} cleared · Floor ${state.expedition.floor} next`}<br>Stock rotates on each visit</small></div></div><section class="companion-market"><div class="section-heading"><div><span class="eyebrow">01 / COMPANION RECRUITMENT</span><h2>Build the minion roster.</h2></div><span>Only companions appear here. The single Main Class is selected in the Meta Tree.</span></div><div class="companion-market-grid">${companionOffers}</div></section><section class="relic-market"><div class="section-heading"><div><span class="eyebrow">02 / RELICS</span><h2>Forge the expedition.</h2></div><span>Owned relics return as their next tier in later visits.</span></div><div class="relic-grid">${offers}</div></section><div class="shop-actions">${state.expedition.runComplete ? '<button class="primary-button" data-action="archive">Return to completed run</button>' : `<button class="primary-button" data-action="next-floor">Enter floor ${state.expedition.floor}</button>`}<button class="quiet-button" data-action="expedition">Back to expedition hub</button></div></section>`;
  app.querySelectorAll('[data-companion]').forEach(button => button.addEventListener('click', () => buyCompanion(button.dataset.companion)));
  app.querySelectorAll('[data-relic]').forEach(button => button.addEventListener('click', () => buyRelic(button.dataset.relic)));
  app.querySelector('[data-action="next-floor"]')?.addEventListener('click', startBattle);
  app.querySelector('[data-action="archive"]')?.addEventListener('click', () => { state.screen = 'expedition'; render(); });
  app.querySelector('[data-action="expedition"]')?.addEventListener('click', () => { state.screen = 'expedition'; persist('Returned to run status'); render(); });
  ensureBattleMusic();
}

function renderVictoryPopup() {
  document.querySelectorAll('.victory-modal-backdrop').forEach(modal => modal.remove());
  const battle = state.battle;
  const clearedFloor = battle.floor || state.expedition.floor;
  const runComplete = Boolean(state.expedition.runComplete);
  const marketDue = marketAvailableForRoom(clearedFloor);
  const nextMarketRoom = marketDue ? clearedFloor + 2 : clearedFloor % 2 === 0 ? clearedFloor + 2 : clearedFloor + 1;
  const bossDrop = battle.boss?.relic ? BOSS_RELICS[battle.boss.relic] : null;
  const floorLabel = battle.boss ? `${battle.boss.bigBad ? 'BIG BAD · ' : ''}${battle.boss.name || BOSS_DEFS[battle.boss.key].name} defeated${runComplete ? ' · 1,000-FLOOR RUN COMPLETE' : ''}` : battle.subBoss ? `${battle.subBoss.name} defeated` : `Room ${clearedFloor} secured`;
  const metaReward = 3 + (battle.boss?.bigBad ? 5 + battle.boss.prestige : 0);
  const rewardTitle = `${metaReward} meta-shards · ${state.expedition.lastReward?.split(' ember shards')[0] || '3'} ember shards`;
  const rewardCopy = battle.boss?.bigBad ? `Big Bad milestone bounty · Prestige ${PRESTIGE_ROMANS[battle.boss.prestige]}` : bossDrop ? `${bossDrop.name} · full-boss relic acquired` : battle.subBoss ? 'Sub-boss bounty includes 2 bonus ember shards' : 'Added to the expedition archive';
  const marketCopy = runComplete ? marketDue ? 'The final relic market is open. Shop once more, then return to your completed run.' : 'The final Big Bad has fallen. Your 1,000-floor descent is complete.' : marketDue ? 'The two-room market is open now.' : `Next relic market opens after room ${nextMarketRoom}.`;
  const bossCopy = battle.boss?.bigBad ? 'A Big Bad guards every hundredth floor. Defeating this one unlocks its milestone bounty.' : battle.subBoss ? `${battle.subBoss.description} Its defeat earns 2 bonus ember shards.` : bossDrop ? 'The boss has fallen and left a signature relic behind.' : 'The pressure line broke. The ruin gives you one quiet breath before the next descent.';
  const modal = document.createElement('div');
  modal.className = 'victory-modal-backdrop';
  modal.innerHTML = `<section class="victory-modal" role="dialog" aria-modal="true" aria-labelledby="victory-title"><div class="victory-modal-art" aria-hidden="true"><svg viewBox="0 0 120 120"><circle class="victory-ring" cx="60" cy="60" r="48"></circle><path class="victory-crest" d="M60 19 92 37v39L60 94 28 76V37l32-18Z"></path><path class="victory-check" d="m40 61 13 13 28-32"></path></svg></div><div class="eyebrow">${runComplete ? 'THE DEEP WARD / COMPLETE' : 'WARD CLEARED / EXPEDITION'}</div><h2 id="victory-title">${runComplete ? 'WORLD FALLEN' : 'VICTORY'}</h2><p class="victory-floor">${floorLabel}</p><p class="victory-copy">${bossCopy}</p><div class="victory-reward"><span class="victory-reward-icon">${svgIcon('relic')}</span><span><strong>${rewardTitle}</strong><small>${rewardCopy}</small></span></div><p class="market-timing-note">${marketCopy}</p><div class="button-row victory-actions">${marketDue ? '<button class="primary-button" data-action="shop">Visit relic market</button>' : ''}<button class="secondary-button" data-action="map">${runComplete ? 'Return to completed run' : 'Continue to expedition'}</button>${runComplete ? '' : '<button class="quiet-button" data-action="retry">Enter next room</button>'}</div></section>`;
  document.body.appendChild(modal);
  modal.querySelector('[data-action="map"]').addEventListener('click', () => { state.screen = 'expedition'; stopBattleMusic(); persist('Returned to map'); modal.remove(); render(); });
  modal.querySelector('[data-action="shop"]')?.addEventListener('click', () => { modal.remove(); openMarket(); });
  modal.querySelector('[data-action="retry"]')?.addEventListener('click', () => { modal.remove(); startBattle(); });
}


function renderResult() {
  const won = state.battle.outcome === 'victory';
  if (won) {
    renderBattle(true);
    renderVictoryPopup();
    return;
  }
  app.innerHTML = `<section class="screen-shell result-screen defeat" data-outcome="defeat"><div class="result-art"><svg viewBox="0 0 520 520" role="img" aria-label="A fractured defeat ward"><circle class="result-ring outer" cx="260" cy="260" r="210"></circle><circle class="result-ring middle" cx="260" cy="260" r="166"></circle><circle class="result-ring inner" cx="260" cy="260" r="112"></circle><path class="result-crest" d="M260 108 370 172v128l-110 66-110-66V172l110-64Z"></path><path class="result-sigil" d="M210 211 260 180l50 31v63l-50 31-50-31v-63Z M260 196v92 M224 232h72 M236 279l48-38"></path><path class="result-fracture" d="m150 128 38 40-22 25m205-68-33 48 25 26M119 325l53-13-7 45m243-49-46 9 18 42"></path><g class="result-particles"><circle cx="104" cy="180" r="3" style="--particle-delay:0ms"></circle><circle cx="142" cy="85" r="2" style="--particle-delay:160ms"></circle><circle cx="393" cy="118" r="3" style="--particle-delay:320ms"></circle><circle cx="430" cy="223" r="2" style="--particle-delay:90ms"></circle><circle cx="378" cy="390" r="3" style="--particle-delay:240ms"></circle><circle cx="117" cy="377" r="2" style="--particle-delay:400ms"></circle></g></svg></div><div class="result-content"><div class="result-mark"><span>${svgIcon('defeat')}</span></div><div class="eyebrow">Expedition interrupted</div><h1 class="display-title">The floor<br><em>goes quiet.</em></h1><p class="lede">No lesson arrives cleanly. The run is still there, and now you know which shape the dark takes when it comes for you.</p><div class="button-row"><button class="primary-button" data-action="map">Return to expedition</button><button class="secondary-button" data-action="retry">Retry room</button></div></div></section>`;
  app.querySelector('[data-action="map"]').addEventListener('click', () => { state.screen = 'expedition'; stopBattleMusic(); persist('Returned to map'); render(); });
  app.querySelector('[data-action="retry"]').addEventListener('click', startBattle);
}


function renderFieldGuide() {
  if (helpOpen) return;
  helpOpen = true;
  const modal = document.createElement('div');
  const opener = document.activeElement;
  modal.className = 'modal-backdrop field-guide-backdrop';
  modal.innerHTML = `<div class="modal field-guide-modal" role="dialog" aria-modal="true" aria-labelledby="field-guide-title"><button class="modal-close" data-action="close" aria-label="Close Field Guide">×</button><div class="eyebrow">Field guide / quick rules</div><h2 id="field-guide-title">How to play Hexfall</h2><p class="guide-intro">Plan a turn for your team, watch what the enemies intend to do, then decide when to let them act.</p><div class="field-guide-grid"><section class="field-guide-card"><span class="guide-number">01 / YOUR TURN</span><h3>Move, then choose one action</h3><ol><li>Select an ally on the board or in the turn-order strip.</li><li>Move is optional. Choose a highlighted hex; moving does not spend the ally’s action.</li><li>Choose one: Attack, Guard, Signature, or End turn to wait.</li><li><b>Resolve enemy turn</b> when ready. Allies you leave unused will skip this round.</li></ol></section><section class="field-guide-card"><span class="guide-number">02 / READ THE ROOM</span><h3>Check targets and intent</h3><ul><li>Highlighted hexes and enemies show legal moves and targets for your selected action.</li><li>Select an enemy to read <b>Next intent</b> in the side panel before committing.</li><li>Room 5, 15, 25… is a sub-boss; room 10, 20, 30… is a full boss; each 100th room is a Big Bad. Defeat bosses on time or the room is lost.</li><li>Guard builds protection against incoming hits. The objective and rounds remaining are shown above the board.</li></ul></section><section class="field-guide-card"><span class="guide-number">03 / BUILD A TEAM</span><h3>Choose your Main Class; grow your team</h3><ul><li>Choose your main class in the Meta Tree. It stays in slot one; recruit and swap companions in the shard market. Only one Main Class can lead; duplicate companions are allowed.</li><li>You can still swap companions in the battle deployment bar before the first ally acts. After that, the lineup locks until the battle ends.</li><li>Companions earn XP promotions in the hub. Upgrade the selected main class separately with Meta-shards in the Meta Tree.</li><li>The market offers twelve distinct companion disciplines: two AOE, two healer, two tank, two short-range, and two long-range additions alongside the starter pair.</li></ul></section><section class="field-guide-card guide-synergy-card"><span class="guide-number">04 / COMPANION PAIRINGS</span><h3>Build a formation with linked traits</h3><p>Deploy the listed companions together to activate their battle trait. Three-member pairings require all three names in the same formation.</p><div class="guide-pairing-list">${COMPANION_SYNERGIES.map(synergy => `<div class="guide-pairing"><strong>${synergy.name}</strong><span>${synergy.pair.map(className).join(' + ')}</span><small>${synergy.trait}</small></div>`).join('')}</div></section><section class="field-guide-card"><span class="guide-number">05 / PRESTIGE</span><h3>Descend through ten prestige bands</h3><ul><li>Floors 1–100 are the standard descent; every next 100-floor band raises Prestige through Prestige IX, ending at floor 1,000.</li><li>Every two prestige ranks add one active teammate, up to seven. Choose duplicates of any available class if you want.</li><li>Enemies gain health and damage at every second prestige; the hex battlefield grows wider and taller with every prestige.</li><li>A Big Bad waits on floors 100, 200, …, 1,000. Defeat it within six rounds; after the last one, the expedition is complete.</li></ul></section><section class="field-guide-card"><span class="guide-number">06 / SPEND WISELY</span><h3>Two currencies, two purposes</h3><ul><li><b>Ember shards</b> belong to this expedition. Spend them in the market after rooms 2, 4, 6, and so on.</li><li>Each market offer can be bought once per visit. An owned relic becomes its next tier when it appears in a later visit.</li><li><b>Meta-shards</b> are permanent. Use them for upgrades in the Meta upgrades screen, not in the relic market.</li></ul></section></div><div class="guide-footer"><span>Need a reminder? This guide is always available from the ? button.</span><button class="primary-button" data-action="close">Got it</button></div></div>`;
  document.body.appendChild(modal);
  const closeButton = modal.querySelector('[data-action="close"]');
  const close = () => {
    helpOpen = false;
    modal.remove();
    document.removeEventListener('keydown', onKeydown);
    if (opener?.isConnected) opener.focus();
  };
  const onKeydown = event => { if (event.key === 'Escape') close(); };
  closeButton.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', onKeydown);
  closeButton.focus();
}

function renderSettings() {
  if (settingsOpen) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    const volume = Math.round(Math.max(0, Math.min(1, Number(state.settings.masterVolume ?? 0.55))) * 100);
    modal.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button class="modal-close" data-action="close" aria-label="Close settings">×</button><div class="eyebrow">Archive / local only</div><h2 id="settings-title">Field settings</h2><p>Your expedition lives in this browser. Export a copy if you want to carry it to another device.</p><div class="setting-row"><div>Reduced motion<small>Keep the board calm during combat.</small></div><input class="toggle" data-setting="reducedMotion" type="checkbox" ${state.settings.reducedMotion ? 'checked' : ''}></div><div class="setting-row"><div>Touch haptics<small>Vibrate where supported; otherwise use a brief visual pulse.</small></div><input class="toggle" data-setting="touchHaptics" type="checkbox" ${state.settings.touchHaptics !== false ? 'checked' : ''}></div><div class="setting-row"><div>Sound cues<small>Punchy impacts and signature-action cues.</small></div><input class="toggle" data-setting="sound" type="checkbox" ${state.settings.sound ? 'checked' : ''}></div><div class="setting-row"><div>Mute sound effects<small>Keep the cue settings without hearing them.</small></div><input class="toggle" data-setting="soundMuted" type="checkbox" ${state.settings.soundMuted ? 'checked' : ''}></div><div class="setting-row"><div>Battle music<small>Looping Web Audio score while the ward is under siege.</small></div><input class="toggle" data-setting="battleMusic" type="checkbox" ${state.settings.battleMusic !== false ? 'checked' : ''}></div><div class="setting-row"><div>Mute battle music<small>Keep the score setting without hearing it.</small></div><input class="toggle" data-setting="battleMusicMuted" type="checkbox" ${state.settings.battleMusicMuted ? 'checked' : ''}></div><div class="volume-row"><label for="master-volume">Master volume <output id="master-volume-value">${volume}%</output></label><input id="master-volume" data-setting="masterVolume" type="range" min="0" max="1" step="0.05" value="${Number(state.settings.masterVolume ?? 0.55)}" /></div><div class="volume-row"><label for="music-volume">Battle music volume <output id="music-volume-value">${Math.round(Number(state.settings.battleMusicVolume ?? 0.28) * 100)}%</output></label><input id="music-volume" data-setting="battleMusicVolume" type="range" min="0" max="1" step="0.05" value="${Number(state.settings.battleMusicVolume ?? 0.28)}" /></div><div class="button-row"><button class="secondary-button" data-action="export">Export save</button><button class="secondary-button" data-action="import">Import save</button><button class="quiet-button" data-action="wipe">Clear local save</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-action="close"]').addEventListener('click', () => { settingsOpen = false; modal.remove(); });
    modal.addEventListener('click', event => { if (event.target === modal) { settingsOpen = false; modal.remove(); } });
    modal.querySelector('[data-action="export"]').addEventListener('click', exportSave);
    modal.querySelector('[data-action="import"]').addEventListener('click', () => document.querySelector('#import-input').click());
    modal.querySelector('[data-action="wipe"]').addEventListener('click', () => { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(BACKUP_KEY); Object.assign(state, freshState()); settingsOpen = false; modal.remove(); toast('Local save cleared'); render(); });
    modal.querySelectorAll('[data-setting]').forEach(input => input.addEventListener(input.type === 'range' ? 'input' : 'change', () => { state.settings[input.dataset.setting] = input.type === 'checkbox' ? input.checked : Number(input.value); if (input.dataset.setting === 'reducedMotion') document.documentElement.dataset.reducedMotion = String(state.settings.reducedMotion); if (input.type === 'range') modal.querySelector(`#${input.id}-value`).textContent = `${Math.round(Number(input.value) * 100)}%`; updateAudioBus(); if (input.dataset.setting === 'battleMusic') ensureBattleMusic(); if (input.dataset.setting === 'battleMusicMuted' || input.dataset.setting === 'battleMusic') { if (state.settings.battleMusic && !state.settings.battleMusicMuted) ensureBattleMusic(); else stopBattleMusic(); } persist(null); }));
  }
}

function render() {
  if (state.screen === 'battle' && state.battle) renderBattle();
  else if (state.screen === 'shop') renderShop();
  else if (state.screen === 'meta') renderMeta();
  else if (state.screen === 'history') renderHistory();
  else if (state.battle?.outcome && state.screen === 'result') renderResult();
  else renderExpedition();
  renderSettings();
}

document.querySelector('#settings-button').addEventListener('click', () => { settingsOpen = true; renderSettings(); });
document.querySelector('#help-button').addEventListener('click', renderFieldGuide);
document.querySelector('#brand-home').addEventListener('click', () => { state.screen = 'expedition'; actionMode = null; stopBattleMusic(); render(); });
document.querySelector('#import-input').addEventListener('change', event => importSave(event.target.files[0]));
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled || button.matches('[data-preview], [data-preview-close]') || button.closest('.trophy-preview-modal')) return;
  let kind = 'navigate';
  if (button.matches('[data-meta], [data-relic]')) kind = 'purchase';
  else if (button.matches('[data-showcase], [data-class]')) kind = 'confirm';
  else if (['move', 'attack', 'ability', 'guard', 'end'].includes(button.dataset.action)) kind = 'battle';
  else if (button.dataset.action === 'wipe') kind = 'warning';
  else if (button.dataset.setting) kind = 'toggle';
  else if (['battle', 'continue', 'next-floor', 'confirm', 'retry', 'shop'].includes(button.dataset.action)) kind = 'confirm';
  playUiCue(kind);
});
document.addEventListener('change', event => {
  if (event.target.matches?.('[data-setting]')) playUiCue('toggle');
});

render();
