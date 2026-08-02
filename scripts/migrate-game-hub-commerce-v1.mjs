import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TODAY = "2026-08-03";

const updates = {
  "marvel-tokon-fighting-souls": {
    pcRequirements: {
      sourceUrl: "https://store.steampowered.com/app/3787240/MARVEL_Tkon_Fighting_Souls/",
      minimum: [
        { label: "Sistema operativo", value: "Windows 11 de 64 bits" },
        { label: "Procesador", value: "Intel Core i5-8400 o AMD Ryzen 5 1600X" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "NVIDIA GeForce RTX 2060 (6 GB) o AMD Radeon RX 6600 XT (8 GB)" },
        { label: "Almacenamiento", value: "27 GB disponibles" }
      ],
      recommended: [
        { label: "Sistema operativo", value: "Windows 11 de 64 bits" },
        { label: "Procesador", value: "Intel Core i7-8700 o AMD Ryzen 5 3600X" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "NVIDIA GeForce RTX 3070 (8 GB) o AMD Radeon RX 7600 XT (16 GB)" },
        { label: "Almacenamiento", value: "27 GB disponibles" }
      ],
      notes: [
        "Steam exige un procesador y un sistema operativo de 64 bits.",
        "La versión para PC utiliza Easy Anti-Cheat a nivel de kernel."
      ]
    },
    editions: {
      sourceUrl: "https://www.playstation.com/es-es/games/marvel-tokon-fighting-souls/",
      region: "España",
      items: [
        {
          name: "Standard Edition",
          prices: [{ platform: "PS5", value: "69,99 €" }],
          includes: ["MARVEL Tōkon: Fighting Souls"]
        },
        {
          name: "Digital Deluxe Edition",
          prices: [{ platform: "PS5", value: "94,99 €" }],
          includes: [
            "Juego base",
            "Pase de personajes y escenarios del año 1: cuatro personajes, un escenario y poses para la pantalla de resultados",
            "Howard el Pato como avatar de sala",
            "Cosmo como mascota de sala"
          ]
        },
        {
          name: "Ultimate Edition",
          prices: [{ platform: "PS5", value: "109,99 €" }],
          includes: [
            "Todo el contenido de la Digital Deluxe Edition",
            "Cinco trajes: Spider-Man, Storm, Iron Man, Capitán América y Doctor Doom",
            "Color cromático animado para los veinte personajes de lanzamiento"
          ]
        }
      ],
      preorderBonuses: [
        "Guantelete del Infinito como equipamiento de sala",
        "Baby Groot como mascota de sala",
        "Tabla de surf cósmica como vehículo de sala"
      ],
      notes: ["Las ediciones especiales también están anunciadas para PC; los precios mostrados corresponden a PlayStation Store España."]
    },
    removePending: [
      "Faltan por comprobarse los requisitos finales de la versión para PC.",
      "No se conoce el tamaño de instalación definitivo."
    ],
    change: {
      title: "Requisitos de PC y ediciones oficiales añadidos",
      description: "La ficha incorpora las configuraciones mínimas y recomendadas de Steam y compara las ediciones Standard, Digital Deluxe y Ultimate con sus precios y contenidos.",
      sourceUrls: [
        "https://store.steampowered.com/app/3787240/MARVEL_Tkon_Fighting_Souls/",
        "https://www.playstation.com/es-es/games/marvel-tokon-fighting-souls/"
      ]
    },
    price: "Desde 69,99 € en PS5"
  },
  "gears-of-war-e-day": {
    pcRequirements: {
      sourceUrl: "https://store.steampowered.com/app/3010850/Gears_of_War_EDay/",
      minimum: [
        { label: "Sistema operativo", value: "Windows 10 de 64 bits, versión 22H 19045.7291" },
        { label: "Procesador", value: "AMD Ryzen 5 2600X, Intel Core i7-6850K o Intel Core i5-10400" },
        { label: "Memoria", value: "12 GB de RAM" },
        { label: "Tarjeta gráfica", value: "RTX 5050, RTX 2060, RX 6600, RX 9060 o Intel Arc A580" },
        { label: "DirectX", value: "Versión 12" },
        { label: "Red", value: "Conexión a Internet de banda ancha" },
        { label: "Almacenamiento", value: "130 GB disponibles en SSD" },
        { label: "Tarjeta de sonido", value: "Dispositivo de audio compatible con Windows" }
      ],
      recommended: [
        { label: "Sistema operativo", value: "Windows 11 de 64 bits, versión 25H2 o posterior" },
        { label: "Procesador", value: "AMD Ryzen 5 5600 o Intel Core i5-11600K" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "RTX 5060, RTX 3060 Ti, RX 6700 XT, RX 9060 XT o Intel Arc B580" },
        { label: "DirectX", value: "Versión 12" },
        { label: "Red", value: "Conexión a Internet de banda ancha" },
        { label: "Almacenamiento", value: "130 GB disponibles en SSD" },
        { label: "Tarjeta de sonido", value: "Dispositivo de audio compatible con Windows" }
      ],
      notes: [
        "Steam exige un procesador y un sistema operativo de 64 bits.",
        "El uso de SSD es obligatorio en ambas configuraciones."
      ]
    },
    editions: {
      sourceUrl: "https://www.xbox.com/es-ES/games/store/gears-of-war-e-day/9N4PT8HGCDHQ/0010",
      region: "España",
      items: [
        {
          name: "Edición estándar",
          prices: [{ platform: "Xbox y PC", value: "69,99 €" }],
          includes: ["Gears of War: E-Day"]
        },
        {
          name: "Premium Edition",
          prices: [{ platform: "Xbox y PC", value: "99,99 €" }],
          includes: [
            "Juego base",
            "Hasta cinco días de acceso anticipado",
            "Pack de armas características de Bravo Squad",
            "Cinco packs de personalización de temporada",
            "1000 de Hierro"
          ]
        },
        {
          name: "Actualización Premium",
          kind: "Mejora",
          prices: [{ platform: "Xbox y PC", value: "30,00 €" }],
          includes: ["Contenido de la Premium Edition para quienes ya tengan el juego base o una suscripción compatible de Game Pass"]
        }
      ],
      preorderBonuses: [
        "Aspecto de personaje Exfil Dom",
        "Conjunto de aspectos de armas Exfil",
        "Acceso anticipado a la beta multijugador"
      ],
      notes: ["La Premium Edition está disponible por separado o como mejora del juego base."]
    },
    removePending: [
      "No se han publicado los requisitos definitivos de la versión para PC.",
      "No se ha publicado el tamaño de instalación definitivo."
    ],
    change: {
      title: "Requisitos de PC y ediciones oficiales añadidos",
      description: "Steam publica las configuraciones mínimas y recomendadas, mientras Xbox detalla la edición estándar, la Premium y su mejora independiente.",
      sourceUrls: [
        "https://store.steampowered.com/app/3010850/Gears_of_War_EDay/",
        "https://www.xbox.com/es-ES/games/store/gears-of-war-e-day/9N4PT8HGCDHQ/0010"
      ]
    }
  },
  "onimusha-way-of-the-sword": {
    pcRequirements: {
      sourceUrl: "https://store.steampowered.com/app/2638890/Onimusha_Way_of_the_Sword/",
      minimum: [
        { label: "Sistema operativo", value: "Windows 11 de 64 bits" },
        { label: "Procesador", value: "Intel Core i5-8400 o AMD Ryzen 3 3100" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "GeForce GTX 1660 (6 GB) o Radeon RX 5500 XT (8 GB)" },
        { label: "DirectX", value: "Versión 12" },
        { label: "Almacenamiento", value: "50 GB disponibles en SSD" },
        { label: "Rendimiento objetivo", value: "1080p, calidad baja y 30 FPS con reescalado" }
      ],
      recommended: [
        { label: "Sistema operativo", value: "Windows 11 de 64 bits" },
        { label: "Procesador", value: "Intel Core i5-10400 o AMD Ryzen 5 3600" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "GeForce RTX 2060 Super (8 GB) o Radeon RX 6600 (8 GB)" },
        { label: "DirectX", value: "Versión 12" },
        { label: "Almacenamiento", value: "50 GB disponibles en SSD" },
        { label: "Rendimiento objetivo", value: "1080p, calidad media y 60 FPS con reescalado" }
      ],
      notes: [
        "Steam exige un procesador y un sistema operativo de 64 bits.",
        "El SSD es obligatorio y las estimaciones utilizan NVIDIA DLSS o AMD FSR."
      ]
    },
    editions: {
      sourceUrl: "https://www.xbox.com/es-ES/games/store/onimusha-way-of-the-sword/9PJMHTRC9WKB/0010",
      region: "España",
      items: [
        {
          name: "Edición estándar",
          prices: [
            { platform: "PS5 / Xbox", value: "79,99 €" },
            { platform: "PC", value: "69,99 €" }
          ],
          includes: ["Juego base"]
        },
        {
          name: "Deluxe Edition",
          prices: [
            { platform: "PS5 / Xbox", value: "89,99 €" },
            { platform: "PC", value: "79,99 €" }
          ],
          includes: [
            "Juego base",
            "Tres amuletos",
            "Cuatro aspectos de espada",
            "Armadura roja para Musashi",
            "Guantelete Oni Loto carmesí"
          ]
        },
        {
          name: "Premium Deluxe Edition",
          prices: [
            { platform: "PS5 / Xbox", value: "99,99 €" },
            { platform: "PC", value: "89,99 €" }
          ],
          includes: [
            "Todo el contenido de la Deluxe Edition",
            "Tres haori para Musashi",
            "Tres atuendos para Okuni",
            "Tres atuendos para la Dama Oni",
            "Mini banda sonora digital dentro del juego"
          ]
        }
      ],
      preorderBonuses: ["Amuleto Komainu", "Aspecto de espada Maldición sellada"],
      notes: ["Las ediciones Deluxe y Premium Deluxe amplían la bonificación de reserva con el amuleto Mono blanco y el aspecto León blanco."]
    },
    removeConfirmed: ["En PC pide 16 GB de RAM y 50 GB en SSD. Capcom recomienda una RTX 2060 Super o una RX 6600."],
    change: {
      title: "Requisitos de PC y ediciones trasladados a secciones propias",
      description: "La ficha compara las tres ediciones y separa los requisitos mínimos y recomendados del bloque general de información confirmada.",
      sourceUrls: [
        "https://store.steampowered.com/app/2638890/Onimusha_Way_of_the_Sword/",
        "https://www.xbox.com/es-ES/games/store/onimusha-way-of-the-sword/9PJMHTRC9WKB/0010"
      ]
    }
  },
  "control-resonant": {
    pcRequirements: {
      sourceUrl: "https://store.steampowered.com/app/3669870/CONTROL_Resonant/",
      minimum: [
        { label: "Sistema operativo", value: "Windows 10 u 11 de 64 bits" },
        { label: "Procesador", value: "Intel Core i5-8500 o equivalente de AMD" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "GeForce GTX 1070 o Radeon RX 5600 XT (6 GB)" },
        { label: "Almacenamiento", value: "100 GB disponibles" }
      ],
      recommended: [
        { label: "Sistema operativo", value: "Windows 10 u 11 de 64 bits" },
        { label: "Procesador", value: "AMD Ryzen 7 3700X o equivalente de Intel" },
        { label: "Memoria", value: "16 GB de RAM" },
        { label: "Tarjeta gráfica", value: "GeForce RTX 3070 o Radeon RX 6700 XT (8 GB)" },
        { label: "Almacenamiento", value: "100 GB disponibles" }
      ],
      notes: [
        "Steam exige un procesador y un sistema operativo de 64 bits.",
        "La tarjeta de sonido todavía figura como pendiente en la ficha oficial."
      ]
    },
    editions: {
      sourceUrl: "https://store.playstation.com/es-es/concept/10017682",
      region: "España",
      items: [
        {
          name: "Edición estándar",
          prices: [{ platform: "PS5", value: "59,99 €" }],
          includes: ["CONTROL Resonant"]
        },
        {
          name: "Edición Digital Deluxe",
          prices: [{ platform: "PS5", value: "69,99 €" }],
          includes: [
            "Juego base",
            "Acceso anticipado de 48 horas",
            "Atuendo de misión de SMA",
            "Artefacto sin activar: cartera",
            "Paquete de recursos inicial",
            "Libro de arte digital",
            "Banda sonora original"
          ]
        }
      ],
      preorderBonuses: ["Atuendo Corrupción del Siseo", "Atuendo Ocultista", "Artefacto Herramienta de carterista"],
      notes: ["Los precios mostrados corresponden a PlayStation Store España."]
    },
    removeConfirmed: ["En PC pide 16 GB de RAM y 100 GB. Remedy recomienda una RTX 3070 o una RX 6800 XT."],
    change: {
      title: "Requisitos de PC y ediciones trasladados a secciones propias",
      description: "La ficha añade las configuraciones de Steam y compara la edición estándar con la Digital Deluxe y sus bonificaciones.",
      sourceUrls: [
        "https://store.steampowered.com/app/3669870/CONTROL_Resonant/",
        "https://store.playstation.com/es-es/concept/10017682"
      ]
    }
  },
  "beast-of-reincarnation": {
    editions: {
      sourceUrl: "https://store.playstation.com/es-es/concept/10014719",
      region: "España",
      items: [
        {
          name: "Edición estándar",
          prices: [{ platform: "PS5", value: "54,99 €" }],
          includes: ["Beast of Reincarnation"]
        },
        {
          name: "Digital Deluxe Edition",
          prices: [{ platform: "PS5", value: "64,99 €" }],
          includes: [
            "Juego base",
            "Pieles de Shiba negra y marrón para Koo",
            "Sombrero Oni y espada Osa Mayor para Emma",
            "100.000 de ámbar",
            "Varias plántulas"
          ]
        }
      ],
      preorderBonuses: ["Piel de Shiba marrón para Koo", "30.000 de ámbar"],
      notes: ["Los precios mostrados corresponden a PlayStation Store España."]
    },
    removeConfirmed: [
      "En España, la edición estándar cuesta 54,99 € en PS5 y la Digital Deluxe 64,99 €. La reserva incluye una piel de Shiba marrón para Koo y 30.000 de ámbar.",
      "La Digital Deluxe añade las pieles de Shiba negra y marrón, el sombrero Oni y la espada Osa Mayor para Emma, 100.000 de ámbar y varias plántulas."
    ],
    change: {
      title: "Ediciones y precios trasladados a una sección propia",
      description: "La ficha separa el contenido de la edición estándar, la Digital Deluxe y la reserva del bloque general de información confirmada.",
      sourceUrls: ["https://store.playstation.com/es-es/concept/10014719"]
    }
  },
  "grand-theft-auto-vi": {
    editions: {
      sourceUrl: "https://store.playstation.com/es-es/product/EP1004-PPSA01547_00-GTAVISTANDARD001",
      region: "España",
      items: [
        {
          name: "Standard Edition",
          prices: [{ platform: "PS5", value: "79,99 €" }],
          includes: ["Grand Theft Auto VI"]
        },
        {
          name: "Ultimate Edition",
          prices: [{ platform: "PS5", value: "99,99 €" }],
          includes: [
            "Juego base y Ultimate Edition Upgrade",
            "Vehículos, armas, ropa, peinados y tatuajes exclusivos para la campaña",
            "Acceso a Rideout Customs, Sara's, Stock 305, Electric Fang Tattoo y One-Eyed Willie's",
            "Encargos y colecciones adicionales repartidos por Leonida"
          ]
        }
      ],
      preorderBonuses: ["Pack Vintage Vice City", "Un mes de GTA+ en PS5"],
      notes: ["El mes de GTA+ se renueva automáticamente al precio habitual si no se cancela."]
    },
    removeConfirmed: ["Las reservas incluyen el pack Vintage Vice City. En PS5 añaden un mes de GTA+ con renovación automática."],
    spotlight: {
      kicker: "El núcleo de la aventura",
      title: "Jason, Lucia y el estado de Leonida",
      intro: "Rockstar ha confirmado una campaña para un jugador protagonizada por una pareja atrapada en una conspiración que se extiende mucho más allá de Vice City.",
      items: [
        {
          title: "Protagonistas",
          value: "Jason y Lucia",
          description: "Los dos dependen el uno del otro después de que un golpe sencillo salga mal y los arrastre al lado más oscuro de Leonida."
        },
        {
          title: "Escenario",
          value: "Vice City y Leonida",
          description: "La aventura recorre Vice City, Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia y el parque nacional Mount Kalaga."
        },
        {
          title: "Formato anunciado",
          value: "Campaña para un jugador",
          description: "La información oficial publicada hasta ahora se centra en la historia de Jason y Lucia; el posible componente en línea sigue sin detallarse."
        }
      ]
    },
    change: {
      title: "Ediciones y precios trasladados a una sección propia",
      description: "La ficha compara Standard y Ultimate, reúne las bonificaciones de reserva y reserva el bloque de claves para la historia y el mundo de Leonida.",
      sourceUrls: [
        "https://store.playstation.com/es-es/product/EP1004-PPSA01547_00-GTAVISTANDARD001",
        "https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions"
      ]
    }
  },
  "marvels-wolverine": {
    editions: {
      sourceUrl: "https://store.playstation.com/es-es/product/UP9000-PPSA03671_00-MARVELSWOLVERINE",
      region: "España",
      items: [
        {
          name: "Edición estándar",
          prices: [{ platform: "PS5", value: "79,99 €" }],
          includes: ["Marvel: Lobezno"]
        },
        {
          name: "Edición Digital Deluxe",
          prices: [{ platform: "PS5", value: "89,99 €" }],
          includes: [
            "Juego base",
            "Cinco trajes exclusivos",
            "Cinco garras exclusivas",
            "Cuatro puntos de técnica",
            "Desbloqueo anticipado del traje clásico marrón y las garras reflectantes",
            "Cuatro avatares para PlayStation"
          ]
        },
        {
          name: "Mejora Digital Deluxe",
          kind: "Mejora",
          prices: [{ platform: "PS5", value: "10,00 €" }],
          includes: ["Todo el contenido adicional de la Digital Deluxe para quienes ya tengan la edición estándar"]
        }
      ],
      preorderBonuses: [],
      notes: []
    },
    change: {
      title: "Ediciones y precios añadidos a una sección propia",
      description: "La ficha compara la edición estándar, la Digital Deluxe y la mejora independiente con sus contenidos y precios españoles.",
      sourceUrls: ["https://store.playstation.com/es-es/product/UP9000-PPSA03671_00-MARVELSWOLVERINE"]
    }
  }
};

function removeValues(list = [], values = []) {
  const blocked = new Set(values);
  return list.filter((item) => !blocked.has(item));
}

for (const [id, update] of Object.entries(updates)) {
  const filePath = path.join(ROOT, "data", "game-hubs", `${id}.json`);
  const data = JSON.parse(await readFile(filePath, "utf8"));

  if (update.pcRequirements) data.pcRequirements = update.pcRequirements;
  if (update.editions) data.editions = update.editions;
  if (update.spotlight) data.spotlight = update.spotlight;
  if (update.price) data.price = update.price;
  if (update.removeConfirmed) data.confirmed = removeValues(data.confirmed, update.removeConfirmed);
  if (update.removePending) data.pending = removeValues(data.pending, update.removePending);

  if (update.change && !(data.changes || []).some((item) => item.title === update.change.title)) {
    data.changes = [{ date: TODAY, ...update.change }, ...(data.changes || [])];
  }
  data.updatedAt = TODAY;

  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`${id}: datos comerciales y técnicos sincronizados`);
}
