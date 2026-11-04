import type { ThemeName } from './types.ts';

export interface ThemeTokens {
  name: ThemeName;
  light: Record<string, string>;
  dark: Record<string, string>;
  gradient: string;          // brand gradient used for em/progress (or flat color)
  radius: { r: string; sm: string; xs: string };
  font: string;
  ambient: 'particles' | 'orbs' | 'none';
  glass: boolean;
}

const base = {
  azure: '#1A8CFF', 'azure-100': '#DDEEFF', 'azure-50': '#F0F7FF',
  violet: '#8B5CF6', 'violet-100': '#EDE6FF', 'violet-50': '#F7F3FF',
  teal: '#0BA896', 'teal-100': '#D5F5EF', 'teal-50': '#EEFBF8',
  amber: '#E58A00', 'amber-100': '#FFEFD3', 'amber-50': '#FFF8EC',
  rose: '#E8364F', 'rose-100': '#FFE3E8', 'rose-50': '#FFF4F6',
  navy: '#14244D', 'navy-100': '#E2E8F4', 'navy-50': '#F1F4FA',
  ok: '#12A150', 'ok-100': '#DAF5E4', 'ok-50': '#F0FBF4',
  danger: '#D93025', 'danger-100': '#FDE8E6', 'danger-50': '#FEF4F3',
  gold: '#C98A00', 'gold-100': '#FFF1C9',
};
const baseDark = {
  azure: '#5AAEFF', 'azure-100': '#12305A', 'azure-50': '#0E2546',
  violet: '#B88BFF', 'violet-100': '#2D1E5C', 'violet-50': '#22174A',
  teal: '#3DDBC4', 'teal-100': '#0E3A35', 'teal-50': '#0B2E2A',
  amber: '#FFB54D', 'amber-100': '#45300B', 'amber-50': '#382609',
  rose: '#FF7389', 'rose-100': '#4A1822', 'rose-50': '#3B131B',
  navy: '#C9D6F2', 'navy-100': '#1B2F66', 'navy-50': '#152652',
  ok: '#4ADE80', 'ok-100': '#0F3B2E', 'ok-50': '#0B2E25',
  danger: '#FF7B72', 'danger-100': '#4A1A17', 'danger-50': '#3A1412',
  gold: '#FFD24D', 'gold-100': '#4A3A08',
};

