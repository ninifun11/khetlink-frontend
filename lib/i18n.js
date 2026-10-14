
'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी', short: 'हि' },
  { code: 'te', label: 'తెలుగు', short: 'తె' },
];

const STORAGE_KEY = 'khetlink_lang';

// Add new strings here. English is the fallback if a key is missing in another language.
export const MESSAGES = {
  en: {
    'nav.marketplace': 'Marketplace',
    'nav.signIn': 'Sign in',
    'nav.createAccount': 'Create account',
    'nav.dashboard': 'Dashboard',
    'nav.cart': 'Cart',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'nav.language': 'Language',
    'common.add': 'Add',
    'common.added': 'Added',
    'common.search': 'Search',
    'common.loading': 'Loading…',
    'common.save': 'Save changes',
    'common.cancel': 'Cancel',
    'common.signOut': 'Sign out',
    'product.left': '{qty} {unit} left',
    'product.save': 'Save {pct}%',
    'product.organic': 'Organic',
    'auth.signIn': 'Sign in',
    'auth.welcome': 'Welcome back to KhetLink.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.newHere': 'New here?',
    'auth.createAnAccount': 'Create an account',
    'auth.demo': 'Try a demo account',
    'home.title1': 'Farm-gate prices for farmers.',
    'home.title2': 'Fresher, cheaper produce for you.',
    'home.browse': 'Browse produce',
    'home.startSelling': 'Start selling',
    'market.title': 'Marketplace',
    'market.searchPlaceholder': 'Search tomato, rice, mango…',
    'market.filters': 'Filters',
    'market.listings': '{n} listings',
    'cart.title': 'Your cart',
    'cart.empty': 'Your cart is empty',
    'cart.delivery': 'Delivery',
    'cart.total': 'Total',
    'cart.placeOrder': 'Place order',
    'menu.Overview': 'Overview',
    'menu.My listings': 'My listings',
    'menu.Listings': 'Listings',
    'menu.Orders': 'Orders',
    'menu.Market outlook': 'Market outlook',
    'menu.Profile & location': 'Profile & location',
    'menu.Logistics': 'Logistics',
    'menu.My orders': 'My orders',
    'menu.Price outlook': 'Price outlook',
    'menu.My deliveries': 'My deliveries',
    'menu.Platform overview': 'Platform overview',
    'menu.All orders': 'All orders',
    'menu.All listings': 'All listings',
    'role.farmer': 'Farmer',
    'role.fpo': 'FPO / cooperative',
    'role.consumer': 'Household',
    'role.bulk_buyer': 'Bulk buyer',
    'role.driver': 'Driver',
    'role.admin': 'Admin',
    'prod.title.mine': 'My listings',
    'prod.title.all': 'All listings',
    'prod.subtitle': 'What buyers can see and order right now.',
    'prod.new': 'New listing',
    'prod.col.produce': 'Produce',
    'prod.col.price': 'Price',
    'prod.col.stock': 'Stock',
    'prod.col.status': 'Status',
    'prod.col.actions': 'Actions',
    'prod.status.active': 'active',
    'prod.status.paused': 'paused',
    'prod.status.sold_out': 'sold out',
    'prod.vsMandi': '{sign}{pct}% vs mandi',
    'prod.emptyTitle': 'No listings yet',
    'prod.createFirst': 'Create your first listing',
  },
  hi: {
    'nav.marketplace': 'बाज़ार',
    'nav.signIn': 'साइन इन',
    'nav.createAccount': 'खाता बनाएँ',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.cart': 'कार्ट',
    'nav.openMenu': 'मेन्यू खोलें',
    'nav.closeMenu': 'मेन्यू बंद करें',
    'nav.language': 'भाषा',
    'common.add': 'जोड़ें',
    'common.added': 'जुड़ गया',
    'common.search': 'खोजें',
    'common.loading': 'लोड हो रहा है…',
    'common.save': 'बदलाव सहेजें',
    'common.cancel': 'रद्द करें',
    'common.signOut': 'साइन आउट',
    'product.left': '{qty} {unit} बचा',
    'product.save': '{pct}% बचाएँ',
    'product.organic': 'जैविक',
    'auth.signIn': 'साइन इन',
    'auth.welcome': 'खेतलिंक में आपका फिर से स्वागत है।',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.newHere': 'नए हैं?',
    'auth.createAnAccount': 'खाता बनाएँ',
    'auth.demo': 'डेमो खाता आज़माएँ',
    'home.title1': 'किसानों के लिए खेत के भाव।',
    'home.title2': 'आपके लिए ताज़ा और सस्ती उपज।',
    'home.browse': 'उपज देखें',
    'home.startSelling': 'बेचना शुरू करें',
    'market.title': 'बाज़ार',
    'market.searchPlaceholder': 'टमाटर, चावल, आम खोजें…',
    'market.filters': 'फ़िल्टर',
    'market.listings': '{n} लिस्टिंग',
    'cart.title': 'आपका कार्ट',
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.delivery': 'डिलीवरी',
    'cart.total': 'कुल',
    'cart.placeOrder': 'ऑर्डर करें',
    'menu.Overview': 'अवलोकन',
    'menu.My listings': 'मेरी लिस्टिंग',
    'menu.Listings': 'लिस्टिंग',
    'menu.Orders': 'ऑर्डर',
    'menu.Market outlook': 'बाज़ार का अनुमान',
    'menu.Profile & location': 'प्रोफ़ाइल और स्थान',
    'menu.Logistics': 'लॉजिस्टिक्स',
    'menu.My orders': 'मेरे ऑर्डर',
    'menu.Price outlook': 'भाव का अनुमान',
    'menu.My deliveries': 'मेरी डिलीवरी',
    'menu.Platform overview': 'प्लेटफ़ॉर्म अवलोकन',
    'menu.All orders': 'सभी ऑर्डर',
    'menu.All listings': 'सभी लिस्टिंग',
    'role.farmer': 'किसान',
    'role.fpo': 'एफपीओ / सहकारी संस्था',
    'role.consumer': 'घरेलू खरीदार',
    'role.bulk_buyer': 'थोक खरीदार',
    'role.driver': 'ड्राइवर',
    'role.admin': 'एडमिन',
    'prod.title.mine': 'मेरी लिस्टिंग',
    'prod.title.all': 'सभी लिस्टिंग',
    'prod.subtitle': 'खरीदार अभी क्या देख और ऑर्डर कर सकते हैं।',
    'prod.new': 'नई लिस्टिंग',
    'prod.col.produce': 'उपज',
    'prod.col.price': 'भाव',
    'prod.col.stock': 'स्टॉक',
    'prod.col.status': 'स्थिति',
    'prod.col.actions': 'कार्य',
    'prod.status.active': 'सक्रिय',
    'prod.status.paused': 'रुकी हुई',
    'prod.status.sold_out': 'बिक गया',
    'prod.vsMandi': 'मंडी के मुकाबले {sign}{pct}%',
    'prod.emptyTitle': 'अभी कोई लिस्टिंग नहीं',
    'prod.createFirst': 'अपनी पहली लिस्टिंग बनाएँ',
  },
  te: {
    'nav.marketplace': 'మార్కెట్',
    'nav.signIn': 'సైన్ ఇన్',
    'nav.createAccount': 'ఖాతా సృష్టించండి',
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.cart': 'కార్ట్',
    'nav.openMenu': 'మెనూ తెరవండి',
    'nav.closeMenu': 'మెనూ మూసివేయండి',
    'nav.language': 'భాష',
    'common.add': 'చేర్చండి',
    'common.added': 'చేర్చబడింది',
    'common.search': 'వెతకండి',
    'common.loading': 'లోడ్ అవుతోంది…',
    'common.save': 'మార్పులను సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.signOut': 'సైన్ అవుట్',
    'product.left': '{qty} {unit} మిగిలింది',
    'product.save': '{pct}% ఆదా చేయండి',
    'product.organic': 'సేంద్రియ',
    'auth.signIn': 'సైన్ ఇన్',
    'auth.welcome': 'ఖేత్‌లింక్‌కు మళ్లీ స్వాగతం.',
    'auth.email': 'ఈమెయిల్',
    'auth.password': 'పాస్‌వర్డ్',
    'auth.newHere': 'కొత్తవారా?',
    'auth.createAnAccount': 'ఖాతా సృష్టించండి',
    'auth.demo': 'డెమో ఖాతాను ప్రయత్నించండి',
    'home.title1': 'రైతులకు పొలం ధరలు.',
    'home.title2': 'మీకు తాజా, చౌకైన పంటలు.',
    'home.browse': 'పంటలను చూడండి',
    'home.startSelling': 'అమ్మడం ప్రారంభించండి',
    'market.title': 'మార్కెట్',
    'market.searchPlaceholder': 'టమాటా, బియ్యం, మామిడి వెతకండి…',
    'market.filters': 'ఫిల్టర్లు',
    'market.listings': '{n} లిస్టింగ్‌లు',
    'cart.title': 'మీ కార్ట్',
    'cart.empty': 'మీ కార్ట్ ఖాళీగా ఉంది',
    'cart.delivery': 'డెలివరీ',
    'cart.total': 'మొత్తం',
    'cart.placeOrder': 'ఆర్డర్ చేయండి',
    'menu.Overview': 'అవలోకనం',
    'menu.My listings': 'నా లిస్టింగ్\u200cలు',
    'menu.Listings': 'లిస్టింగ్\u200cలు',
    'menu.Orders': 'ఆర్డర్లు',
    'menu.Market outlook': 'మార్కెట్ అంచనా',
    'menu.Profile & location': 'ప్రొఫైల్ & స్థానం',
    'menu.Logistics': 'లాజిస్టిక్స్',
    'menu.My orders': 'నా ఆర్డర్లు',
    'menu.Price outlook': 'ధర అంచనా',
    'menu.My deliveries': 'నా డెలివరీలు',
    'menu.Platform overview': 'ప్లాట్\u200cఫామ్ అవలోకనం',
    'menu.All orders': 'అన్ని ఆర్డర్లు',
    'menu.All listings': 'అన్ని లిస్టింగ్\u200cలు',
    'role.farmer': 'రైతు',
    'role.fpo': 'FPO / సహకార సంస్థ',
    'role.consumer': 'గృహ కొనుగోలుదారు',
    'role.bulk_buyer': 'టోకు కొనుగోలుదారు',
    'role.driver': 'డ్రైవర్',
    'role.admin': 'అడ్మిన్',
    'prod.title.mine': 'నా లిస్టింగ్\u200cలు',
    'prod.title.all': 'అన్ని లిస్టింగ్\u200cలు',
    'prod.subtitle': 'కొనుగోలుదారులు ఇప్పుడు చూడగలిగే, ఆర్డర్ చేయగలిగేవి.',
    'prod.new': 'కొత్త లిస్టింగ్',
    'prod.col.produce': 'పంట',
    'prod.col.price': 'ధర',
    'prod.col.stock': 'స్టాక్',
    'prod.col.status': 'స్థితి',
    'prod.col.actions': 'చర్యలు',
    'prod.status.active': 'చురుకుగా',
    'prod.status.paused': 'నిలిపివేయబడింది',
    'prod.status.sold_out': 'అమ్ముడైంది',
    'prod.vsMandi': 'మండీతో పోలిస్తే {sign}{pct}%',
    'prod.emptyTitle': 'ఇంకా లిస్టింగ్\u200cలు లేవు',
    'prod.createFirst': 'మీ మొదటి లిస్టింగ్\u200cను సృష్టించండి',
  },
};

/** Look up a key in the chosen language, fall back to English, then to the key itself; fills {placeholders}. */
export function translate(lang, key, vars) {
  const str = MESSAGES[lang]?.[key] ?? MESSAGES.en[key] ?? key;
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m));
}

/** Like translate() but returns `fallback` (not the key) when the key has no translation. */
export function translateOr(lang, key, fallback) {
  return MESSAGES[lang]?.[key] ?? MESSAGES.en[key] ?? fallback;
}

const I18nContext = createContext(null);

export function LanguageProvider({ children }) {
  // Always start in English so the server and first browser render match, then switch to the saved language.
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const tf = useCallback((key, fallback) => translateOr(lang, key, fallback), [lang]);
  const value = useMemo(() => ({ lang, setLang, t, tf }), [lang, setLang, t, tf]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
};