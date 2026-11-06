/* 3D background scene catalog (Three.js kit in engine/assets/libs/scenes.js) + deterministic variety.
   Every deck gets a different cover/section/closing combination unless the director overrides it for the topic:
   the suggestion is a hash of the deck title, so ten decks made in a row do not all open on the same terrain. */
export const SCENE_NAMES = ['terrain', 'network', 'cubes', 'fireflies', 'aurora', 'orbit', 'waves', 'particles', 'globe'] as const;
export type SceneName = typeof SCENE_NAMES[number];

/** What each scene says — for the director prompt (choose by topic/mood, not by habit). */
export const SCENE_CATALOG: Record<SceneName, string> = {
  terrain: '지형 파도 점 필드 — 데이터 지형·제조·에너지 흐름·국토',
  network: '별자리 네트워크 — 연결·협업·플랫폼·생태계',
  cubes: '떠다니는 유리 블록 — 모듈·반도체·건축·시스템 구성',
  fireflies: '따뜻한 반딧불 — 지역·교육·축제·사람',
  aurora: '흐르는 빛 커튼 — 에너지·광(光)·미래 비전·전환',
  orbit: '궤도 링과 위성 — 정책 체계·생태계·거버넌스·우주',
  waves: '와이어프레임 바다 — 바다·기후·물류·흐름·주기',
  particles: '데이터 스트림 — AI·디지털·속도·검사·신호',
  globe: '점 구체와 아크 — 글로벌·수출·국제협력·네트워크',
};

export const SCENE_DEFAULTS: Record<SceneName, Record<string, unknown>> = {
  terrain: { opacity: .8, camY: 300, camZ: 1050, lookY: -160, y: -380, amp: 75, size: 2, op: .7 },
  network: { opacity: .85, n: 130, ox: 380, link: 250, lop: .45 },
  cubes: { opacity: .8 }, fireflies: { opacity: .85 },
  aurora: { opacity: .9, n: 5, op: .16 }, orbit: { opacity: .85, ox: 420, oy: -40 }, waves: { opacity: .85, op: .5 },
  particles: { opacity: .9, lanes: 7, per: 90, speed: .09 }, globe: { opacity: .85, ox: 430, oy: -60 },
};

export function hashStr(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

/** Deterministic trio (cover / section / closing) for a deck — three different scenes, seeded by the title. */
export function suggestScenes(seed: string): { cover: SceneName; section: SceneName; closing: SceneName } {
  const pool = [...SCENE_NAMES]; const h = hashStr(seed || 'qpresen');
  const pick = (k: number) => { const i = (h >>> (k * 5)) % pool.length; return pool.splice(i, 1)[0]; };
  return { cover: pick(0), section: pick(1), closing: pick(2) };
}