export const THEMES: Record<ThemeName, ThemeTokens> = {
  'signature-white': {
    name: 'signature-white',
    light: { bg: '#FFFFFF', 'bg-2': '#F5F7FB', ink: '#0A1633', text: '#1E2945', muted: '#5A6885', faint: '#7A879F', line: '#E7EBF3', 'line-2': '#D6DDE9', card: '#FFFFFF', 'card-2': '#F7F9FD', 'card-3': '#EFF3FA',
      brand: '#4F5BFF', 'brand-600': '#3E48E6', 'brand-700': '#2E36B5', 'brand-100': '#E5E8FF', 'brand-50': '#F3F4FF', ...base,
      shadow: '0 1px 2px rgba(16,24,64,.05),0 10px 28px rgba(22,34,96,.07)', 'shadow-lg': '0 2px 6px rgba(16,24,64,.05),0 26px 64px rgba(30,42,120,.13)', 'shadow-xl': '0 4px 10px rgba(16,24,64,.06),0 44px 110px rgba(40,52,150,.20)' },
    dark: { bg: '#0A1022', 'bg-2': '#060B18', ink: '#F2F5FC', text: '#D9E1F0', muted: '#9AA9C4', faint: '#6D7C98', line: '#1E2A4A', 'line-2': '#2B3966', card: '#0F1830', 'card-2': '#13203D', 'card-3': '#182747',
      brand: '#8F97FF', 'brand-600': '#A7ADFF', 'brand-700': '#C3C7FF', 'brand-100': '#232A66', 'brand-50': '#191F4D', ...baseDark,
      shadow: '0 12px 32px rgba(0,0,0,.35),0 1px 2px rgba(0,0,0,.3)', 'shadow-lg': '0 24px 60px rgba(0,0,0,.5)', 'shadow-xl': '0 44px 110px rgba(0,0,0,.6)' },
    gradient: 'linear-gradient(115deg,#1A8CFF 0%,#5B63FF 52%,#9B4DFF 100%)',
    radius: { r: '24px', sm: '16px', xs: '11px' }, font: "'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,sans-serif",
    ambient: 'orbs', glass: true,
  },
  'editorial-navy': {
    name: 'editorial-navy',
    light: { bg: '#FFFFFF', 'bg-2': '#E9EEF3', ink: '#0B1A33', text: '#22344F', muted: '#4B5B78', faint: '#78869C', line: '#E3E9F2', 'line-2': '#CBD5E3', card: '#FFFFFF', 'card-2': '#F5F8FC', 'card-3': '#EDF2F8',
      brand: '#2563EB', 'brand-600': '#1D4FD7', 'brand-700': '#1A3FAE', 'brand-100': '#E4ECFF', 'brand-50': '#F2F6FF', ...base, azure: '#0EA5E9', 'azure-100': '#DDF3FD', 'azure-50': '#EFF9FE', violet: '#7C3AED', teal: '#0E9F6E', amber: '#F59E0B', rose: '#F43F5E', navy: '#0F2A5C',
      shadow: '0 14px 40px rgba(11,26,51,.07)', 'shadow-lg': '0 24px 60px rgba(11,26,51,.12)', 'shadow-xl': '0 40px 100px rgba(11,26,51,.18)' },
    dark: { bg: '#0B1526', 'bg-2': '#070E1A', ink: '#F1F5FA', text: '#D5DEEA', muted: '#97A6BC', faint: '#687892', line: '#1C2A42', 'line-2': '#2A3B58', card: '#101C31', 'card-2': '#142340', 'card-3': '#192B4C',
      brand: '#7FA6FF', 'brand-600': '#9DB9FF', 'brand-700': '#BBCDFF', 'brand-100': '#1E3366', 'brand-50': '#172852', ...baseDark,
      shadow: '0 12px 32px rgba(0,0,0,.35)', 'shadow-lg': '0 24px 60px rgba(0,0,0,.5)', 'shadow-xl': '0 44px 110px rgba(0,0,0,.6)' },
    gradient: 'linear-gradient(90deg,#2563EB,#06B6D4)',
    radius: { r: '22px', sm: '14px', xs: '10px' }, font: "'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,sans-serif",
    ambient: 'none', glass: false,
  },
  'vivid-photo': {
    name: 'vivid-photo',
    light: { bg: '#FFFFFF', 'bg-2': '#F4F6FA', ink: '#0B1B3A', text: '#1F2A44', muted: '#5B6B84', faint: '#78869C', line: '#E3E8F0', 'line-2': '#CBD5E3', card: '#FFFFFF', 'card-2': '#F5F8FD', 'card-3': '#EEF3FB',
      brand: '#6D5DF6', 'brand-600': '#5A4BE0', 'brand-700': '#4639B8', 'brand-100': '#E9E6FF', 'brand-50': '#F5F3FF', ...base,
      shadow: '0 12px 32px rgba(15,35,80,.08),0 1px 2px rgba(15,35,80,.06)', 'shadow-lg': '0 24px 60px rgba(15,35,80,.14)', 'shadow-xl': '0 40px 100px rgba(15,35,80,.2)' },
    dark: { bg: '#0C1730', 'bg-2': '#060D1F', ink: '#F3F6FC', text: '#DCE4F2', muted: '#9FB0C9', faint: '#6F809B', line: '#22315A', 'line-2': '#31427A', card: '#122044', 'card-2': '#172852', 'card-3': '#1C3060',
      brand: '#A99CFF', 'brand-600': '#BEB4FF', 'brand-700': '#D3CCFF', 'brand-100': '#2A2566', 'brand-50': '#1F1C50', ...baseDark,
      shadow: '0 12px 32px rgba(0,0,0,.35)', 'shadow-lg': '0 24px 60px rgba(0,0,0,.5)', 'shadow-xl': '0 44px 110px rgba(0,0,0,.6)' },
    gradient: 'linear-gradient(115deg,#6D5DF6,#C86DD7)',
    radius: { r: '22px', sm: '14px', xs: '10px' }, font: "'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,sans-serif",
    ambient: 'none', glass: true,
  },
  'dark-stage': {
    name: 'dark-stage',
    light: { bg: '#0B1020', 'bg-2': '#05080F', ink: '#F4F6FC', text: '#DCE3F2', muted: '#9DACC6', faint: '#6C7B98', line: '#1E2A47', 'line-2': '#2C3B62', card: '#111A33', 'card-2': '#15213F', 'card-3': '#1B2A4C',
      brand: '#7C8CFF', 'brand-600': '#98A5FF', 'brand-700': '#B6C0FF', 'brand-100': '#20286A', 'brand-50': '#181F4E', ...baseDark,
      shadow: '0 12px 32px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.3)', 'shadow-lg': '0 24px 60px rgba(0,0,0,.55)', 'shadow-xl': '0 44px 110px rgba(0,0,0,.65)' },
    dark: { bg: '#0B1020', 'bg-2': '#05080F', ink: '#F4F6FC', text: '#DCE3F2', muted: '#9DACC6', faint: '#6C7B98', line: '#1E2A47', 'line-2': '#2C3B62', card: '#111A33', 'card-2': '#15213F', 'card-3': '#1B2A4C',
      brand: '#7C8CFF', 'brand-600': '#98A5FF', 'brand-700': '#B6C0FF', 'brand-100': '#20286A', 'brand-50': '#181F4E', ...baseDark,
      shadow: '0 12px 32px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.3)', 'shadow-lg': '0 24px 60px rgba(0,0,0,.55)', 'shadow-xl': '0 44px 110px rgba(0,0,0,.65)' },
    gradient: 'linear-gradient(115deg,#5EE7DF,#7C8CFF 50%,#C78BFF)',
    radius: { r: '24px', sm: '16px', xs: '11px' }, font: "'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,sans-serif",
    ambient: 'particles', glass: true,
  },
};

