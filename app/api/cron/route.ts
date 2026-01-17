import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const REPO_OWNER = 'RaidTheory';
const REPO_NAME = 'arcraiders-data';
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/images/`;

// --- DICCIONARIO DE TRADUCCIONES (CORREGIDO) ---
const MANUAL_TRANSLATIONS: Record<string, string> = {
  "metal_parts": "Piezas de Metal",
  "durable_cloth": "Tela Resistente",
  "cracked_bioscanner": "Bioscáner Agrietado",
  "tick_pod": "Cápsula de Garrapata",
  "plastic_parts": "Piezas de Plástico",
  "rubber_parts": "Piezas de Goma",
  "industrial_battery": "Batería Industrial",
  "electrical_components": "Componentes Eléctricos",
  "power_cable": "Cable de Alimentación",
  "advanced_electrical_components": "Componentes Eléctricos Avanzados",
  "hornet_driver": "Controlador de Hornet",
  "simple_gun_parts": "Piezas de Arma Básica",
  "mechanical_components": "Componentes Mecánicos",
  "fabric": "Tela",
  "epoxy": "Epoxi",
  "polymer": "Polímero",
  "standard_gun_parts": "Piezas de Arma Estándar",
  "advanced_gun_parts": "Piezas de Arma Avanzada",
  "scrappy": "Chatarrero (Scrappy)",
  "stash": "Alijo",
  "weapon_bench": "Banco de Armas",
  "equipment_bench": "Banco de Equipo",
  "medical_station": "Estación Médica",
  "sterile_bandage": "Venda Esterilizada",
  "antiseptic": "Antiséptico",
  "chemicals": "Químicos",
  "great_mullein": "Gordolobo (Planta)",
  "seed_pouch": "Bolsa de Semillas",
  "synthesized_fuel": "Combustible Sintetizado",
  "crude_explosives": "Explosivos Rudimentarios",
  "pop_trigger": "Detonador Pop",
  "laboratory_reagents": "Reactivos de Laboratorio",
  "explosive_compound": "Compuesto Explosivo",
  "rocketeer_driver": "Controlador Cohetero",
  "arc_alloy": "Aleación ARC",
  "explosives_station": "Estación de Explosivos",
  "utility_bench": "Estación de Utilidad",
  "refiner": "Refinería",
  "gear_bench": "Banco de Equipo",
  // CORRECCIÓN: Celda -> Célula
  "power_cell": "Célula de Energía", 
  "shock_cell": "Célula de Choque",
  "fuel_cell": "Célula de Combustible"
};

const MANUAL_IMAGES: Record<string, string> = {
  "med_station":      "/hideout/Medical Lab.jpg",
  "weapon_bench":     "/hideout/Gunsmith.jpg",
  "equipment_bench":  "/hideout/Gear Bench.jpg",
  "gear_bench":       "/hideout/Gear Bench.jpg",
  "explosives_bench": "/hideout/Explosives Station.jpg",
  "scrappy":          "/hideout/Scrappy.jpg",
  "refiner":          "/hideout/Refiner.jpg",
  "utility_bench":    "/hideout/Utility Station.jpg",
};

let usageMap: Record<string, string[]> = {};       
let obtainedFromMap: Record<string, string[]> = {}; 
let idToNamesMap: Record<string, { en: string, es: string }> = {};
let idToImageMap: Record<string, string> = {};

const registerUsage = (materialId: string, usedInName: string) => {
  if (!usageMap[materialId]) usageMap[materialId] = [];
  if (!usageMap[materialId].includes(usedInName)) usageMap[materialId].push(usedInName);
};

const registerOrigin = (materialId: string, originName: string) => {
  if (!obtainedFromMap[materialId]) obtainedFromMap[materialId] = [];
  if (!obtainedFromMap[materialId].includes(originName)) obtainedFromMap[materialId].push(originName);
};

const extractNames = (data: any) => {
  const nameEn = data.name?.en || data.name?.['en-US'] || (typeof data.name === 'string' ? data.name : data.id);
  // Aplicar corrección manual si existe, sino usar lo que venga
  const nameEs = MANUAL_TRANSLATIONS[data.id] || data.name?.es || nameEn;
  
  // CORRECCIÓN FINAL: Si por alguna razón viene "Celda" en el JSON original y no está en el manual, forzamos el reemplazo
  const finalNameEs = nameEs.replace(/Celda/g, "Célula").replace(/celda/g, "célula");
  
  return { en: nameEn, es: finalNameEs };
}

// Función auxiliar para quitar tildes
const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}` && !isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [itemsListRes, hideoutListRes] = await Promise.all([
      fetch(`${GITHUB_API_BASE}items`),
      fetch(`${GITHUB_API_BASE}hideout`)
    ]);
    const itemsFiles = await itemsListRes.json();
    const hideoutFiles = await hideoutListRes.json();

    const allFiles = [
      ...itemsFiles.filter((f: any) => f.name.endsWith('.json')).map((f: any) => ({ ...f, type: 'item' })),
      ...hideoutFiles.filter((f: any) => f.name.endsWith('.json')).map((f: any) => ({ ...f, type: 'hideout' }))
    ];

    const rawData = await Promise.all(allFiles.map(async (file: any) => {
      const res = await fetch(file.download_url);
      return { data: await res.json(), type: file.type };
    }));

    usageMap = {}; 
    obtainedFromMap = {}; 
    idToNamesMap = {};

    rawData.forEach(({ data }) => {
      const names = extractNames(data);
      idToNamesMap[data.id] = names;
      const currentName = names.es;

      let imageUrl = "https://placehold.co/200x200/1e293b/ffffff?text=No+Image";
      if (MANUAL_IMAGES[data.id]) {
        imageUrl = MANUAL_IMAGES[data.id]; 
      } else {
        const imgSource = data.imageFileName || data.imageFilename || data.imageUrl || data.icon || data.image;
        if (imgSource && typeof imgSource === 'string') {
          imageUrl = imgSource.startsWith('http') ? imgSource : `${GITHUB_RAW_BASE}${imgSource}`;
        }
      }
      idToImageMap[data.id] = imageUrl;

      if (data.upgradeCost) Object.keys(data.upgradeCost).forEach(matId => registerUsage(matId, `Mejora de ${currentName}`));
      if (data.levels) {
        const levelsArray = Array.isArray(data.levels) ? data.levels : Object.values(data.levels);
        levelsArray.forEach((level: any) => {
          if (level.requirementItemIds) {
            level.requirementItemIds.forEach((req: any) => registerUsage(req.itemId, `Taller: ${currentName} (Nvl ${level.level})`));
          }
        });
      }
      if (data.recipe) Object.keys(data.recipe).forEach(ingId => registerUsage(ingId, `Fabricación de ${currentName}`));
      if (data.recyclesInto) Object.keys(data.recyclesInto).forEach(yieldId => registerOrigin(yieldId, `Reciclaje de ${currentName}`));
    });

    const rowsToUpsert = rawData.map(({ data, type }) => {
      const names = extractNames(data);
      let descEn = data.description?.en || (typeof data.description === 'string' ? data.description : "");
      let descEs = data.description?.es || descEn;

      // Reemplazo en descripciones también por si acaso
      descEs = descEs.replace(/Celda/g, "Célula").replace(/celda/g, "célula");

      let imageUrl = "https://placehold.co/200x200/1e293b/ffffff?text=No+Image";
      if (MANUAL_IMAGES[data.id]) imageUrl = MANUAL_IMAGES[data.id]; 
      else {
        const imgSource = data.imageFileName || data.imageFilename || data.imageUrl || data.icon || data.image;
        if (imgSource && typeof imgSource === 'string') {
          imageUrl = imgSource.startsWith('http') ? imgSource : `${GITHUB_RAW_BASE}${imgSource}`;
        }
      }

      const getMatNames = (id: string) => {
        if (idToNamesMap[id]) return idToNamesMap[id];
        return { en: id.replace(/_/g, ' '), es: MANUAL_TRANSLATIONS[id] || id.replace(/_/g, ' ') };
      };

      let recyclesInto: any = null;
      if (data.recyclesInto) {
        recyclesInto = {};
        Object.entries(data.recyclesInto).forEach(([matId, qty]) => {
          const matNames = getMatNames(matId);
          recyclesInto[matId] = { qty, name_en: matNames.en, name_es: matNames.es, image_url: idToImageMap[matId] };
        });
      }

      let recipeIngredients: any = null;
      if (data.recipe) {
        recipeIngredients = {};
        Object.entries(data.recipe).forEach(([matId, qty]) => {
          const matNames = getMatNames(matId);
          recipeIngredients[matId] = { qty, name_en: matNames.en, name_es: matNames.es, image_url: idToImageMap[matId] };
        });
      }

      let requirements: any = null;
      if (type === 'hideout' && data.levels) {
        requirements = JSON.parse(JSON.stringify(data.levels));
        const levelsIterable = Array.isArray(requirements) ? requirements : Object.values(requirements);
        levelsIterable.forEach((level: any) => {
          if (level.requirementItemIds) {
            level.requirementItemIds = level.requirementItemIds.map((req: any) => {
              const matNames = getMatNames(req.itemId);
              return { ...req, name_en: matNames.en, name_es: matNames.es, image_url: idToImageMap[req.itemId] };
            });
          }
        });
      } else if (data.upgradeCost) {
        requirements = {};
        Object.entries(data.upgradeCost).forEach(([matId, qty]) => {
          const matNames = getMatNames(matId);
          requirements[matId] = { qty, name_en: matNames.en, name_es: matNames.es, image_url: idToImageMap[matId] };
        });
      }

      // CAMPO CLAVE: Creamos un string de búsqueda normalizado
      const searchText = normalizeText(`${names.en} ${names.es} ${data.type || ''}`);

      return {
        game_id: data.id,
        name_en: names.en,
        name_es: names.es,
        description_en: descEn,
        description_es: descEs,
        category: type === 'hideout' ? 'Hideout' : (data.type || 'Item'),
        rarity: data.rarity || 'Common',
        sell_price: data.value || 0,
        weight: data.weightKg || 0,
        stack_size: data.stackSize || 1,
        image_url: imageUrl,
        crafting_recipes: recyclesInto,       
        recipe_ingredients: recipeIngredients, 
        crafting_requirements: requirements,   
        used_for: usageMap[data.id] || null,
        obtained_from: obtainedFromMap[data.id] || null,
        search_text: searchText, // Guardamos el texto limpio para buscar sin tildes
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase.from('items').upsert(rowsToUpsert, { onConflict: 'game_id' });
    if (error) throw error;

    return NextResponse.json({ success: true, count: rowsToUpsert.length, message: 'Datos actualizados. Células y Búsqueda listos.' });

  } catch (error: any) {
    console.error('💀 Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}