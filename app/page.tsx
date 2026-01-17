'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';

// --- TIPOS ---
type Item = {
  id: string;
  name_en: string;
  name_es: string;
  category: string;
  sell_price: number;
  rarity: string;
  image_url: string;
  description_en: string;
  description_es: string;
  crafting_recipes: any;
  crafting_requirements: any;
  used_for: string[] | null;
  recipe_ingredients: any;
  obtained_from: string[] | null;
  game_id?: string;
};

// --- ICONOS ---
const ICONS = {
  Grid: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/></svg>,
  Augment: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Shield: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>,
  Weapon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 17h4l1-3h3v-3h2v-2h6V6h-6V4H9L3 12v5zm2-4l4-5h3v3h-3l-2 2H5v-2z"/></svg>,
  Mod: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  QuickUse: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/></svg>,
  Key: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21 10h-8.35C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H13l2 2 2-2 2 2 4-4.04L21 10zM7 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>,
  Material: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>,
  Nature: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17 8C8 10 5.9 16.17 3.82 21.34 5.71 18.06 8.46 16.96 9 16.86c-.01.03.01-.26 0-.27.04-.3.08-.6.12-.91a20.76 20.76 0 0 1 1.74-6.31c.06-.11.23-.22.25-.03.22 1.28.31 2.58.42 3.87 1.57-1.12 3.14-2.22 4.74-3.31.25-.23.63.1.5.39-.77 1.83-1.55 3.66-2.31 5.51 2.92-2.18 5.86-4.34 8.56-6.76 0-.15-.17-.23-.29-.29C20.6 8.24 18.9 8.1 17 8z"/></svg>,
  Blueprint: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
};

const CATEGORIES = [
  { id: 'Augment', label_en: 'Augments', label_es: 'Aumentos', icon: ICONS.Augment },
  { id: 'Shield', label_en: 'Shields', label_es: 'Escudos', icon: ICONS.Shield },
  { id: 'Weapon', label_en: 'Weapons', label_es: 'Armas', icon: ICONS.Weapon },
  { id: 'WeaponMod', label_en: 'Weapon Mods', label_es: 'Modif. Armas', icon: ICONS.Mod },
  { id: 'QuickUse', label_en: 'Quick Use', label_es: 'Uso Rápido', icon: ICONS.QuickUse },
  { id: 'Key', label_en: 'Keys', label_es: 'Llaves', icon: ICONS.Key },
  { id: 'Blueprint', label_en: 'Blueprints', label_es: 'Planos', icon: ICONS.Blueprint },
  { id: 'Material', label_en: 'Materials', label_es: 'Materiales', icon: ICONS.Material },
  { id: 'Nature', label_en: 'Nature', label_es: 'Nature', icon: ICONS.Nature },
];

const GAME_MAPS = [
  { id: 'buried-city', name: 'Buried City', short: 'BC' },
  { id: 'dam-battleground', name: 'Dam', short: 'DM' },
  { id: 'the-spaceport', name: 'Spaceport', short: 'SP' },
  { id: 'stella-montis', name: 'Stella Montis', short: 'SM' },
  { id: 'blue-gate', name: 'Blue Gate', short: 'BG' },
];