function vars(obj: Record<string, string>): string {
  return Object.entries(obj).map(([k, v]) => `--${k}:${v}`).join(';');
}

/** Returns the :root token CSS for a theme (+ optional brand override) */
export function themeCss(name: ThemeName, brand?: string): string {
  const t = THEMES[name] || THEMES['signature-white'];
  let light = { ...t.light }; let dark = { ...t.dark };
  if (brand && /^#[0-9a-fA-F]{6}$/.test(brand)) {
    light = { ...light, brand, 'brand-600': `color-mix(in srgb,${brand} 85%,#000)`, 'brand-700': `color-mix(in srgb,${brand} 70%,#000)`, 'brand-100': `color-mix(in srgb,${brand} 14%,#fff)`, 'brand-50': `color-mix(in srgb,${brand} 7%,#fff)` };
    dark = { ...dark, brand: `color-mix(in srgb,${brand} 70%,#fff)`, 'brand-600': `color-mix(in srgb,${brand} 55%,#fff)`, 'brand-700': `color-mix(in srgb,${brand} 40%,#fff)`, 'brand-100': `color-mix(in srgb,${brand} 35%,#0A1022)`, 'brand-50': `color-mix(in srgb,${brand} 22%,#0A1022)` };
  }
  const grad = brand && /^#[0-9a-fA-F]{6}$/.test(brand) ? `linear-gradient(115deg,${brand},color-mix(in srgb,${brand} 55%,#8B5CF6))` : t.gradient;
  return `:root{${vars(light)};--qg:${grad};--r:${t.radius.r};--r-sm:${t.radius.sm};--r-xs:${t.radius.xs};--font:${t.font};--ease:cubic-bezier(.16,1,.3,1);--stage-w:1920px;--stage-h:1080px;--f:var(--brand);--f-100:var(--brand-100);--f-50:var(--brand-50)}
html[data-theme=dark]{${vars(dark)}}`;
}
