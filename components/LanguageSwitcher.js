'use client';
import { Languages } from 'lucide-react';
import { LANGUAGES, useI18n } from '@/lib/i18n';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t('nav.language')}</span>
      <Languages className="pointer-events-none absolute left-2.5 h-4 w-4 text-ink-soft" aria-hidden />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="input w-auto cursor-pointer py-1.5 pl-8 pr-8 text-[13px] font-medium"
      >
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}
