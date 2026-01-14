# 🚀 Arc Tracker

<div align="center">

**The Essential Database for ARC Raiders™ / La Base de Datos Esencial para Raiders**

[Report Bug](https://github.com/mariagonzalezluna/arc-raiders-tracker/issues) · [Request Feature](https://github.com/mariagonzalezluna/arc-raiders-tracker/issues)

</div>

---

## 🇺🇸 English

**Arc Tracker** is a community-driven web application designed to help players of *ARC Raiders* track items, understand crafting recipes, and plan their hideout upgrades. It features real-time search, reverse crafting lookups, and automatic data synchronization.

### ✨ Key Features

* **⚡ Smart Search:** Instantly filter by Weapons, Recyclables, Hideout Modules, Consumables, and Blueprints.
* **🔗 Deep Linking:** Click on any material (e.g., *Metal Parts*) to see exactly where to find it or what it crafts.
* **🏠 Hideout Planner:** Detailed multi-level upgrade requirements for every station (Medical Lab, Weapon Bench, Stash, etc.), including slot rewards and costs.
* **🔄 Auto-Sync:** Powered by a Cron Job that automatically fetches and translates data from the community repository (RaidTheory), ensuring stats are always up-to-date.
* **🌍 Bilingual:** Full support for English and Spanish (ES/EN).

### 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Masonry Layout
* **Database:** Supabase (PostgreSQL)
* **Deployment:** Vercel (with Cron Jobs for automation)

### 🚀 Getting Started

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/mariagonzalezluna/arc-raiders-tracker.git](https://github.com/mariagonzalezluna/arc-raiders-tracker.git)
    cd arc-raiders-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    CRON_SECRET=your_custom_secret
    ```

4.  **Run locally:**
    ```bash
    npm run dev
    ```

---

## 🇪🇸 Español

**Arc Tracker** es una herramienta comunitaria diseñada para ayudar a los jugadores de *ARC Raiders* a gestionar objetos, entender las recetas de crafteo y planificar las mejoras de su guarida. Cuenta con búsqueda en tiempo real, relaciones de materiales y sincronización automática de datos.

### ✨ Características Principales

* **⚡ Búsqueda Inteligente:** Filtra instantáneamente por Armas, Reciclables, Módulos de Guarida, Consumibles y Planos.
* **🔗 Navegación Relacional:** Haz clic en cualquier material (ej: *Piezas de Metal*) para ver de dónde sale o para qué sirve.
* **🏠 Planificador de Guarida:** Requisitos detallados nivel por nivel para cada estación (Laboratorio Médico, Banco de Armas, Alijo, etc.), incluyendo recompensas de slots y costos.
* **🔄 Sincronización Automática:** Sistema Cron que descarga, traduce y actualiza automáticamente los datos desde el repositorio de la comunidad, manteniendo los precios siempre al día.
* **🌍 Bilingüe:** Soporte completo para Español e Inglés (ES/EN).

### 🛠️ Tecnologías

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS + Diseño Masonry
* **Base de Datos:** Supabase (PostgreSQL)
* **Despliegue:** Vercel (con Cron Jobs para automatización)

### ⚖️ Disclaimer

*Arc Tracker is a fan-made community tool. Not affiliated with, endorsed by, or sponsored by Embark Studios. ARC Raiders™ and related logos are the exclusive property of Embark Studios AB.*