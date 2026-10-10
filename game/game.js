const GROUND_BASE_Y = 480
const CAMERA_OFFSET_X = 220
const TOTAL_WIDTH = 900
const TOTAL_HEIGHT = 560
const TILE = 16
const TILE_SCALE = 2
const TILE_PX = TILE * TILE_SCALE
const GROUND_ROWS = 11
const FONT = "'Press Start 2P', monospace"

// Altura E largura máximas por sprite: nunca mais estica PNGs largos/altos
const ASSET_SIZES = {
  player:    { h: 56,  maxW: 96 },
  tree:      { h: 110, maxW: 130 },
  bush:      { h: 44,  maxW: 70 },
  rock1:     { h: 40,  maxW: 60 },
  rock_small:{ h: 26,  maxW: 44 },
  orb:       { h: 24,  maxW: 40 },
  flag:      { h: 70,  maxW: 56 },
  coin:      { h: 18,  maxW: 30 },
  boulder:   { h: 36,  maxW: 60 },
  boss:      { h: 150, maxW: 180 }
}

const PHYSICS = {
  flat:     { drag: 40, pedal: 115, o2Pedal: -12, o2Rest: 26 },
  uphill:   { drag: 55, pedal: 120, o2Pedal: -20, o2Rest: 2 },
  downhill: { free: 150, pedal: 35, o2Rest: 55 },
  exhaustedPedalMult: 0.45,
  exhaustedLifeDrain: 7,
  healO2Threshold: 55,
  healRate: 4,
  minSpeed: 28,
  maxSpeed: 245,
  turboAccel: 85,
  turboDrain: 32,
  downhillEnergy: 9,
  jumpVel: 560,
  gravity: 1600
}

// ---------- HELPERS DE LEVEL DESIGN ----------
function coinRow(x, n, gap, h) {
  const out = []
  for (let i = 0; i < n; i++) out.push({ x: x + i * gap, h: h || 42 })
  return out
}

function decorLine(start, end, gap, types) {
  const out = []
  let x = start, i = 0
  while (x < end) {
    out.push({ x: Math.round(x), type: types[i % types.length] })
    x += gap + pseudoRandom(x) * gap * 0.8
    i++
  }
  return out
}

// ---------- AS 4 FASES ----------
const LEVELS = [
  {
    name: 'COLINAS VERDES',
    skyTop: '#6fbdff', skyBottom: '#e6fff2',
    tiles: { flat: 'grass0', rise: 'grass1', fall: 'grass2', fill: ['dirt1'] },
    groundTint: 0xffffff, decorTint: 0xffffff,
    hillsTint: 0xffffff, cloudTint: 0xffffff, cloudAlpha: 1,
    celestial: 'sun',
    mods: {},
    segments: [
      { type: 'flat', length: 700, heightChange: 0 },
      { type: 'uphill', length: 900, heightChange: 230 },
      { type: 'flat', length: 350, heightChange: 0 },
      { type: 'downhill', length: 900, heightChange: -260 },
      { type: 'flat', length: 500, heightChange: 0 },
      { type: 'uphill', length: 500, heightChange: 90 },
      { type: 'flat', length: 300, heightChange: 0 }
    ],
    powerups: [{ x: 1150 }, { x: 2050 }, { x: 3520 }],
    coins: [...coinRow(500, 5, 46), ...coinRow(2500, 5, 46), ...coinRow(3300, 4, 46, 86)],
    obstacles: [],
    decorations: decorLine(150, 3900, 260, ['tree', 'bush', 'rock_small', 'tree', 'rock1']),
    boss: null
  },
  {
    name: 'DUNAS DO POR-DO-SOL',
    skyTop: '#ff9a5c', skyBottom: '#ffe3b3',
    tiles: { flat: 'dirt1', rise: 'dirt1', fall: 'dirt1', fill: ['dirt1'] },
    groundTint: 0xffd9a0, decorTint: 0xffcc99,
    hillsTint: 0xd9a066, cloudTint: 0xffd2c2, cloudAlpha: 0.9,
    celestial: 'sunset',
    mods: {},
    segments: [
      { type: 'flat', length: 500, heightChange: 0 },
      { type: 'uphill', length: 700, heightChange: 140 },
      { type: 'downhill', length: 800, heightChange: -190 },
      { type: 'flat', length: 300, heightChange: 0 },
      { type: 'uphill', length: 600, heightChange: 160 },
      { type: 'downhill', length: 900, heightChange: -230 },
      { type: 'flat', length: 400, heightChange: 0 },
      { type: 'uphill', length: 700, heightChange: 120 },
      { type: 'flat', length: 350, heightChange: 0 }
    ],
    powerups: [{ x: 900 }, { x: 2400 }, { x: 3900 }],
    coins: [...coinRow(700, 6, 46), ...coinRow(1900, 4, 46, 86), ...coinRow(3200, 5, 46)],
    obstacles: [{ x: 1600 }, { x: 2600 }, { x: 3300 }, { x: 4200 }],
    decorations: decorLine(200, 4800, 320, ['rock1', 'bush', 'rock_small']),
    boss: null
  },
  {
    name: 'NOITE NA SERRA',
    skyTop: '#0e1a3c', skyBottom: '#3c5a8c',
    tiles: { flat: 'grass0', rise: 'grass1', fall: 'grass2', fill: ['dirt1'] },
    groundTint: 0x88aaff, decorTint: 0x8899cc,
    hillsTint: 0x4a5a8a, cloudTint: 0x8fa3c8, cloudAlpha: 0.45,
    celestial: 'moon',
    mods: { dragMult: 1.1, o2Mult: 1.15 },
    segments: [
      { type: 'flat', length: 400, heightChange: 0 },
      { type: 'uphill', length: 800, heightChange: 190 },
      { type: 'flat', length: 200, heightChange: 0 },
      { type: 'uphill', length: 600, heightChange: 130 },
      { type: 'downhill', length: 500, heightChange: -160 },
      { type: 'uphill', length: 700, heightChange: 180 },
      { type: 'flat', length: 300, heightChange: 0 },
      { type: 'downhill', length: 1000, heightChange: -340 },
      { type: 'flat', length: 500, heightChange: 0 }
    ],
    powerups: [{ x: 700 }, { x: 1600 }, { x: 2600 }, { x: 4300 }],
    coins: [...coinRow(1200, 5, 46, 86), ...coinRow(2900, 5, 46), ...coinRow(4400, 4, 46, 86)],
    obstacles: [{ x: 1100 }, { x: 2200 }, { x: 2900 }, { x: 3600 }, { x: 4400 }],
    decorations: decorLine(150, 4700, 200, ['tree', 'tree', 'rock1', 'tree']),
    boss: null
  },
  {
    name: 'TERRA DO CACADOR',
    skyTop: '#702840', skyBottom: '#ff9a6a',
    tiles: { flat: 'dirt1', rise: 'dirt1', fall: 'dirt1', fill: ['dirt1'] },
    groundTint: 0xff9d7a, decorTint: 0xff8866,
    hillsTint: 0x8a4a3a, cloudTint: 0xd98a6a, cloudAlpha: 0.7,
    celestial: 'bloodsun',
    mods: {},
    segments: [
      { type: 'flat', length: 600, heightChange: 0 },
      { type: 'uphill', length: 500, heightChange: 120 },
      { type: 'downhill', length: 400, heightChange: -140 },
      { type: 'flat', length: 400, heightChange: 0 },
      { type: 'uphill', length: 900, heightChange: 220 },
      { type: 'downhill', length: 700, heightChange: -200 },
      { type: 'flat', length: 500, heightChange: 0 },
      { type: 'uphill', length: 800, heightChange: 200 },
      { type: 'flat', length: 1200, heightChange: 0 }
    ],
    powerups: [{ x: 800 }, { x: 2200 }, { x: 3400 }, { x: 4400 }],
    coins: [...coinRow(1400, 5, 46), ...coinRow(3100, 6, 46, 86), ...coinRow(5000, 8, 46, 86), ...coinRow(5500, 6, 46)],
    obstacles: [{ x: 1500 }, { x: 3000 }, { x: 3900 }],
    decorations: decorLine(150, 4500, 260, ['rock1', 'rock_small', 'tree']),
    boss: { startAt: 4600 }
  }
]

