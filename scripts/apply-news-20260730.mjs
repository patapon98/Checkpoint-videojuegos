import fs from 'node:fs';

const newsPath = 'js/news-data.js';
const workflowPath = '.github/workflows/apply-news-20260730.yml';
const scriptPath = 'scripts/apply-news-20260730.mjs';
const source = fs.readFileSync(newsPath, 'utf8');

const entries = `  {
    id: "xbox-resultados-junio-2026",
    important: true,
    emphasis: { es: ["los ingresos de contenidos y servicios de Xbox cayeron un 10%", "el hardware retrocedió un 13%", "Microsoft alcanzó 90.007 millones de dólares de ingresos"] },
    category: { es: "Industria" },
    date: "2026-07-29",
    featured: false,
    ticker: {
      keyword: { es: "Xbox" },
      copy: { es: "Los ingresos de contenidos y servicios de Xbox cayeron un 10% entre abril y junio" }
    },
    tone: "xbox",
    title: {
      es: "Los ingresos de contenidos y servicios de Xbox cayeron un 10% entre abril y junio"
    },
    summary: {
      es: "Microsoft comunicó que los ingresos de contenidos y servicios de Xbox descendieron un 10% interanual durante el trimestre terminado el 30 de junio de 2026. Los ingresos por hardware bajaron un 13%, mientras el conjunto de Microsoft alcanzó 90.007 millones de dólares."
    },
    why: {
      es: "El retroceso afecta al negocio que reúne juegos, contenido, Game Pass, suscripciones, nube y publicidad. Aporta contexto económico directo a la reestructuración de Xbox y muestra que la debilidad no se limita a la venta de consolas."
    },
    sources: [
      {
        label: "Microsoft",
        type: { es: "Resultados oficiales" },
        url: "https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q4/press-release-webcast"
      },
      {
        label: "Microsoft",
        type: { es: "Métricas oficiales" },
        url: "https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q4/metrics"
      },
      {
        label: "The Verge",
        type: { es: "Contexto sobre Xbox" },
        url: "https://www.theverge.com/tech/972738/xbox-revenue-microsoft-earnings-q4-2026"
      }
    ]
  },
  {
    id: "double-fine-despidos-independencia",
    emphasis: { es: ["23 empleados", "tres semanas después de recuperar su independencia", "necesaria para garantizar la supervivencia del estudio"] },
    category: { es: "Industria" },
    date: "2026-07-28",
    featured: false,
    ticker: {
      keyword: { es: "Double Fine" },
      copy: { es: "Double Fine despide a 23 empleados tras recuperar su independencia de Xbox" }
    },
    tone: "industry",
    title: {
      es: "Double Fine despide a 23 empleados tras recuperar su independencia de Xbox"
    },
    summary: {
      es: "El estudio de Psychonauts ha reducido su plantilla en 23 personas, tres semanas después de abandonar Xbox y volver a ser independiente. Tim Schafer explicó que la medida era necesaria para ajustar el tamaño de la empresa y garantizar su supervivencia."
    },
    why: {
      es: "Los recortes muestran el coste inmediato de la transición acordada durante la reestructuración de Xbox. Double Fine conservó su propiedad intelectual y su catálogo, pero también recuperó la responsabilidad de financiar y sostener su actividad."
    },
    sources: [
      {
        label: "Double Fine",
        type: { es: "Comunicado oficial sobre su independencia" },
        url: "https://www.doublefine.com/news/independence-day"
      },
      {
        label: "PC Gamer",
        type: { es: "Declaración de Tim Schafer y despidos" },
        url: "https://www.pcgamer.com/gaming-industry/only-the-survival-of-our-studio-would-make-us-consider-such-a-painful-action-tim-schafer-announces-double-fine-layoffs-just-3-weeks-after-xbox-cut-it-loose/"
      },
      {
        label: "GamesRadar+",
        type: { es: "Contexto" },
        url: "https://www.gamesradar.com/games/after-escaping-xbox-double-fine-lays-off-23-people-as-tim-schafer-says-only-the-survival-of-our-studio-would-ever-make-us-consider-such-a-painful-action/"
      }
    ]
  },
`;

let next = source;
if (!source.includes('id: "xbox-resultados-junio-2026"')) {
  const marker = 'window.FINALSECRETO_NEWS = [\n';
  if (!source.includes(marker)) throw new Error('No se encontró el inicio de FINALSECRETO_NEWS');
  next = source.replace(marker, marker + entries);
  fs.writeFileSync(newsPath, next);
}

for (const path of [workflowPath, scriptPath]) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
