'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

type Item = {
  id: number;
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
};

const CATEGORIES = [
  { id: 'Weapon', label_en: 'Weapons', label_es: 'Armas', icon: '🔫' },
  { id: 'Recyclable', label_en: 'Recyclables', label_es: 'Reciclables', icon: '♻️' },
  { id: 'Hideout', label_en: 'Workshop', label_es: 'Taller', icon: '🏠' },
  { id: 'Quick Use', label_en: 'Consumables', label_es: 'Consumibles', icon: '💊' },
  { id: 'Blueprint', label_en: 'Blueprints', label_es: 'Planos', icon: '📝' },
  { id: 'Material', label_en: 'Materials', label_es: 'Materiales', icon: '🔩' },
];

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => { fetchPopularItems(); }, []);

  const fetchPopularItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('sell_price', { ascending: false })
      .limit(12);
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleSearch = async (term: string) => {
    setSearch(term);
    setActiveFilter(null);
    if (term.length === 0) {
      fetchPopularItems();
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .or(`name_en.ilike.%${term}%,name_es.ilike.%${term}%`)
      .limit(50);
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleCategoryFilter = async (categoryId: string) => {
    setSearch(''); 
    setActiveFilter(categoryId); 
    setLoading(true);
    let query = supabase.from('items').select('*').limit(50);

    if (categoryId === 'Weapon') {
      query = query.in('category', ['Assault Rifle', 'Battle Rifle', 'Hand Cannon', 'Marksman Rifle', 'Pistol', 'Shotgun', 'Sniper Rifle', 'Submachine Gun', 'Launcher', 'Melee', 'Weapon']);
    } else if (categoryId === 'Material') {
      query = query.ilike('category', '%Material%');
    } else {
      query = query.eq('category', categoryId);
    }
    const { data, error } = await query;
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const getSmartRecommendation = (item: Item) => {
    if (item.used_for && item.used_for.length > 0) return { action: lang === 'es' ? 'GUARDAR' : 'KEEP', color: 'bg-purple-600 text-purple-100 border-purple-500', icon: '🛡️' };
    if (item.crafting_recipes && Object.keys(item.crafting_recipes).length > 0) return { action: lang === 'es' ? 'RECICLAR' : 'RECYCLE', color: 'bg-blue-600 text-blue-100 border-blue-500', icon: '♻️' };
    return { action: lang === 'es' ? 'VENDER' : 'SELL', color: 'bg-green-600 text-green-100 border-green-500', icon: '💰' };
  };

  const clickToSearch = (itemName: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSearch(itemName);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full">
        <div className="text-xs font-mono text-slate-500 font-bold">v1</div>
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="px-4 py-1.5 rounded-full border border-slate-700 hover:border-orange-500 bg-slate-900 transition-all text-xs font-bold text-slate-300 hover:text-white">
          {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto mb-12 text-center w-full">
        <h1 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600 italic tracking-tighter">ARC TRACKER</h1>
        
        {/* BUSCADOR */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <input
            type="text"
            placeholder={lang === 'es' ? "Busca items (ej: Ferro...)" : "Search items..."}
            className="relative w-full p-5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 text-lg shadow-2xl transition-all"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${activeFilter === cat.id ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
            >
              <span>{cat.icon}</span><span>{lang === 'es' ? cat.label_es : cat.label_en}</span>
            </button>
          ))}
          {(activeFilter || search) && (
            <button onClick={() => { setActiveFilter(null); setSearch(''); fetchPopularItems(); }} className="px-4 py-2 rounded-lg text-sm font-bold border border-red-900/50 text-red-400 hover:bg-red-900/20">✕</button>
          )}
        </div>
      </div>

      {/* GRID RESULTADOS */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 max-w-7xl mx-auto space-y-6 w-full mb-20">
        {items.filter((item) => item.name_en !== 'Workbench').map((item) => {
          const rec = getSmartRecommendation(item);

          return (
            <div key={item.id} className="break-inside-avoid bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3 shadow-lg hover:border-slate-600 transition-all group relative">
              
              <div className="flex gap-3 items-start z-10">
                <div className="w-16 h-16 bg-slate-950 rounded-lg flex-shrink-0 border border-slate-800 p-1 flex items-center justify-center">
                  <img src={item.image_url} alt="item" className="max-w-full max-h-full object-contain"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-slate-100 leading-tight mb-1">
                    {lang === 'es' ? item.name_es : item.name_en}
                  </h3>
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className={`flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold border ${rec.color} shadow-sm z-10`}>
                 <span>{rec.icon}</span><span>{rec.action}</span>
              </div>

              <div className="text-xs space-y-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                
                {/* 1. NECESARIO PARA */}
                {item.used_for && (
                  <div>
                    <p className="text-purple-400 font-bold mb-1.5 border-b border-purple-900/30 pb-1">
                      {lang === 'es' ? '⚠️ Necesario para:' : '⚠️ Needed for:'}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {item.used_for.map((use, i) => (
                        <li key={i} className="text-slate-400 leading-tight pl-2 border-l-2 border-purple-900/50">
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 2. SE OBTIENE DE (NUEVO - RECUPERADO) */}
                {item.obtained_from && (
                  <div>
                    <p className="text-emerald-400 font-bold mb-1.5 border-b border-emerald-900/30 pb-1">
                      {lang === 'es' ? '📍 Se obtiene de:' : '📍 Obtained from:'}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {item.obtained_from.map((origin, i) => (
                        <li key={i} className="text-slate-400 leading-tight pl-2 border-l-2 border-emerald-900/50">
                          {origin}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. REQUISITOS TALLER / MEJORAS */}
                {item.crafting_requirements && (
                  <div>
                    <p className="text-orange-400 font-bold mb-2 border-b border-orange-900/30 pb-1 flex justify-between items-center">
                      <span>{item.category === 'Hideout' ? (lang === 'es' ? '🔨 Mejoras del Taller:' : '🔨 Workshop Upgrades:') : (lang === 'es' ? '⬆️ Necesita para mejorar:' : '⬆️ Upgrade Cost:')}</span>
                    </p>
                    <div className="flex flex-col gap-3">
                       {(() => {
                        if (item.category === 'Hideout') {
                          const levels = Array.isArray(item.crafting_requirements) ? item.crafting_requirements : Object.values(item.crafting_requirements);
                          levels.sort((a:any, b:any) => a.level - b.level);
                          return levels.map((lvl: any) => {
                            const rawDesc = lvl.description;
                            const desc = (typeof rawDesc === 'object' && rawDesc !== null) ? (lang === 'es' ? (rawDesc.es || rawDesc.en) : (rawDesc.en || rawDesc.es)) : rawDesc;
                            const otherReqs = lvl.otherRequirements || [];
                            return (
                            <div key={lvl.level} className="bg-slate-950/80 p-3 rounded-lg border border-orange-900/20 relative overflow-hidden group/lvl hover:border-orange-500/30 transition-all">
                              <div className="absolute right-0 top-0 text-[50px] font-black text-orange-500/5 leading-none -mt-3 -mr-2 select-none pointer-events-none">{lvl.level}</div>
                              <div className="relative z-10 flex flex-col gap-2">
                                <div className="text-xs uppercase font-bold text-orange-300 border-b border-orange-900/30 pb-1 mb-1">{lang === 'es' ? `Nivel ${lvl.level}` : `Level ${lvl.level}`}</div>
                                {desc && (<div className="flex justify-between items-start text-xs"><span className="text-slate-500 font-bold">{lang === 'es' ? 'Aumento:' : 'Increase:'}</span><span className="text-emerald-400 font-mono text-right ml-2">{desc}</span></div>)}
                                {otherReqs.length > 0 && (<div className="flex justify-between items-start text-xs"><span className="text-slate-500 font-bold">{lang === 'es' ? 'Costo:' : 'Cost:'}</span><div className="text-right">{otherReqs.map((req: string, i: number) => (<div key={i} className="text-yellow-500 font-mono font-bold">{req}</div>))}</div></div>)}
                                {lvl.requirementItemIds && lvl.requirementItemIds.length > 0 && (
                                  <div className="mt-1 pt-1 border-t border-dashed border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{lang === 'es' ? 'Materiales:' : 'Materials:'}</p>
                                    <div className="flex flex-col gap-1">
                                      {lvl.requirementItemIds.map((req: any, i: number) => {
                                         const name = lang === 'es' ? (req.name_es || req.itemId) : (req.name_en || req.itemId);
                                         const searchTerm = lang === 'es' ? name : (req.name_en || req.itemId);
                                         return (
                                           <button key={i} onClick={() => clickToSearch(searchTerm)} className="text-left w-full bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-800 hover:border-orange-500/50 transition-colors flex justify-between group/btn text-xs">
                                              <span className="group-hover/btn:text-orange-300 group-hover/btn:underline decoration-orange-500/50 underline-offset-2 truncate mr-2">{name.replace(/_/g, ' ')}</span><span className="font-mono font-bold text-orange-500 shrink-0">x{req.quantity}</span>
                                           </button>
                                         );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )});
                        } else {
                          const reqList = Object.entries(item.crafting_requirements).map(([k, v]: any) => ({...v, name: v.name || k, qty: v.qty || v, itemId: k}));
                          return reqList.map((req: any, i: number) => {
                            const name = lang === 'es' ? (req.name_es || req.itemId) : (req.name_en || req.itemId);
                            const searchTerm = lang === 'es' ? name : (req.name_en || req.itemId);
                            return (
                              <button key={i} onClick={() => clickToSearch(searchTerm)} className="text-left w-full bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1.5 rounded border border-slate-800 hover:border-orange-500/50 transition-colors flex justify-between group/btn">
                                <span className="group-hover/btn:text-orange-300 group-hover/btn:underline decoration-orange-500/50 underline-offset-2 transition-all">{name.replace(/_/g, ' ')}</span><span className="font-mono font-bold text-orange-500">x{req.quantity || req.qty}</span>
                              </button>
                            )
                          });
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* 4. SE FABRICA CON */}
                {item.recipe_ingredients && (
                  <div>
                    <p className="text-pink-400 font-bold mb-1.5 border-b border-pink-900/30 pb-1">{lang === 'es' ? '🧪 Se fabrica con:' : '🧪 Crafted with:'}</p>
                    <div className="flex flex-col gap-1">
                       {Object.entries(item.recipe_ingredients).map(([k, v]: any) => {
                         const name = lang === 'es' ? (v.name_es || k) : (v.name_en || k);
                         const searchTerm = lang === 'es' ? name : (v.name_en || k);
                         return (
                           <button key={k} onClick={() => clickToSearch(searchTerm)} className="text-left w-full bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1.5 rounded border border-slate-800 hover:border-pink-500/50 transition-colors flex justify-between group/btn">
                              <span className="group-hover/btn:text-pink-300 group-hover/btn:underline decoration-pink-500/50 underline-offset-2 transition-all">{name.replace(/_/g, ' ')}</span><span className="font-mono font-bold text-pink-500">x{v.qty || v}</span>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                )}

                {/* 5. RECICLAJE */}
                {item.crafting_recipes && (
                  <div>
                    <p className="text-blue-400 font-bold mb-1.5 border-b border-blue-900/30 pb-1">{lang === 'es' ? '♻️ Si lo recicla consigues:' : '♻️ If you recycle it, you get:'}</p>
                    <div className="flex flex-col gap-1">
                       {Object.entries(item.crafting_recipes).map(([k, v]: any) => {
                         const name = lang === 'es' ? (v.name_es || k) : (v.name_en || k);
                         const searchTerm = lang === 'es' ? name : (v.name_en || k);
                         return (
                           <button key={k} onClick={() => clickToSearch(searchTerm)} className="text-left w-full bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1.5 rounded border border-slate-800 hover:border-blue-500/50 transition-colors flex justify-between group/btn">
                              <span className="group-hover/btn:text-blue-300 group-hover/btn:underline decoration-blue-500/50 underline-offset-2 transition-all">{name.replace(/_/g, ' ')}</span><span className="font-mono font-bold text-blue-500">x{v.qty || v}</span>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center text-sm z-10">
                <span className="text-slate-500 text-xs">{lang === 'es' ? 'Valor:' : 'Value:'}</span>
                <span className="text-emerald-400 font-mono font-bold">${item.sell_price.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- FOOTER (NUEVO) --- */}
      <footer className="mt-auto border-t border-slate-800/50 pt-10 pb-12 bg-slate-950/50">
        <div className="max-w-4xl mx-auto text-center px-4">
          
          {/* ENLACES PRINCIPALES */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8 text-sm font-medium">
            <a href="https://github.com/mariaglunadev/arc-raiders-tracker/issues" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors">
              <span>🐛</span> {lang === 'es' ? 'Reportar Error' : 'Report Bug'}
            </a>
            <a href="https://github.com/RaidTheory/arcraiders-data" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
              <span>💾</span> Data Source (RaidTheory)
            </a>
            <a href="https://ko-fi.com/mariaglunadev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-pink-400 transition-colors group">
              <span className="group-hover:animate-bounce">☕</span> {lang === 'es' ? 'Invítame un Café' : 'Buy me a Coffee'}
            </a>
          </div>

          {/* DISCLAIMER LEGAL */}
          <div className="text-[10px] text-slate-600 space-y-2 leading-relaxed max-w-2xl mx-auto">
            <p>
              Arc Tracker is a fan-made community tool. Not affiliated with, endorsed by, or sponsored by Embark Studios. 
            </p>
            <p>
              ARC Raiders™ and related logos, characters, names, and distinctive likenesses thereof are the exclusive property of Embark Studios AB. All rights reserved.
            </p>
          </div>
          
        </div>
      </footer>

    </main>
  );
}