// ---------- TERRENO (mesma espinha dorsal de sempre) ----------
let SEGMENT_TABLE = null
let TOTAL_LENGTH = 0

function buildSegmentTable(segments) {
  let startX = 0
  let startHeight = 0
  const table = []
  for (const seg of segments) {
    table.push({ type: seg.type, startX, endX: startX + seg.length, length: seg.length, startHeight, heightChange: seg.heightChange })
    startX += seg.length
    startHeight += seg.heightChange
  }
  return table
}

function setLevelTables(i) {
  SEGMENT_TABLE = buildSegmentTable(LEVELS[i].segments)
  TOTAL_LENGTH = SEGMENT_TABLE[SEGMENT_TABLE.length - 1].endX
}

function getSegmentAt(worldX) {
  if (worldX <= 0) return SEGMENT_TABLE[0]
  for (const seg of SEGMENT_TABLE) {
    if (worldX >= seg.startX && worldX <= seg.endX) return seg
  }
  return SEGMENT_TABLE[SEGMENT_TABLE.length - 1]
}

function getGroundHeight(worldX) {
  const seg = getSegmentAt(worldX)
  const t = Phaser.Math.Clamp((worldX - seg.startX) / seg.length, 0, 1)
  return seg.startHeight + t * seg.heightChange
}

function getSnappedGroundY(worldX) {
  const screenY = GROUND_BASE_Y - getGroundHeight(worldX)
  return Math.floor(screenY / TILE_PX) * TILE_PX
}

function pseudoRandom(n) {
  const v = Math.sin(n * 127.1) * 43758.5453
  return v - Math.floor(v)
}

function getTerrainAngle(worldX) {
  const dh = getGroundHeight(worldX + 30) - getGroundHeight(worldX - 30)
  return Math.atan2(-dh, 60)
}

class GreenHillsScene extends Phaser.Scene {
  constructor() {
    super('GreenHills')
  }

  init(data) {
    this.startLevel = (data && typeof data.level === 'number') ? data.level : (this.startLevel || 0)
  }

  preload() {
    this.load.off('loaderror')
    this.load.on('loaderror', (file) => this.buildFallbackTexture(file.key))

    this.load.image('grass0', 'assets/grass0.png')
    this.load.image('grass1', 'assets/grass1.png')
    this.load.image('grass2', 'assets/grass2.png')
    this.load.image('dirt0', 'assets/dirt0.png')
    this.load.image('dirt1', 'assets/dirt1.png')
    this.load.image('dirt2', 'assets/dirt2.png')
    this.load.image('tree', 'assets/tree.png')
    this.load.image('bush', 'assets/bush.png')
    this.load.image('rock1', 'assets/rock1.png')
    this.load.image('rock_small', 'assets/rock_small.png')
    this.load.image('orb', 'assets/orb.png')
    this.load.image('player', 'assets/player.png')
    this.load.image('flag', 'assets/flag.png')
    this.load.image('cloud', 'assets/cloud.png')
    this.load.image('hills', 'assets/hills.png')
    this.load.image('dust', 'assets/dust.png')
    this.load.image('coin', 'assets/coin.png')
    this.load.image('boulder', 'assets/boulder.png')
    this.load.image('boss', 'assets/boss.png')
  }

  // Mede texturas de forma compatível com qualquer Phaser 3.x
  texSize(key) {
    const tex = this.textures.get(key)
    if (tex) {
      if (tex.frames && tex.frames.__BASE) {
        const f = tex.frames.__BASE
        const w = f.cutWidth || f.width
        const h = f.cutHeight || f.height
        if (w && h) return { w: w, h: h }
      }
      if (typeof tex.getSourceImage === 'function') {
        const img = tex.getSourceImage()
        if (img && img.width) return { w: img.width, h: img.height }
      }
    }
    return { w: 32, h: 32 }
  }

  // FIX DO TAMANHO: escala uniforme limitada por altura E largura.
  // PNG largo nunca mais vira um monstrengo esticado.
  fitSprite(img, key, spec) {
    const s = this.texSize(key)
    const k = Math.min(spec.h / s.h, (spec.maxW || spec.h * 2) / s.w)
    img.setDisplaySize(s.w * k, s.h * k)
    return k
  }

