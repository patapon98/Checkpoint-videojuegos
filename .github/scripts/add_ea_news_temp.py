from pathlib import Path
import re

news_id = "ea-autorizacion-final-compra-2026"
data_path = Path("js/news-data.js")
data = data_path.read_text(encoding="utf-8")
if f'id: "{news_id}"' not in data:
    entry = '''  {
    id: "ea-autorizacion-final-compra-2026",
    important: true,
    emphasis: { es: ["ha recibido todas las autorizaciones regulatorias necesarias", "prevé cerrar la operación el 4 de agosto de 2026", "Electronic Arts dejará de cotizar y pasará a ser una compañía privada"] },
    category: { es: "Industria" },
    date: "2026-07-31",
    featured: false,
    ticker: {
      keyword: { es: "Electronic Arts" },
      copy: { es: "Electronic Arts recibe la autorización final para completar su compra por 55.000 millones de dólares" }
    },
    tone: "industry",
    title: {
      es: "Electronic Arts recibe la autorización final para completar su compra por 55.000 millones de dólares"
    },
    summary: {
      es: "Electronic Arts comunicó que ha recibido todas las autorizaciones regulatorias necesarias y prevé cerrar la operación el 4 de agosto de 2026. La compra por PIF, Silver Lake y Affinity Partners está valorada en unos 55.000 millones de dólares."
    },
    why: {
      es: "Electronic Arts dejará de cotizar y pasará a ser una compañía privada controlada por el consorcio comprador. El cambio de propiedad afecta a una de las mayores editoras del sector, responsable de EA Sports FC, Battlefield, Apex Legends y Los Sims."
    },
    sources: [
      {
        label: "Electronic Arts",
        type: { es: "Anuncio oficial de la operación" },
        url: "https://www.ea.com/news/ea-announces-agreement-to-be-acquired?isLocalized=true"
      },
      {
        label: "Reuters",
        type: { es: "Autorización final y fecha prevista de cierre" },
        url: "https://www.reuters.com/legal/transactional/saudi-pifs-55-billion-ea-deal-gets-eu-approval-under-subsidy-rules-2026-07-31/"
      }
    ]
  },
'''
    marker = "window.FINALSECRETO_NEWS = [\n"
    if marker not in data:
        raise SystemExit("No se encontró FINALSECRETO_NEWS")
    data = data.replace(marker, marker + entry, 1)
    data_path.write_text(data, encoding="utf-8")

news_path = Path("js/news.js")
news = news_path.read_text(encoding="utf-8")
if f'"{news_id}":' not in news:
    details = '''    "ea-autorizacion-final-compra-2026": {
      es: [
        "El consorcio está formado por el fondo soberano saudí PIF, la firma de inversión Silver Lake y Affinity Partners. Los accionistas recibirán 210 dólares por acción en una de las mayores compras financiadas de una empresa de videojuegos.",
        "La autorización bajo el Reglamento europeo sobre subvenciones extranjeras era el último gran obstáculo regulatorio. Una vez completada la operación, EA dejará el mercado bursátil y el consorcio asumirá el control de franquicias como EA Sports FC, Battlefield, Apex Legends y Los Sims."
      ]
    },
'''
    marker = "  const homeDetails = {\n"
    if marker not in news:
        raise SystemExit("No se encontró homeDetails")
    news = news.replace(marker, marker + details, 1)
    news_path.write_text(news, encoding="utf-8")

for html_name in ("index.html", "noticias.html"):
    path = Path(html_name)
    html = path.read_text(encoding="utf-8")
    html = re.sub(r'(/js/news-data\.js\?v=)[^"\']+', r'\g<1>20260731-1', html)
    html = re.sub(r'(/js/news\.js\?v=)[^"\']+', r'\g<1>20260731-1', html)
    path.write_text(html, encoding="utf-8")

summary = "Electronic Arts comunicó que ha recibido todas las autorizaciones regulatorias necesarias y prevé cerrar la operación el 4 de agosto de 2026. La compra por PIF, Silver Lake y Affinity Partners está valorada en unos 55.000 millones de dólares."
why = "Electronic Arts dejará de cotizar y pasará a ser una compañía privada controlada por el consorcio comprador. El cambio de propiedad afecta a una de las mayores editoras del sector, responsable de EA Sports FC, Battlefield, Apex Legends y Los Sims."
fragments = [
    "ha recibido todas las autorizaciones regulatorias necesarias",
    "prevé cerrar la operación el 4 de agosto de 2026",
    "Electronic Arts dejará de cotizar y pasará a ser una compañía privada",
]
assert all(fragment in summary or fragment in why for fragment in fragments)