const RARITY_STYLES: Record<string, { border: string, bg: string, text: string }> = {
  'Legendary': { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  'Epic':      { border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400' },
  'Rare':      { border: 'border-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-400' },
  'Uncommon':  { border: 'border-green-500',   bg: 'bg-green-500/10',   text: 'text-green-400' },
  'Common':    { border: 'border-slate-700',   bg: 'bg-slate-950/50',   text: 'text-slate-400' }
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- CAMBIO V4.2: Default 'en', pero se actualiza solo ---
  const [lang, setLang] = useState<'es' | 'en'>('en');
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const [globalRarityMap, setGlobalRarityMap] = useState<Record<string, string>>({});
  const [globalPriceMap, setGlobalPriceMap] = useState<Record<string, number>>({});
  const [globalImageMap, setGlobalImageMap] = useState<Record<string, string>>({});
  const [globalNameMap, setGlobalNameMap] = useState<Record<string, { en: string, es: string }>>({});
  const [globalLookupMap, setGlobalLookupMap] = useState<Record<string, any>>({}); // Diccionario maestro

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 24; 

  const [communityVotes, setCommunityVotes] = useState<Record<string, Record<string, number>>>({});
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => { 
    // --- LÓGICA DE DETECCIÓN DE IDIOMA ---
    if (typeof window !== 'undefined') {
        const browserLang = window.navigator.language;
        if (browserLang.startsWith('es')) {
            setLang('es');
        }
        // Si no es español, se queda en 'en' (default)
    }

    fetchData(1, null, ''); 
    fetchGlobalData(); 
    fetchVotes();

    const savedVotes = localStorage.getItem('arc_my_votes');
    if (savedVotes) {
        try {
            setMyVotes(JSON.parse(savedVotes));
        } catch (e) {
            console.error("Error cargando votos locales", e);
        }
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchGlobalData = async () => {
    const { data } = await supabase.from('items').select('game_id, name_en, name_es, rarity, sell_price, image_url');
    if (data) {
      const rMap: Record<string, string> = {};
      const pMap: Record<string, number> = {};
      const iMap: Record<string, string> = {};
      const nMap: Record<string, { en: string, es: string }> = {};
      const lookupMap: Record<string, any> = {}; 

      data.forEach((item: any) => {
        const id = item.game_id || item.name_en; 
        if (id) {
            rMap[id] = item.rarity;
            pMap[id] = item.sell_price || 0;
            iMap[id] = item.image_url;
            nMap[id] = { en: item.name_en, es: item.name_es };
            
            // Diccionario por ID
            if (item.game_id) lookupMap[item.game_id.toLowerCase()] = { img: item.image_url, rarity: item.rarity, name_en: item.name_en, name_es: item.name_es };
        }
        if (item.name_en) {
            rMap[item.name_en] = item.rarity;
            // Diccionario por nombre Inglés
            lookupMap[item.name_en.toLowerCase()] = { img: item.image_url, rarity: item.rarity, name_en: item.name_en, name_es: item.name_es };
        }
        if (item.name_es) {
            // Diccionario por nombre Español
            lookupMap[item.name_es.toLowerCase()] = { img: item.image_url, rarity: item.rarity, name_en: item.name_en, name_es: item.name_es };
        }
      });
      setGlobalRarityMap(rMap);
      setGlobalPriceMap(pMap);
      setGlobalImageMap(iMap);
      setGlobalNameMap(nMap);
      setGlobalLookupMap(lookupMap);
    }
  };

  const fetchVotes = async () => {
    const { data } = await supabase.from('map_votes').select('item_id, map_id, votes');
    if (data) {
      const votesMap: Record<string, Record<string, number>> = {};
      data.forEach((row: any) => {
        if (!votesMap[row.item_id]) votesMap[row.item_id] = {};
        votesMap[row.item_id][row.map_id] = row.votes;
      });
      setCommunityVotes(votesMap);
    }
  };

  const fetchData = async (pageNumber: number, filter: string | null, searchTerm: string) => {
    setLoading(true);
    const from = (pageNumber - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase.from('items').select('*', { count: 'exact' });

    if (searchTerm) {
      const cleanTerm = searchTerm.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      query = query.or(`search_text.ilike.%${cleanTerm}%,name_en.ilike.%${searchTerm}%,name_es.ilike.%${searchTerm}%`);
    }

    if (filter) {
      switch (filter) {
        case 'Weapon': query = query.in('category', ['Assault Rifle', 'Battle Rifle', 'Hand Cannon', 'Marksman Rifle', 'Pistol', 'Shotgun', 'Sniper Rifle', 'Submachine Gun', 'Launcher', 'Melee', 'Weapon']); break;
        case 'WeaponMod': query = query.or('category.ilike.%Mod%,category.ilike.%Attachment%,category.ilike.%Magazine%,category.ilike.%Muzzle%'); break;
        case 'Material': query = query.or('category.ilike.%Material%,category.ilike.%Recyclable%'); break;
        case 'QuickUse': query = query.ilike('category', '%Quick Use%'); break;
        case 'Shield': query = query.ilike('category', '%Shield%'); break;
        case 'Augment': query = query.or('category.ilike.%Gadget%,category.ilike.%Skill%,category.ilike.%Augment%'); break;
        case 'Key': query = query.or('category.ilike.%Key%,category.ilike.%Access%'); break;
        case 'Nature': query = query.or('category.ilike.%Nature%,category.ilike.%Plant%,category.ilike.%Organic%'); break;
        case 'Blueprint': query = query.or('category.ilike.%Blueprint%,category.ilike.%Schematic%,category.ilike.%Recipe%'); break;
        default: query = query.eq('category', filter);
      }
    }

    query = query.order('name_en', { ascending: true }).range(from, to);
    const { data, error, count } = await query;

    if (!error) {
      setItems(data || []);
      if (count !== null) setTotalItems(count);
    }
    setLoading(false);
  };

  const handleSearch = (term: string) => {
    setSearch(term);
    setActiveFilter(null);
    setPage(1); 
    fetchData(1, null, term);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setActiveFilter(categoryId);
    setSearch('');
    setPage(1); 
    fetchData(1, categoryId, '');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalItems / ITEMS_PER_PAGE)) return;
    setPage(newPage);
    fetchData(newPage, activeFilter, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVote = async (itemId: string, mapId: string) => {
    const voteKey = `${itemId}-${mapId}`;
    if (myVotes[voteKey]) return; 

    setCommunityVotes(prev => {
        const itemVotes = prev[itemId] || {};
        return { 
            ...prev, 
            [itemId]: { ...itemVotes, [mapId]: (itemVotes[mapId] || 0) + 1 }
        };
    });
    setMyVotes(prev => ({ ...prev, [voteKey]: true }));

    const { error } = await supabase.rpc('increment_vote', { row_item_id: itemId, row_map_id: mapId });
    if (error) console.error("Error votando:", error);
  };

  const calculateRecycleValue = (item: Item) => {
    if (!item.crafting_recipes || Object.keys(item.crafting_recipes).length === 0) return 0;
    let totalValue = 0;
    Object.entries(item.crafting_recipes).forEach(([matId, data]: [string, any]) => {
      const qty = typeof data === 'number' ? data : (data.qty || 1);
      const price = globalPriceMap[matId] || 0;
      totalValue += (price * qty);
    });
    return totalValue;
  };

  const getSmartRecommendation = (item: Item) => {
    if (item.used_for && item.used_for.length > 0) return { action: lang === 'es' ? 'GUARDAR' : 'KEEP', color: 'bg-purple-600 text-purple-100 border-purple-500', icon: '🛡️' };
    if (item.crafting_recipes && Object.keys(item.crafting_recipes).length > 0) {
        return { action: lang === 'es' ? 'RECICLAR' : 'RECYCLE', color: 'bg-blue-600 text-blue-100 border-blue-500', icon: '♻️' };
    }
    return { action: lang === 'es' ? 'VENDER' : 'SELL', color: 'bg-green-600 text-green-100 border-green-500', icon: '💰' };
  };

  const clickToSearch = (itemName: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSearch(itemName);
  };

  const getStyle = (rarity: string | undefined) => RARITY_STYLES[rarity || 'Common'] || RARITY_STYLES['Common'];
  const getStyleById = (id: string) => getStyle(globalRarityMap[id]);
  const isItemCommon = (id: string) => { const r = globalRarityMap[id]; return !r || r === 'Common'; };

  const getVisualData = (rawName: string) => {
    const cleanedName = rawName.replace(/^(Fabricación de |Reciclaje de |Crafting |Recycling |Se compra a |Purchased from )/i, '').trim().toLowerCase();
    const data = globalLookupMap[cleanedName];
    if (!data) {
        return { 
            img: "https://placehold.co/100x100/1e293b/ffffff?text=?", 
            name: cleanedName, 
            style: RARITY_STYLES['Common'], 
            isCommon: true 
        };
    }
    return {
        img: data.img || "https://placehold.co/100x100/1e293b/ffffff?text=?",
        name: lang === 'es' ? (data.name_es || data.name_en) : (data.name_en || data.name_es),
        style: getStyle(data.rarity),
        isCommon: (!data.rarity || data.rarity === 'Common')
    };
  };

  const VisualItemButton = ({ rawString, qty }: { rawString: string, qty?: number }) => {
    const { img, name, style, isCommon } = getVisualData(rawString);
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    return (
      <button onClick={() => clickToSearch(name)} className={`border rounded p-2 flex flex-col items-center gap-1 transition-all text-center group/btn relative bg-slate-900 ${style.border} border-opacity-30 hover:border-opacity-100 hover:bg-slate-800`}>
        <div className={`h-16 w-full flex items-center justify-center mb-1 rounded ${style.bg}`}>
          <img src={img} className="max-h-full max-w-full object-contain drop-shadow-sm" alt={displayName}/>
        </div>
        <span className={`text-xs leading-tight ${isCommon ? 'text-slate-300' : style.text}`}>{displayName}</span>
        {qty !== undefined && <span className="absolute top-1 right-1 bg-slate-950/90 text-slate-200 text-xs font-mono font-bold px-1.5 py-0.5 rounded-full border border-slate-700">x{qty}</span>}
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-orange-500 selection:text-white flex flex-col relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto w-full pt-4">
        <div className="text-sm font-mono text-slate-500 font-bold">v4.2</div>
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="px-4 py-1.5 rounded-full border border-slate-700 hover:border-orange-500 bg-slate-900 transition-all text-sm font-bold text-slate-300 hover:text-white">
          {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto mb-1 text-center w-full">
        <h1 className="text-5xl md:text-6xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600 italic tracking-tighter">ARC TRACKER</h1>
      </div>

      {/* STICKY SEARCH */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 py-4 mb-4 -mx-4 px-4 md:-mx-8 md:px-8 shadow-2xl transition-all">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 items-center">
              <div className="relative group w-full max-w-2xl ">
                  <input
                      type="text"
                      placeholder={lang === 'es' ? "Busca items (ej: Ferro...)" : "Search items..."}
                      className="relative w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 text-lg shadow-inner transition-all"
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                  />
              </div>
          </div>
      </div>

      {/* FILTROS */}
      <div className="w-full mb-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                  <div className="relative group flex flex-col items-center">
                      <button onClick={() => handleCategoryFilter(null)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border-2 ${activeFilter === null ? 'bg-[#E3E3E3] text-black border-[#E3E3E3] scale-110' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'}`}>{ICONS.Grid}</button>
                      <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 whitespace-nowrap z-20 pointer-events-none">{lang === 'es' ? 'Todo' : 'All'}</span>
                  </div>
                  {CATEGORIES.map((cat) => (
                      <div key={cat.id} className="relative group flex flex-col items-center">
                          <button onClick={() => handleCategoryFilter(cat.id)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border-2 ${activeFilter === cat.id ? 'bg-[#E3E3E3] text-black border-[#E3E3E3] scale-110' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'}`}>{cat.icon}</button>
                          <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 whitespace-nowrap z-20 pointer-events-none">{lang === 'es' ? cat.label_es : cat.label_en}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {loading && (
        <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* GRID */}
      {!loading && (
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 max-w-7xl mx-auto space-y-6 w-full mb-12">
        {items.filter((item) => item.name_en !== 'Workbench').map((item) => {
          
          const rec = getSmartRecommendation(item);
          const rarityStyle = getStyle(item.rarity);
          const isBlueprint = item.category?.toLowerCase().includes('blueprint') || item.category?.toLowerCase().includes('schematic') || item.name_en.toLowerCase().includes('blueprint');

          const recycleValue = calculateRecycleValue(item);
          const diff = item.sell_price - recycleValue;
          const lossPercent = item.sell_price > 0 ? Math.round((diff / item.sell_price) * 100) : 0;
          
          const isRecycleAction = (rec.action === 'RECICLAR' || rec.action === 'RECYCLE');
          const showWarning = isRecycleAction && diff > 0;

          return (
            <div key={item.id} className="break-inside-avoid bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3 shadow-lg hover:border-slate-600 transition-all group relative">
              
              <div className="flex gap-3 items-start z-10">
                <div className={`w-16 h-16 rounded-lg flex-shrink-0 border p-1 flex items-center justify-center transition-colors ${rarityStyle.border} ${rarityStyle.bg}`}>
                  <img src={item.image_url} alt="item" className="max-w-full max-h-full object-contain"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-100 leading-tight mb-1">{lang === 'es' ? item.name_es : item.name_en}</h3>
                   <span className={`text-xs uppercase tracking-wider font-bold bg-slate-950 px-1.5 py-0.5 rounded border ${rarityStyle.border} ${rarityStyle.text} border-opacity-50`}>{item.category}</span>
                </div>
              </div>

              <div className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-bold border ${rec.color} shadow-sm z-10`}>
                 <span>{rec.icon}</span><span>{rec.action}</span>
              </div>

              <div className="text-sm space-y-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                
                {showWarning && (
                   <div className="bg-orange-900/20 border border-orange-600/30 p-2.5 rounded mb-3">
                    <p className="text-orange-300 font-bold text-xs mb-1 flex items-center gap-1"><span>⚠️</span> {lang === 'es' ? 'Atención:' : 'Warning:'}</p>
                    <p className="text-slate-300 text-xs leading-relaxed mb-2">{lang === 'es' ? `Recicla solo si necesitas materiales. Al hacerlo pierdes valor.` : `Recycle only if you need materials. You lose value doing so.`}</p>
                    <div className="flex flex-col gap-1 text-xs font-mono bg-black/20 p-2 rounded">
                        <div className="flex justify-between"><span className="text-slate-400">{lang === 'es' ? 'Valor sin reciclar:' : 'Sell Value:'}</span><span className="text-emerald-400 font-bold">${item.sell_price.toLocaleString()}</span></div>
                        <div className="flex justify-between border-t border-white/10 pt-1"><span className="text-slate-400">{lang === 'es' ? 'Elementos reciclados:' : 'Recycled Value:'}</span><span className="text-orange-400 font-bold">${recycleValue.toLocaleString()} <span className="text-[10px] opacity-80">(-${diff.toLocaleString()} / -{lossPercent}%)</span></span></div>
                    </div>
                  </div>
                )}

                {(item.name_es === 'Aumento de equipamiento gratuito' || item.name_en === 'Free Gear Augment') && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 p-2.5 rounded mb-3">
                    <p className="text-yellow-400 font-bold text-xs mb-1 flex items-center gap-1"><span>💡</span> {lang === 'es' ? 'Consejo de Lance:' : 'Lance Tip:'}</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{lang === 'es' ? 'Ve donde LANCE (Comerciantes) y cámbialo por un: Combate Ver. 1, Saqueo Ver. 1 o Táctico Ver. 1. Puedes usarlos o venderlos por más dinero.' : 'Go to LANCE (Traders) and trade it for a: Combat Ver. 1, Scavenge Ver. 1, or Tactical Ver. 1. You can use them or sell them for more cash.'}</p>
                  </div>
                )}

                {item.used_for && item.used_for.length > 0 && (
                  <div>
                    <p className="text-slate-300 font-bold mb-1.5 border-b border-slate-800 pb-1 text-sm">{lang === 'es' ? '⚠️ Necesario para:' : '⚠️ Needed for:'}</p>
                    <ul className="flex flex-col gap-1">
                      {item.used_for.map((use, i) => (<li key={i} className="text-slate-400 leading-tight pl-2 border-l-2 border-slate-700">{use}</li>))}
                    </ul>
                  </div>
                )}

                {item.obtained_from && item.obtained_from.length > 0 && (
                  <div>
                    <p className="text-slate-300 font-bold mb-2 border-b border-slate-800 pb-1 text-sm">
                      {lang === 'es' ? '📍 Se obtiene de:' : '📍 Obtained from:'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {item.obtained_from.map((origin, i) => (
                        <VisualItemButton key={i} rawString={origin} />
                      ))}
                    </div>
                  </div>
                )}

                {item.crafting_requirements && (<div><p className="text-slate-300 font-bold mb-2 border-b border-slate-800 pb-1 flex justify-between items-center text-sm"><span>{item.category === 'Hideout' ? (lang === 'es' ? '🔨 Mejoras del Taller:' : '🔨 Workshop Upgrades:') : (lang === 'es' ? '⬆️ Necesita para mejorar:' : '⬆️ Upgrade Cost:')}</span></p><div className="flex flex-col gap-3">{(() => { if (item.category === 'Hideout') { const levels = Array.isArray(item.crafting_requirements) ? item.crafting_requirements : Object.values(item.crafting_requirements); levels.sort((a:any, b:any) => a.level - b.level); return levels.map((lvl: any) => { const rawDesc = lvl.description; const desc = (typeof rawDesc === 'object' && rawDesc !== null) ? (lang === 'es' ? (rawDesc.es || rawDesc.en) : (rawDesc.en || rawDesc.es)) : rawDesc; const otherReqs = lvl.otherRequirements || []; return (<div key={lvl.level} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 relative overflow-hidden"><div className="absolute right-0 top-0 text-[50px] font-black text-slate-800/20 leading-none -mt-3 -mr-2 select-none pointer-events-none">{lvl.level}</div><div className="relative z-10 flex flex-col gap-2"><div className="text-sm uppercase font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1">{lang === 'es' ? `Nivel ${lvl.level}` : `Level ${lvl.level}`}</div>{desc && (<div className="flex justify-between items-start text-sm mb-1"><span className="text-slate-500 font-bold">{lang === 'es' ? 'Aumento:' : 'Increase:'}</span><span className="text-emerald-400 font-mono text-right ml-2">{desc}</span></div>)}{otherReqs.length > 0 && (<div className="flex justify-between items-start text-sm mb-2"><span className="text-slate-500 font-bold">{lang === 'es' ? 'Costo:' : 'Cost:'}</span><div className="text-right">{otherReqs.map((req: string, i: number) => (<div key={i} className="text-yellow-500 font-mono font-bold">{req}</div>))}</div></div>)}{lvl.requirementItemIds && lvl.requirementItemIds.length > 0 && (<div className="grid grid-cols-2 gap-2 mt-1">{lvl.requirementItemIds.map((req: any, i: number) => (<VisualItemButton key={i} rawString={req.itemId} qty={req.quantity} />))}</div>)}</div></div>)});} else { const reqList = Object.entries(item.crafting_requirements).map(([k, v]: any) => ({...v, name: v.name || k, qty: v.qty || v, itemId: k})); return (<div className="grid grid-cols-2 gap-2">{reqList.map((req: any, i: number) => (<VisualItemButton key={i} rawString={req.itemId} qty={req.quantity || req.qty} />))}</div>);}})()}</div></div>)}
                
                {item.recipe_ingredients && (
                  <div>
                    <p className="text-slate-300 font-bold mb-2 border-b border-slate-800 pb-1 text-sm">
                      {lang === 'es' ? '🧪 Se fabrica con:' : '🧪 Crafted with:'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(item.recipe_ingredients).map(([k, v]: any) => (
                        <VisualItemButton key={k} rawString={k} qty={v.qty || v} />
                      ))}
                    </div>
                  </div>
                )}
                
                {item.crafting_recipes && (
                  <div>
                    <p className="text-slate-300 font-bold mb-2 border-b border-slate-800 pb-1 text-sm">
                      {lang === 'es' ? '♻️ Si lo recicla consigues:' : '♻️ If you recycle it, you get:'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(item.crafting_recipes).map(([k, v]: any) => (
                        <VisualItemButton key={k} rawString={k} qty={v.qty || v} />
                      ))}
                    </div>
                  </div>
                )}
                
                {isBlueprint && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <p className="text-slate-300 font-bold mb-2 text-sm flex items-center gap-2"><span>🗺️ {lang === 'es' ? '¿Dónde lo encontraste?' : 'Where did you find it?'}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {GAME_MAPS.map((map) => {
                        const count = communityVotes[item.id]?.[map.id] || 0;
                        const hasVoted = myVotes[`${item.id}-${map.id}`];
                        const allVotes = Object.values(communityVotes[item.id] || {});
                        const maxVotes = allVotes.length > 0 ? Math.max(...allVotes) : 0;
                        const isWinner = count > 0 && count === maxVotes;
                        return (
                          <button key={map.id} onClick={() => handleVote(item.id, map.id)} className={`relative px-2 py-1 rounded text-xs border transition-all flex items-center gap-1 ${isWinner ? 'border-yellow-500 bg-yellow-500/10 text-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : hasVoted ? 'bg-orange-900/50 border-orange-500 text-orange-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}>
                            {isWinner && <span className="absolute -top-2 -right-1 text-[10px]">👑</span>}
                            <span>{map.name}</span>
                            {count > 0 && <span className={`px-1 rounded text-[10px] ${isWinner ? 'bg-yellow-500/20 text-yellow-100' : 'bg-black/30'}`}>{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center text-sm z-10"><span className="text-slate-500 text-sm">{lang === 'es' ? 'Valor:' : 'Value:'}</span><span className="text-emerald-400 font-mono font-bold">${item.sell_price.toLocaleString()}</span></div>
            </div>
          );
        })}
      </div>
      )}

      {/* --- BOTÓN TAP TO TOP --- */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-orange-600 text-white shadow-lg border border-orange-400 transition-all transform hover:scale-110 hover:bg-orange-500 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="Scroll to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className={`px-4 py-2 rounded-lg font-bold border transition-all ${page === 1 ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}>← {lang === 'es' ? 'Anterior' : 'Prev'}</button>
        <span className="text-slate-500 font-mono text-sm">{lang === 'es' ? 'Página' : 'Page'} <span className="text-orange-500 font-bold">{page}</span> / {Math.ceil(totalItems / ITEMS_PER_PAGE)}</span>
        <button disabled={page >= Math.ceil(totalItems / ITEMS_PER_PAGE)} onClick={() => handlePageChange(page + 1)} className={`px-4 py-2 rounded-lg font-bold border transition-all ${page >= Math.ceil(totalItems / ITEMS_PER_PAGE) ? 'border-slate-800 text-slate-600 cursor-not-allowed' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}>{lang === 'es' ? 'Siguiente' : 'Next'} →</button>
      </div>

      <footer className="mt-auto border-t border-slate-800/50 pt-10 pb-12 bg-slate-950/50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-base font-medium">
            <a href="https://github.com/mariaglunadev/arc-raiders-tracker/issues" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors"><span>🐛</span> {lang === 'es' ? 'Reportar Error' : 'Report Bug'}</a>
            <a href="https://github.com/RaidTheory/arcraiders-data" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"><span>💾</span> Data Source (RaidTheory)</a>
            <a href="https://ko-fi.com/mariaglunadev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-pink-400 transition-colors group"><span className="group-hover:animate-bounce">☕</span> {lang === 'es' ? 'Invítame un Café' : 'Buy me a Coffee'}</a>
          </div>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed max-w-2xl mx-auto">
            <p>Arc Tracker is a fan-made community tool. Not affiliated with, endorsed by, or sponsored by Embark Studios.</p>
            <p>ARC Raiders™ and related logos are the exclusive property of Embark Studios AB.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}