  buildFallbackTexture(key) {
    if (!key || this.textures.exists(key)) return
    const g = this.make.graphics({ x: 0, y: 0, add: false })

    switch (key) {
      case 'grass0': case 'grass1': case 'grass2': {
        g.fillStyle(0x3d9e45, 1); g.fillRect(0, 0, 16, 16)
        g.fillStyle(0x57c25c, 1); g.fillRect(0, 0, 16, 5)
        g.fillStyle(0x77d96f, 1); g.fillRect(0, 0, 16, 2)
        for (let i = 0; i < 14; i++) {
          const px = Math.floor(pseudoRandom(key.length * 31 + i) * 16)
          const py = 5 + Math.floor(pseudoRandom(key.length * 77 + i) * 11)
          g.fillStyle(pseudoRandom(i * 3 + key.length) > 0.5 ? 0x2f7d38 : 0x4fae52, 1)
          g.fillRect(px, py, 1, 1)
        }
        if (key === 'grass1') { g.fillStyle(0x2f7d38, 1); g.fillRect(11, 0, 5, 16) }
        if (key === 'grass2') { g.fillStyle(0x2f7d38, 1); g.fillRect(0, 0, 5, 16) }
        g.generateTexture(key, 16, 16)
        break
      }
      case 'dirt0': case 'dirt1': case 'dirt2': {
        g.fillStyle(0x7a5230, 1); g.fillRect(0, 0, 16, 16)
        for (let i = 0; i < 16; i++) {
          const px = Math.floor(pseudoRandom(key.length * 13 + i * 7) * 16)
          const py = Math.floor(pseudoRandom(key.length * 29 + i * 3) * 16)
          g.fillStyle(pseudoRandom(i + key.length) > 0.5 ? 0x684427 : 0x8b6039, 1)
          g.fillRect(px, py, 2, 2)
        }
        g.generateTexture(key, 16, 16)
        break
      }
      case 'tree': {
        g.fillStyle(0x6b4226, 1); g.fillRect(12, 28, 6, 18)
        g.fillStyle(0x2e7d32, 1)
        g.fillCircle(15, 18, 14); g.fillCircle(8, 24, 9); g.fillCircle(22, 24, 9)
        g.fillStyle(0x43a047, 1); g.fillCircle(11, 13, 6); g.fillCircle(19, 17, 5)
        g.fillStyle(0x66bb6a, 1); g.fillCircle(12, 10, 3)
        g.generateTexture('tree', 30, 46)
        break
      }
      case 'bush': {
        g.fillStyle(0x2f9e44, 1)
        g.fillCircle(7, 12, 6); g.fillCircle(14, 10, 8); g.fillCircle(21, 12, 6)
        g.fillStyle(0x54c468, 1); g.fillCircle(12, 8, 4); g.fillCircle(18, 9, 3)
        g.generateTexture('bush', 28, 18)
        break
      }
      case 'rock1': {
        g.fillStyle(0x9e9e9e, 1)
        g.fillTriangle(1, 17, 6, 5, 15, 2)
        g.fillTriangle(1, 17, 15, 2, 24, 17)
        g.fillStyle(0x757575, 1)
        g.fillTriangle(15, 2, 24, 17, 12, 17)
        g.generateTexture('rock1', 26, 18)
        break
      }
      case 'rock_small': {
        g.fillStyle(0x9e9e9e, 1)
        g.fillTriangle(1, 8, 5, 2, 10, 1)
        g.fillTriangle(1, 8, 10, 1, 13, 8)
        g.fillStyle(0x757575, 1)
        g.fillTriangle(10, 1, 13, 8, 7, 8)
        g.generateTexture('rock_small', 14, 9)
        break
      }
      case 'orb': {
        g.fillStyle(0x35e0ff, 0.25); g.fillCircle(10, 10, 10)
        g.fillStyle(0x35e0ff, 0.5); g.fillCircle(10, 10, 7)
        g.fillStyle(0x9ff3ff, 1); g.fillCircle(10, 10, 4)
        g.fillStyle(0xffffff, 1); g.fillCircle(9, 8, 2)
        g.generateTexture('orb', 20, 20)
        break
      }
      case 'player': {
        g.fillStyle(0x1a1a1a, 1); g.fillCircle(9, 25, 7); g.fillCircle(23, 25, 7)
        g.fillStyle(0xcfcfcf, 1); g.fillCircle(9, 25, 2); g.fillCircle(23, 25, 2)
        g.lineStyle(3, 0xff8c42, 1)
        g.beginPath()
        g.moveTo(9, 25); g.lineTo(16, 15); g.lineTo(23, 25)
        g.moveTo(16, 15); g.lineTo(13, 25)
        g.moveTo(16, 15); g.lineTo(19, 25)
        g.moveTo(16, 15); g.lineTo(12, 10)
        g.strokePath()
        g.lineStyle(2, 0x546e7a, 1)
        g.beginPath(); g.moveTo(21, 23); g.lineTo(19, 8); g.moveTo(16, 8); g.lineTo(22, 9); g.strokePath()
        g.fillStyle(0x37474f, 1); g.fillRect(8, 8, 7, 3)
        g.lineStyle(3, 0x2c3e50, 1)
        g.beginPath(); g.moveTo(11, 11); g.lineTo(16, 21); g.moveTo(11, 11); g.lineTo(9, 18); g.strokePath()
        g.lineStyle(5, 0x2fb6a8, 1)
        g.beginPath(); g.moveTo(11, 11); g.lineTo(18, 8); g.strokePath()
        g.fillStyle(0xffcf9e, 1); g.fillCircle(21, 6, 3)
        g.fillStyle(0x27496d, 1); g.fillCircle(20, 4, 4)
        g.generateTexture('player', 32, 32)
        break
      }
      case 'flag': {
        g.fillStyle(0x8b5a2b, 1); g.fillRect(2, 0, 3, 36)
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4; col++) {
            g.fillStyle((row + col) % 2 === 0 ? 0x1a1a1a : 0xf2f2f2, 1)
            g.fillRect(5 + col * 3, 2 + row * 4, 3, 4)
          }
        }
        g.generateTexture('flag', 20, 36)
        break
      }
      case 'cloud': {
        g.fillStyle(0xffffff, 0.95)
        g.fillRoundedRect(30, 38, 130, 22, 11)
        g.fillCircle(70, 34, 18); g.fillCircle(105, 26, 24); g.fillCircle(135, 36, 15)
        g.generateTexture('cloud', 200, 70)
        break
      }
      case 'hills': {
        g.fillStyle(0x9bd49b, 1)
        g.fillTriangle(0, 120, 64, 34, 128, 120)
        g.fillTriangle(128, 120, 192, 34, 256, 120)
        g.fillStyle(0xe8f6e8, 1)
        g.fillTriangle(58, 46, 64, 34, 70, 46)
        g.fillTriangle(186, 46, 192, 34, 198, 46)
        g.fillStyle(0x63ad63, 1)
        g.fillTriangle(0, 120, 32, 62, 64, 120)
        g.fillTriangle(64, 120, 96, 62, 128, 120)
        g.fillTriangle(128, 120, 160, 62, 192, 120)
        g.fillTriangle(192, 120, 224, 62, 256, 120)
        g.generateTexture('hills', 256, 120)
        break
      }
      case 'dust': {
        g.fillStyle(0xffffff, 0.35); g.fillCircle(6, 6, 6)
        g.fillStyle(0xffffff, 0.8); g.fillCircle(6, 6, 3)
        g.generateTexture('dust', 12, 12)
        break
      }
      case 'coin': {
        g.fillStyle(0xb8860b, 1); g.fillCircle(7, 7, 7)
        g.fillStyle(0xffd93b, 1); g.fillCircle(7, 7, 5)
        g.fillStyle(0xb8860b, 1); g.fillRect(6, 3, 2, 8)
        g.fillStyle(0xfff3b0, 1); g.fillCircle(5, 5, 1)
        g.generateTexture('coin', 14, 14)
        break
      }
      case 'boulder': {
        g.fillStyle(0x6d6d6d, 1)
        g.fillTriangle(1, 21, 7, 3, 20, 1)
        g.fillTriangle(1, 21, 20, 1, 29, 21)
        g.fillStyle(0x4a4a4a, 1)
        g.fillTriangle(20, 1, 29, 21, 15, 21)
        g.fillStyle(0x8a8a8a, 1); g.fillTriangle(7, 3, 11, 8, 9, 12)
        g.generateTexture('boulder', 30, 22)
        break
      }
      case 'boss': {
        // O CAÇADOR: motoqueiro sombrio gigante
        g.fillStyle(0x1c1220, 1); g.fillCircle(16, 52, 16); g.fillCircle(52, 52, 16)
        g.fillStyle(0x3a2a40, 1); g.fillCircle(16, 52, 7); g.fillCircle(52, 52, 7)
        g.fillStyle(0xff2200, 1); g.fillCircle(16, 52, 3); g.fillCircle(52, 52, 3)
        g.lineStyle(4, 0x2a1f30, 1)
        g.beginPath(); g.moveTo(16, 52); g.lineTo(34, 22); g.lineTo(52, 52); g.strokePath()
        g.fillStyle(0x120d16, 1); g.fillRoundedRect(24, 8, 22, 18, 4)
        g.fillStyle(0xff2200, 1); g.fillCircle(30, 15, 2); g.fillCircle(40, 15, 2)
        g.fillStyle(0x0a0710, 1); g.fillTriangle(22, 10, 34, 2, 34, 10)
        g.fillStyle(0x4a1a10, 1); g.fillTriangle(46, 8, 64, 2, 56, 14)
        g.fillStyle(0x552a18, 1); g.fillTriangle(0, 56, 68, 56, 34, 68)
        g.generateTexture('boss', 68, 68)
        break
      }
      default: {
        g.fillStyle(0xff00ff, 1); g.fillRect(0, 0, 16, 16)
        g.generateTexture(key, 16, 16)
      }
    }
    g.destroy()
  }

  // ---------- ÁUDIO SINTETIZADO (WebAudio, zero arquivos) ----------
  initAudio() {
    if (this.audioCtx) { if (this.audioCtx.state === 'suspended') this.audioCtx.resume() ; return }
    try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { this.audioCtx = null }
  }

  beep(freq, dur, type, vol, slideTo, delay) {
    if (!this.audioCtx) return
    try {
      const t0 = this.audioCtx.currentTime + (delay || 0)
      const o = this.audioCtx.createOscillator()
      const gn = this.audioCtx.createGain()
      o.type = type || 'square'
      o.frequency.setValueAtTime(freq, t0)
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur)
      gn.gain.setValueAtTime(vol || 0.05, t0)
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
      o.connect(gn); gn.connect(this.audioCtx.destination)
      o.start(t0); o.stop(t0 + dur + 0.02)
    } catch (e) {}
  }

  sfx(name) {
    switch (name) {
      case 'coin': this.beep(980, 0.08, 'square', 0.04); this.beep(1470, 0.1, 'square', 0.04, 0, 0.07); break
      case 'orb': this.beep(660, 0.25, 'sine', 0.07, 1320); break
      case 'jump': this.beep(300, 0.12, 'square', 0.04, 660); break
      case 'land': this.beep(140, 0.05, 'triangle', 0.04); break
      case 'hurt': this.beep(220, 0.25, 'sawtooth', 0.07, 60); break
      case 'roar': this.beep(95, 0.55, 'sawtooth', 0.11, 38); break
      case 'impact': this.beep(90, 0.12, 'triangle', 0.08, 50); break
      case 'win': this.beep(523, 0.12, 'square', 0.05); this.beep(659, 0.12, 'square', 0.05, 0, 0.12); this.beep(784, 0.25, 'square', 0.06, 0, 0.24); break
      case 'lose': this.beep(300, 0.7, 'sawtooth', 0.07, 70); break
      case 'boom': this.beep(60, 0.6, 'sawtooth', 0.12, 25); break
    }
  }

  create() {
    this.setupLevel(Math.min(this.startLevel, LEVELS.length - 1))

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    this.nextKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

    this.input.keyboard.on('keydown', () => this.initAudio())

    this.redraw()
  }

  setupLevel(index) {
    this.levelIndex = index
    this.level = LEVELS[index]
    const L = this.level
    setLevelTables(index)

    this.worldX = 0
    this.speed = 90
    this.life = 100
    this.o2 = 100
    this.energy = 60
    this.gameOver = false
    this.won = false
    this.elapsed = 0
    this.coinsGot = 0
    this.orbsCollected = 0
    this.dodges = 0
    this.playerY = GROUND_BASE_Y
    this.jumpOff = 0
    this.vy = 0
    this.bobPhase = 0
    this.dustTimer = 0
    this.shakeTimer = 0
    this.hurtTimer = 0
    this.lastDt = 0
    this.bossActive = false
    this.bossDist = 0
    this.bossT = 0
    this.bossAtkTimer = 0
    this.boulders = []

    this.cameras.main.setBackgroundColor(L.skyBottom)

    this.buildSky(L.skyTop, L.skyBottom)
    this.buildCelestial(L.celestial)

    // Parallax com tint da fase
    this.hillsTile = this.add.tileSprite(0, TOTAL_HEIGHT, TOTAL_WIDTH, 150, 'hills')
    this.hillsTile.setOrigin(0, 1).setScrollFactor(0).setDepth(-20).setTint(L.hillsTint)
    this.hillsTile.tileScaleX = 150 / this.texSize('hills').h
    this.hillsTile.tileScaleY = this.hillsTile.tileScaleX
    this.hillsFactor = 0.2 / this.hillsTile.tileScaleX

    const mkCloud = (y, h, factor, driftSpeed, alpha, depth) => {
      const s = h / this.texSize('cloud').h
      const t = this.add.tileSprite(0, y, TOTAL_WIDTH, h, 'cloud')
      t.setOrigin(0, 0).setScrollFactor(0).setDepth(depth).setAlpha(alpha).setTint(L.cloudTint)
      t.tileScaleX = s; t.tileScaleY = s
      return { tile: t, factor: factor / s, drift: 0, driftTex: driftSpeed / s }
    }
    this.cloudFar = mkCloud(12, 60, 0.06, 4, L.cloudAlpha * 0.7, -25)
    this.cloudNear = mkCloud(58, 78, 0.13, 9, L.cloudAlpha, -14)

    // Pool de tiles com tint do bioma
    const poolCols = Math.ceil(TOTAL_WIDTH / TILE_PX) + 4
    this.poolCols = poolCols
    this.tilePool = []
    for (let c = 0; c < poolCols; c++) {
      for (let r = 0; r < GROUND_ROWS; r++) {
        const img = this.add.image(0, 0, L.tiles.fill[0])
        img.setOrigin(0, 0)
        img.setDisplaySize(TILE_PX, TILE_PX)
        img.setDepth(1)
        if (L.groundTint !== 0xffffff) img.setTint(L.groundTint)
        this.tilePool.push(img)
      }
    }

    // Decoração
    this.decorSprites = L.decorations.map(d => {
      const img = this.add.image(0, 0, d.type)
      this.fitSprite(img, d.type, ASSET_SIZES[d.type] || { h: 48, maxW: 70 })
      img.setOrigin(0.5, 1)
      img.setDepth(2)
      if (L.decorTint !== 0xffffff) img.setTint(L.decorTint)
      return { img, worldX: d.x }
    })

    // Jogador
    this.player = this.add.image(CAMERA_OFFSET_X, GROUND_BASE_Y, 'player')
    this.fitSprite(this.player, 'player', ASSET_SIZES.player)
    this.player.setOrigin(0.5, 0.96)
    this.player.setDepth(3)

    // Orbes de O2
    this.orbs = L.powerups.map(p => {
      const img = this.add.image(0, 0, 'orb')
      const k = this.fitSprite(img, 'orb', ASSET_SIZES.orb)
      img.setDepth(2)
      return { img, worldX: p.x, collected: false, k }
    })

    // Moedas
    this.coinSprites = L.coins.map(c => {
      const img = this.add.image(0, 0, 'coin')
      const k = this.fitSprite(img, 'coin', ASSET_SIZES.coin)
      img.setDepth(2)
      if (L.decorTint !== 0xffffff) img.setTint(0xffdd88)
      return { img, worldX: c.x, h: c.h, got: false, k }
    })

    // Obstáculos (pedras no caminho)
    this.obstacleSprites = L.obstacles.map(o => {
      const img = this.add.image(0, 0, 'boulder')
      this.fitSprite(img, 'boulder', ASSET_SIZES.boulder)
      img.setOrigin(0.5, 1)
      img.setDepth(2.5)
      if (L.groundTint !== 0xffffff) img.setTint(L.groundTint)
      return { img, worldX: o.x, hit: false }
    })

    // Boss
    this.bossSprite = this.add.image(0, 0, 'boss')
    this.bossK = this.fitSprite(this.bossSprite, 'boss', ASSET_SIZES.boss)
    this.bossSprite.setOrigin(0.5, 0.94)
    this.bossSprite.setDepth(2.6)
    this.bossSprite.setVisible(false)

    // Pedras voadoras do boss (pool)
    this.boulderSprites = []
    for (let i = 0; i < 6; i++) {
      const img = this.add.image(0, 0, 'boulder')
      this.fitSprite(img, 'boulder', ASSET_SIZES.boulder)
      img.setDepth(2.7)
      img.setVisible(false)
      this.boulderSprites.push(img)
    }

    // Bandeira
    this.flagSprite = this.add.image(0, 0, 'flag')
    this.flagK = this.fitSprite(this.flagSprite, 'flag', ASSET_SIZES.flag)
    this.flagSprite.setOrigin(0.5, 1)
    this.flagSprite.setDepth(2)

    // Poeira
    this.dustK = 14 / this.texSize('dust').h
    this.dustPool = []
    for (let i = 0; i < 20; i++) {
      this.dustPool.push(this.add.image(0, 0, 'dust').setDepth(2).setVisible(false))
    }

    // HUD
    this.terrainLabel = this.add.text(16, 12, '', { fontFamily: FONT, fontSize: '9px', color: '#ffffff' }).setScrollFactor(0).setDepth(10)
    this.speedLabel = this.add.text(16, 30, '', { fontFamily: FONT, fontSize: '9px', color: '#cfe8ff' }).setScrollFactor(0).setDepth(10)
    this.levelLabel = this.add.text(TOTAL_WIDTH / 2, 10, '', { fontFamily: FONT, fontSize: '8px', color: '#fff2c2' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10)
    this.progressText = this.add.text(TOTAL_WIDTH / 2, 42, '', { fontFamily: FONT, fontSize: '8px', color: '#ffffff' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10)

    this.instructionsLabel = this.add.text(
      TOTAL_WIDTH / 2, TOTAL_HEIGHT - 20,
      'ESPACO PEDALA / SHIFT TURBO / SETA-CIMA PULA / R REINICIA',
      { fontFamily: FONT, fontSize: '8px', color: '#ffffff' }
    ).setOrigin(0.5, 1).setScrollFactor(0).setDepth(10).setAlpha(0.85)

    this.fxGraphics = this.add.graphics().setScrollFactor(0).setDepth(4)
    this.hudGraphics = this.add.graphics().setScrollFactor(0).setDepth(10)

    this.resultTitle = this.add.text(TOTAL_WIDTH / 2, 160, '', { fontFamily: FONT, fontSize: '14px', color: '#ffffff', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(20).setVisible(false)
    this.resultText = this.add.text(TOTAL_WIDTH / 2, 205, '', { fontFamily: FONT, fontSize: '9px', color: '#ffffff', align: 'center', lineSpacing: 11 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(20).setVisible(false)
    this.restartHint = this.add.text(TOTAL_WIDTH / 2, 420, '', { fontFamily: FONT, fontSize: '9px', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(20).setVisible(false)
  }

  buildSky(topHex, bottomHex) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(-30)
    const cTop = Phaser.Display.Color.HexStringToColor(topHex)
    const cBot = Phaser.Display.Color.HexStringToColor(bottomHex)
    for (let y = 0; y < TOTAL_HEIGHT; y += 8) {
      const t = y / TOTAL_HEIGHT
      const r = Math.floor(cTop.red + (cBot.red - cTop.red) * t)
      const gg = Math.floor(cTop.green + (cBot.green - cTop.green) * t)
      const b = Math.floor(cTop.blue + (cBot.blue - cTop.blue) * t)
      g.fillStyle((r << 16) | (gg << 8) | b, 1)
      g.fillRect(0, y, TOTAL_WIDTH, 8)
    }
  }

  buildCelestial(kind) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(-28)
    if (kind === 'sun') {
      g.fillStyle(0xfff3b0, 1); g.fillCircle(760, 84, 34)
      g.fillStyle(0xffe066, 1); g.fillCircle(760, 84, 26)
    } else if (kind === 'sunset') {
      g.fillStyle(0xffcf6b, 0.35); g.fillCircle(470, 250, 90)
      g.fillStyle(0xff9a3c, 1); g.fillCircle(470, 250, 52)
      g.fillStyle(0xffe08a, 1); g.fillCircle(470, 250, 38)
    } else if (kind === 'moon') {
      g.fillStyle(0xe8ecff, 1); g.fillCircle(760, 80, 30)
      g.fillStyle(0xc2c9e8, 1); g.fillCircle(750, 72, 7); g.fillCircle(770, 90, 5)
    } else if (kind === 'bloodsun') {
      g.fillStyle(0xff5533, 0.3); g.fillCircle(180, 200, 110)
      g.fillStyle(0xff3311, 1); g.fillCircle(180, 200, 60)
      g.fillStyle(0xff7744, 1); g.fillCircle(180, 200, 44)
    }
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05)
    this.lastDt = dt

    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.restart({ level: this.levelIndex })
      if (this.won && this.levelIndex < LEVELS.length - 1 && Phaser.Input.Keyboard.JustDown(this.nextKey)) {
        this.scene.restart({ level: this.levelIndex + 1 })
      }
      return
    }

    this.elapsed += dt
    this.hurtTimer -= dt

    const seg = getSegmentAt(this.worldX)
    const pedaling = this.spaceKey.isDown
    const P = PHYSICS[seg.type]
    const M = this.level.mods
    const exhausted = this.o2 <= 0
    const turbo = this.shiftKey.isDown && this.energy > 4

    // Pulo
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)
    if (jumpPressed && this.jumpOff <= 0) {
      this.vy = PHYSICS.jumpVel
      this.jumpOff = 0.1
      this.sfx('jump')
    }

    // Física de velocidade
    if (seg.type === 'downhill') {
      this.speed += (P.free + (pedaling ? P.pedal : 0) + (turbo ? PHYSICS.turboAccel : 0)) * dt
      this.o2 += P.o2Rest * dt
      this.energy += PHYSICS.downhillEnergy * dt
    } else {
      const pedal = pedaling ? P.pedal * (exhausted ? PHYSICS.exhaustedPedalMult : 1) : 0
      this.speed += (pedal - P.drag * (M.dragMult || 1) + (turbo ? PHYSICS.turboAccel : 0)) * dt
      this.o2 += (pedaling ? P.o2Pedal : P.o2Rest) * (M.o2Mult || 1) * dt
    }

    if (turbo) this.energy -= PHYSICS.turboDrain * dt

    // Vida / O2 / limites
    if (exhausted) this.life -= PHYSICS.exhaustedLifeDrain * dt
    else if (this.o2 > PHYSICS.healO2Threshold) this.life += PHYSICS.healRate * dt

    this.o2 = Phaser.Math.Clamp(this.o2, 0, 100)
    this.life = Phaser.Math.Clamp(this.life, 0, 100)
    this.energy = Phaser.Math.Clamp(this.energy, 0, 100)
    this.speed = Phaser.Math.Clamp(this.speed, PHYSICS.minSpeed, PHYSICS.maxSpeed)

    this.worldX += this.speed * dt

    // Física do pulo
    if (this.jumpOff > 0 || this.vy !== 0) {
      this.vy -= PHYSICS.gravity * dt
      this.jumpOff += this.vy * dt
      if (this.jumpOff <= 0) {
        this.jumpOff = 0
        this.vy = 0
        this.sfx('land')
        this.spawnDust()
      }
    }

    // Coletas
    for (const o of this.orbs) {
      if (!o.collected && Math.abs(this.worldX - o.worldX) < 34) this.collectOrb(o)
    }
    for (const c of this.coinSprites) {
      if (!c.got && Math.abs(this.worldX - c.worldX) < 28 && Math.abs(this.jumpOff - c.h) < 40) this.collectCoin(c)
    }

    // Obstáculos
    for (const ob of this.obstacleSprites) {
      if (ob.hit) continue
      if (Math.abs(this.worldX - ob.worldX) < 30) {
        if (this.jumpOff > 36) {
          ob.hit = 'dodged'
          this.dodges++
          this.energy = Phaser.Math.Clamp(this.energy + 14, 0, 100)
          this.spawnFloatText(CAMERA_OFFSET_X, this.player.y - 84, 'ESQUIVA! +E', '#7cfc9a')
          this.sfx('coin')
        } else if (this.hurtTimer <= 0) {
          ob.hit = 'hit'
          this.hurt(16, 0.55)
        }
      }
    }

    // Boss
    this.updateBoss(dt)

    // Efeitos
    const struggling = pedaling && seg.type === 'uphill'
    const fast = this.speed > 185 || turbo
    if (struggling || fast) {
      this.dustTimer += dt
      if (this.dustTimer > (turbo ? 0.05 : fast ? 0.07 : 0.13)) {
        this.dustTimer = 0
        this.spawnDust(turbo ? 0x7fe8ff : null)
      }
    }
    if (exhausted) {
      this.shakeTimer -= dt
      if (this.shakeTimer <= 0) {
        this.shakeTimer = 1.2
        this.cameras.main.shake(220, 0.0035)
      }
    }

    if (this.life <= 0) { this.endGame(false); return }
    if (this.worldX >= TOTAL_LENGTH) {
      this.worldX = TOTAL_LENGTH
      this.endGame(true)
      return
    }

    this.terrainLabel.setText('TERRENO: ' + this.labelForType(seg.type))
    this.terrainLabel.setColor(seg.type === 'uphill' ? '#ffb347' : seg.type === 'downhill' ? '#9ad6ff' : '#ffffff')
    this.speedLabel.setText('VEL: ' + Math.round(this.speed) + '  ALT: ' + Math.round(getGroundHeight(this.worldX)) + 'm')
    this.levelLabel.setText('FASE ' + (this.levelIndex + 1) + '/' + LEVELS.length + ': ' + this.level.name)
    this.progressText.setText('MOEDAS: ' + this.coinsGot + '   ' + Math.round(100 * this.worldX / TOTAL_LENGTH) + '%')

    this.redraw()
  }

  hurt(amount, slowMult) {
    this.life -= amount
    this.speed *= slowMult
    this.hurtTimer = 0.9
    this.cameras.main.flash(120, 255, 60, 60)
    this.cameras.main.shake(180, 0.005)
    this.sfx('hurt')
  }

  updateBoss(dt) {
    const B = this.level.boss
    if (!B) return

    if (!this.bossActive) {
      if (this.worldX >= B.startAt) {
        this.bossActive = true
        this.bossDist = 820
        this.bossT = 0
        this.bossAtkTimer = 1.4
        this.bossSprite.setVisible(true)
        this.sfx('roar')
        this.cameras.main.shake(500, 0.008)
        this.spawnFloatText(CAMERA_OFFSET_X, this.player.y - 90, 'O CAÇADOR!', '#ff5c5c')
      }
      return
    }

    this.bossT += dt
    // Velocidade dele: cresce com o tempo; alivia um pouco se já está em cima
    const catchup = this.bossDist > 550 ? 40 : (this.bossDist < 170 ? -14 : 0)
    const bossSpeed = 96 + this.bossT * 3.2 + catchup
    this.bossDist += (this.speed - bossSpeed) * dt
    this.bossDist = Phaser.Math.Clamp(this.bossDist, 40, 900)

    if (this.bossDist < 150) {
      this.life -= 11 * dt
      if (pseudoRandom(this.elapsed * 30) < dt * 3) this.cameras.main.shake(120, 0.004)
    }

    // Arremesso de pedra
    this.bossAtkTimer -= dt
    if (this.bossAtkTimer <= 0) {
      this.bossAtkTimer = 1.5 + pseudoRandom(this.bossT * 77) * 1.1
      this.spawnBoulder()
    }

    // Atualiza pedras em queda
    for (const b of this.boulders) {
      if (b.done) continue
      b.vy += 1150 * dt
      b.y += b.vy * dt
      const gy = getSnappedGroundY(b.wx)
      if (b.y >= gy - 8) {
        b.done = true
        this.sfx('impact')
        this.cameras.main.shake(90, 0.003)
        this.spawnDustAt(b.wx - (this.worldX - CAMERA_OFFSET_X), gy)
        if (Math.abs(this.worldX - b.wx) < 38 && this.jumpOff < 32 && this.hurtTimer <= 0) {
          this.hurt(15, 0.7)
        }
      }
    }
  }

  spawnBoulder() {
    const img = this.boulderSprites.find(s => !s.visible)
    if (!img) return
    const wx = this.worldX + this.speed * 0.85 + (pseudoRandom(this.elapsed * 991) - 0.4) * 160
    const gy = getSnappedGroundY(wx)
    img.setVisible(true)
    img.rotation = pseudoRandom(wx) * 6
    this.boulders.push({ img, wx, y: gy - 430, vy: 0, done: false })
  }

  labelForType(type) {
    if (type === 'flat') return 'PLANO'
    if (type === 'uphill') return 'SUBIDA'
    return 'DESCIDA'
  }

  collectOrb(o) {
    o.collected = true
    o.img.setVisible(false)
    this.orbsCollected++
    this.o2 = 100
    this.energy = 100
    this.life = Phaser.Math.Clamp(this.life + 10, 0, 100)
    this.cameras.main.flash(130, 170, 255, 230)
    this.sfx('orb')
    this.spawnFloatText(o.img.x, o.img.y - 26, '+O2+E', '#9ff3ff')
  }

  collectCoin(c) {
    c.got = true
    c.img.setVisible(false)
    this.coinsGot++
    this.energy = Phaser.Math.Clamp(this.energy + 4, 0, 100)
    this.sfx('coin')
    this.spawnFloatText(c.img.x, c.img.y - 18, '+10', '#ffd93b')
  }

  spawnFloatText(x, y, str, color) {
    const t = this.add.text(x, y, str, { fontFamily: FONT, fontSize: '10px', color }).setOrigin(0.5).setDepth(15)
    this.tweens.add({ targets: t, y: y - 44, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => t.destroy() })
  }

  spawnDust(tint) {
    const d = this.dustPool.find(p => !p.visible)
    if (!d) return
    const j = pseudoRandom(this.elapsed * 913)
    d.setVisible(true)
    d.setAlpha(0.7)
    d.x = CAMERA_OFFSET_X - 14 + j * 12
    d.y = this.playerY - 5
    d.setTint(tint || 0xd8c9a0)
    d.setScale(this.dustK * (0.6 + j * 0.6))
    this.tweens.add({
      targets: d, alpha: 0, x: d.x - 46,
      scaleX: d.scaleX + this.dustK * 0.9, scaleY: d.scaleY + this.dustK * 0.9,
      duration: 500, onComplete: () => d.setVisible(false)
    })
  }

  spawnDustAt(screenX, groundY) {
    for (let i = 0; i < 5; i++) {
      const d = this.dustPool.find(p => !p.visible)
      if (!d) return
      d.setVisible(true)
      d.setAlpha(0.8)
      d.setTint(0xd8c9a0)
      d.x = screenX + (pseudoRandom(i + this.elapsed) - 0.5) * 50
      d.y = groundY - 6
      d.setScale(this.dustK * (0.7 + pseudoRandom(i * 7) * 0.8))
      this.tweens.add({
        targets: d, alpha: 0, y: d.y - 30,
        duration: 480, onComplete: () => d.setVisible(false)
      })
    }
  }

  redraw() {
    const dt = this.lastDt
    const cameraX = this.worldX - CAMERA_OFFSET_X

    this.hillsTile.tilePositionX = cameraX * this.hillsFactor
    for (const c of [this.cloudFar, this.cloudNear]) {
      c.drift += dt * c.driftTex
      c.tile.tilePositionX = cameraX * c.factor + c.drift
    }

    // Terreno
    const T = this.level.tiles
    const firstTileWorldX = Math.floor(cameraX / TILE_PX) * TILE_PX
    let poolIndex = 0
    for (let c = 0; c < this.poolCols; c++) {
      const tileWorldX = firstTileWorldX + c * TILE_PX
      const screenX = tileWorldX - cameraX
      const topY = getSnappedGroundY(tileWorldX + TILE_PX / 2)
      const nextTopY = getSnappedGroundY(tileWorldX + TILE_PX + TILE_PX / 2)

      let topTex = T.flat
      if (nextTopY < topY) topTex = T.rise
      else if (nextTopY > topY) topTex = T.fall

      for (let r = 0; r < GROUND_ROWS; r++) {
        const img = this.tilePool[poolIndex]
        poolIndex++
        const y = topY + r * TILE_PX
        if (y > TOTAL_HEIGHT) { img.setVisible(false); continue }
        img.setVisible(true)
        img.x = screenX
        img.y = y
        img.setTexture(r === 0 ? topTex : T.fill[0])
      }
    }

    // Jogador (pulo + bob + inclinação + i-frames piscando)
    const targetY = getSnappedGroundY(this.worldX)
    this.playerY += (targetY - this.playerY) * Math.min(1, dt * 14)
    let bob = 0
    if (this.spaceKey.isDown && !this.gameOver && this.jumpOff <= 0 && this.speed > 40) {
      this.bobPhase += dt * (5 + this.speed / 28)
      bob = Math.abs(Math.sin(this.bobPhase)) * 3
    }
    this.player.x = CAMERA_OFFSET_X
    this.player.y = this.playerY - this.jumpOff - bob
    this.player.rotation = Phaser.Math.Clamp(getTerrainAngle(this.worldX), -0.45, 0.45)

    if (this.hurtTimer > 0) this.player.setVisible(Math.floor(this.elapsed * 18) % 2 === 0)
    else this.player.setVisible(true)

    const turbo = this.shiftKey.isDown && this.energy > 4 && !this.gameOver
    if (turbo) this.player.setTint(0x7fe8ff)
    else if (this.o2 < 20 && Math.floor(this.elapsed * 6) % 2 === 0) this.player.setTint(0xff9999)
    else this.player.clearTint()

    // Decoração
    for (const dec of this.decorSprites) {
      const screenX = dec.worldX - cameraX
      const onScreen = screenX > -80 && screenX < TOTAL_WIDTH + 80
      dec.img.setVisible(onScreen)
      if (onScreen) {
        dec.img.x = screenX
        dec.img.y = getSnappedGroundY(dec.worldX)
      }
    }

    // Orbes
    for (const o of this.orbs) {
      if (o.collected) continue
      const screenX = o.worldX - cameraX
      const visible = screenX > -40 && screenX < TOTAL_WIDTH + 40
      o.img.setVisible(visible)
      if (visible) {
        o.img.x = screenX
        o.img.y = getSnappedGroundY(o.worldX) - 42 + Math.sin(this.elapsed * 3 + o.worldX) * 6
        o.img.setScale(o.k * (1 + 0.1 * Math.sin(this.elapsed * 4 + o.worldX)))
      }
    }

        // Moedas girando
    for (const c of this.coinSprites) {
      if (c.got) continue
      const screenX = c.worldX - cameraX
      const visible = screenX > -30 && screenX < TOTAL_WIDTH + 30
      c.img.setVisible(visible)
      if (visible) {
        c.img.x = screenX
        c.img.y = getSnappedGroundY(c.worldX) - c.h
        const spin = Math.cos(this.elapsed * 6 + c.worldX * 0.1)
        c.img.scaleX = c.k * Math.max(0.15, Math.abs(spin))
      }
    }

    // Obstáculos
    for (const ob of this.obstacleSprites) {
      const screenX = ob.worldX - cameraX
      const visible = screenX > -60 && screenX < TOTAL_WIDTH + 60
      ob.img.setVisible(visible)
      if (visible) {
        ob.img.x = screenX
        ob.img.y = getSnappedGroundY(ob.worldX)
      }
    }

    // Boss
    this.fxGraphics.clear()
    if (this.bossActive && !this.gameOver) {
      const bossScreenX = CAMERA_OFFSET_X - this.bossDist
      const bossWorldX = this.worldX - this.bossDist
      this.bossSprite.x = Phaser.Math.Clamp(bossScreenX, -140, TOTAL_WIDTH)
      this.bossSprite.y = getSnappedGroundY(Math.max(0, bossWorldX)) - Math.abs(Math.sin(this.elapsed * 7)) * 10
      this.bossSprite.flipX = true

      // Sombra dele
      this.fxGraphics.fillStyle(0x000000, 0.25)
      this.fxGraphics.fillEllipse(this.bossSprite.x, getSnappedGroundY(Math.max(0, bossWorldX)) + 4, 130, 18)
    }

    // Pedras caindo + sombras-alvo
    for (const b of this.boulders) {
      if (b.done) { b.img.setVisible(false); continue }
      b.img.setVisible(true)
      b.img.x = b.wx - cameraX
      b.img.y = b.y
      b.img.rotation += this.lastDt * 4
      const gy = getSnappedGroundY(b.wx)
      const prog = Phaser.Math.Clamp(1 - (gy - b.y) / 430, 0, 1)
      this.fxGraphics.fillStyle(0xff2200, 0.25 + prog * 0.35)
      this.fxGraphics.fillEllipse(b.wx - cameraX, gy - 3, 10 + prog * 44, 5 + prog * 14)
    }
    this.boulders = this.boulders.filter(b => !b.done || b.img.visible)

    // Bandeira
    const flagScreenX = TOTAL_LENGTH - cameraX
    this.flagSprite.x = flagScreenX
    this.flagSprite.y = getSnappedGroundY(TOTAL_LENGTH)
    this.flagSprite.setScale(this.flagK * (1 + 0.04 * Math.sin(this.elapsed * 3)), this.flagK)

    // Linhas de velocidade (turbo reforça)
    if ((this.speed > 175 || turbo) && !this.gameOver) {
      const f = turbo ? 1 : (this.speed - 175) / (PHYSICS.maxSpeed - 175)
      this.fxGraphics.lineStyle(2, turbo ? 0x7fe8ff : 0xffffff, 0.4 * f)
      const nLines = turbo ? 8 : 5
      for (let i = 0; i < nLines; i++) {
        const jy = this.player.y - 30 + pseudoRandom(Math.floor(this.elapsed * 12) + i * 7) * 40
        const len = 18 + pseudoRandom(i * 13 + Math.floor(this.elapsed * 12)) * 30
        this.fxGraphics.lineBetween(CAMERA_OFFSET_X - 30 - len, jy, CAMERA_OFFSET_X - 26, jy)
      }
    }

    this.drawHUD()
  }

  drawHUD() {
    const g = this.hudGraphics
    g.clear()

    // Painel: VIDA / O2 / ENERGIA
    const px = TOTAL_WIDTH - 236
    const py = 8
    g.fillStyle(0x0a1a2a, 0.55)
    g.fillRoundedRect(px, py, 228, 84, 6)

    const bars = [
      { y: py + 9,  v: this.life,   color: 0xff5566, label: 'VIDA' },
      { y: py + 33, v: this.o2,     color: 0x3ec9ff, label: 'O2' },
      { y: py + 57, v: this.energy, color: 0xffd93b, label: 'NRG' }
    ]
    for (const b of bars) {
      g.fillStyle(0x24323f, 1)
      g.fillRect(px + 42, b.y, 176, 12)
      g.fillStyle(b.color, 1)
      g.fillRect(px + 42, b.y, 176 * (b.v / 100), 12)
      g.lineStyle(1, 0xffffff, 0.25)
      g.strokeRect(px + 42, b.y, 176, 12)
    }
    if (!this.vidaLabel) {
      this.vidaLabel = this.add.text(px + 8, py + 12, 'VIDA', { fontFamily: FONT, fontSize: '8px', color: '#ffc2c2' }).setScrollFactor(0).setDepth(10)
      this.o2Label = this.add.text(px + 8, py + 36, 'O2', { fontFamily: FONT, fontSize: '8px', color: '#c2ecff' }).setScrollFactor(0).setDepth(10)
      this.nrgLabel = this.add.text(px + 8, py + 60, 'NRG', { fontFamily: FONT, fontSize: '8px', color: '#ffe9a0' }).setScrollFactor(0).setDepth(10)
    }

    // Barra de progresso
    const bw = 300
    const bx = (TOTAL_WIDTH - bw) / 2
    const by = 26
    g.fillStyle(0x0a1a2a, 0.45)
    g.fillRoundedRect(bx - 6, by - 6, bw + 12, 20, 4)
    g.fillStyle(0x24323f, 1)
    g.fillRect(bx, by, bw, 8)
    g.fillStyle(0x8bd450, 1)
    g.fillRect(bx, by, bw * Phaser.Math.Clamp(this.worldX / TOTAL_LENGTH, 0, 1), 8)
    g.fillStyle(0xffffff, 1)
    g.fillCircle(bx + bw * Phaser.Math.Clamp(this.worldX / TOTAL_LENGTH, 0, 1), by + 4, 4)
    g.fillStyle(0xff8c42, 1)
    g.fillTriangle(bx + bw - 1, by - 4, bx + bw + 7, by, bx + bw - 1, by + 4)

    // Barra do boss (distância)
    if (this.bossActive && !this.gameOver) {
      const danger = 1 - Phaser.Math.Clamp(this.bossDist / 900, 0, 1)
      const bwy = 64
      g.fillStyle(0x2a0a0a, 0.6)
      g.fillRoundedRect(bx - 6, bwy, bw + 12, 22, 4)
      g.fillStyle(0x550000, 1)
      g.fillRect(bx, bwy + 7, bw, 8)
      g.fillStyle(0xff2200, 1)
      g.fillRect(bx, bwy + 7, bw * danger, 8)
      g.fillStyle(0xffd93b, 1)
      g.fillCircle(bx + bw * danger, bwy + 11, 5)
      if (!this.bossLabelL) {
        this.bossLabelL = this.add.text(bx, bwy + 18, 'CACADOR', { fontFamily: FONT, fontSize: '8px', color: '#ff8888' }).setScrollFactor(0).setDepth(10)
        this.bossLabelR = this.add.text(bx + bw, bwy + 18, 'VOCE', { fontFamily: FONT, fontSize: '8px', color: '#9ad6ff' }).setOrigin(1, 0).setScrollFactor(0).setDepth(10)
      }
    }
  }

  endGame(won) {
    this.gameOver = true
    this.won = won

    // Vitória sobre o boss: explosão dele
    if (won && this.bossActive) {
      this.bossSprite.setVisible(false)
      this.sfx('boom')
      this.cameras.main.flash(400, 255, 200, 160)
      for (let i = 0; i < 12; i++) {
        const d = this.dustPool.find(p => !p.visible)
        if (!d) break
        d.setVisible(true); d.setAlpha(1); d.setTint(0xff6633)
        d.x = this.bossSprite.x; d.y = this.bossSprite.y - 40
        this.tweens.add({
          targets: d, alpha: 0,
          x: d.x + (pseudoRandom(i * 3) - 0.5) * 240,
          y: d.y - pseudoRandom(i * 7) * 160,
          duration: 700 + pseudoRandom(i) * 400,
          onComplete: () => d.setVisible(false)
        })
      }
    }

    const dim = this.add.graphics().setScrollFactor(0).setDepth(15)
    dim.fillStyle(0x08131f, 0.6)
    dim.fillRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT)

    // Pontuação e rank
    const score = this.coinsGot * 10 + this.orbsCollected * 60 + this.dodges * 25 +
      Math.round(this.life) + Math.round(this.o2) + Math.round(this.energy) +
      (won && this.bossActive ? Math.round(this.bossDist / 3) : 0)

    let rank = 'D'
    let color = '#d8d8d8'
    if (won) {
      if (score >= 560) { rank = 'S'; color = '#ffd93b' }
      else if (score >= 460) { rank = 'A'; color = '#7cfc9a' }
      else if (score >= 360) { rank = 'B'; color = '#9ad6ff' }
      else if (score >= 240) { rank = 'C'; color = '#ffcf6b' }
    } else { rank = 'F'; color = '#ff5c5c' }

    // Recorde local
    let record = null
    try {
      const key = 'pedalha_best_l' + this.levelIndex
      const prev = parseInt(localStorage.getItem(key) || '0', 10)
      if (won && score > prev) { localStorage.setItem(key, String(score)); record = score }
      else record = prev || null
    } catch (e) {}

    const isLast = this.levelIndex >= LEVELS.length - 1
    if (won && isLast) {
      this.resultTitle.setText('VOCE VENCEU O CACADOR!')
    } else if (won) {
      this.resultTitle.setText('FASE ' + (this.levelIndex + 1) + ' CONCLUIDA!')
    } else {
      this.resultTitle.setText('VOCE NAO AGUENTOU...')
    }
    this.resultTitle.setColor(color)
    this.resultTitle.setVisible(true)

    const lines = [
      'TEMPO: ' + this.elapsed.toFixed(1) + 's',
      'VIDA: ' + Math.round(this.life) + '  O2: ' + Math.round(this.o2) + '  NRG: ' + Math.round(this.energy),
      'MOEDAS: ' + this.coinsGot + '  ORBES: ' + this.orbsCollected + '/' + this.level.powerups.length,
      'ESQUIVAS: ' + this.dodges,
      'PONTOS: ' + score + (record === score ? '  (NOVO RECORDE!)' : record ? '  RECORDE: ' + record : ''),
      '',
      'RANK: ' + rank
    ]
    this.resultText.setText(lines.join('\n'))
    this.resultText.setVisible(true)

    this.restartHint.setText(
      won && !isLast ? 'ENTER: PROXIMA FASE   /   R: REPETIR' : 'APERTE R PARA TENTAR DE NOVO'
    )
    this.restartHint.setVisible(true)
    this.tweens.add({ targets: this.restartHint, alpha: 0.15, duration: 550, yoyo: true, repeat: -1 })

    if (won) { this.sfx('win'); this.cameras.main.flash(250, 255, 255, 220) }
    else { this.sfx('lose'); this.cameras.main.shake(300, 0.006) }
  }
}

const config = {
  type: Phaser.AUTO,
  width: TOTAL_WIDTH,
  height: TOTAL_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#8fd0f5',
  pixelArt: true,
  roundPixels: true,
  scene: [GreenHillsScene]
}

function startGame() {
  new Phaser.Game(config)
}

if (document.fonts && document.fonts.ready) {
  document.fonts.load("11px 'Press Start 2P'").then(startGame)
} else {
  startGame()
}