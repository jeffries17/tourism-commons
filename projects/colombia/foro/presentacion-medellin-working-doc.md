# Presentación — Foro de Tendencias en Turismo (Medellín)

**Working document for the live presentation.** Reflects the final 19-slide Reveal.js deck built May 2026.

---

## Event details

- **Event**: III Foro de Tendencias en el Turismo
- **Location**: Medellín, Colombia
- **Dates**: 27–28 mayo 2026
- **Session**: *"Territorios en diálogo: aprendizajes globales para destinos locales"*
- **Host**: Programa TRECC (Instituto Francés de Colombia + Fundación Compás Urbano)
- **Format**: presentación de **9 minutos** + Q&A
- **Co-panelistas**: Willy Posadas (Antigua Viva, Guatemala) + ponentes de Francia y África
- **Audiencia**: empresarios y emprendedores del sector turismo, operadores, profesionales de DMO, academia. Sala de ~150 personas. Interés declarado en *uso estratégico de datos*, *tomar decisiones con mejor información*, *anticiparse a cambios del mercado*

---

## Build decisions (locked)

- **Build target**: Reveal.js 5.1.0, single HTML file, 1920×1080, `transition: 'fade'`. Speaker notes inline. Run fullscreen in browser.
- **Case studies**: tres países — **Eswatini**, **Gambia**, **Tonga**. Timor-Leste removed.
- **Tres Voces cards**: abstract (no labels linking to specific countries). Each case study shows a different angle of the same three-voice problem.
- **Map silhouettes**: white filled SVG on dark background, opacity ~0.55 — visible at 150-person hall distance.
- **Eswatini photo**: Unsplash `photo-p3xW6mqxhzs` (greenhouses landscape). If CDN URL fails, download and embed locally.
- **Spanish register**: tuteo (tú / -as / -es / ti) in single-address contexts; ustedes for audience address.
- **Slide density**: big, bold, short phrases. Minimum 22px label text; hero numbers 88–260px. No paragraphs on screen.
- **Tres cosas**: three actionable takeaways — no alignment matrix slide, no stakeholder grid.

---

## Visual system

- **Sponsor strip**: top of every content slide (white pill strip with logo chips). Still has placeholder text — swap to real logos from template PDF before event.
- **Wave ribbon**: blue (#28B5E1) → purple (#7E3D9B) → magenta (#E91876), flowing diagonally. Used on title + gracias slides.
- **Color palette**: `--bright-blue: #28B5E1`, `--dark-blue: #2C6DAB`, `--magenta: #E91876`, `--purple: #7E3D9B`, `--green: #96C93D`, `--dark-navy: #0E1A2E`
- **Dark slides**: solid `#0E1A2E` — cold open, framing, country conclusions, cierre.
- **Country intro slides**: dark navy bg + optional photo overlay, map silhouette right, content left.
- **Numeric hero**: large bold number left-aligned, supporting text right — used for Eswatini stats and Gambia bar chart.

---

## Slide structure — 19 slides, 9 minutes

| # | Slide | Type | Duration |
|---|---|---|---|
| 1 | Cold open | Dark — fragment reveals | 40s |
| 2 | Title | Template chrome + wave | 20s |
| 3 | Framing | Dark — fragment reveals | 20s |
| 4 | Tres Voces | White — three colored cards | 45s |
| 5 | Eswatini INTRO | Dark — photo bg + silhouette | 15s |
| 6 | Eswatini STAT | White — big numbers | 30s |
| 7 | Eswatini REVEAL | White — two-col cards | 30s |
| 8 | Eswatini CONCLUSION | Dark — closing line | 20s |
| 9 | Gambia INTRO | Dark — silhouette | 15s |
| 10 | Gambia BAR CHART | White — hero number + bars | 35s |
| 11 | Gambia DIGITAL GAP | White — three stat blocks | 35s |
| 12 | Gambia CONCLUSION | Dark — closing line | 20s |
| 13 | Tonga INTRO | Dark — island chain silhouette | 15s |
| 14 | Tonga VENN | White — SVG Venn diagram | 25s |
| 15 | Tonga KEYWORDS | White — table with highlights | 35s |
| 16 | Tonga CONCLUSION | Dark — closing line | 25s |
| 17 | Tres cosas para el lunes | White — numbered list | 45s |
| 18 | Cierre | Dark — single line | 30s |
| 19 | Gracias | White — gradient type + wave | — |

**Total spoken: ~8:40. Buffer: ~20s.**

---

## Slide scripts

### S1 — Cold open

**Builds** (fragment fade-in):
1. *El eslogan no es la marca.*
2. *Tampoco es solo el DMO.*
3. *Ni ustedes. Ni el visitante.*
4. **Pero es medible.**
5. *Pasar del sentimiento al dato — así es como un destino mejora.*

**Spoken (~40s)**:
> "El eslogan no es la marca. No puede serlo. Pero tampoco es solo lo que dice el DMO. Ni lo que ustedes dicen. Ni lo que dice el visitante. Suena vago — 'la reconocen cuando la ven.' Y sí, en parte lo es. Pero hay datos concretos que dicen cómo está su marca, qué es, qué dice la gente sobre ella. Y pasar del sentimiento al dato — así es como un destino mejora."

---

### S2 — Title

**On screen**: "Más que un *sentimiento* / La **matemática** de la marca turística"

**Spoken (~20s)**:
> "Más que un sentimiento. La matemática de la marca turística. Está distribuida entre todos los que la venden — y ya es medible. Esto es lo que les quiero contar en los próximos nueve minutos."

---

### S3 — Framing

**Builds**:
1. *Tres países.*
2. *Tres regiones.*
3. **Los patrones se repiten.**
4. África Occidental · África Austral · Pacífico Sur
5. *Hallazgos seleccionados — lo que viaja.*

**Spoken (~20s)**:
> "Vamos a ver tres países. Gambia, en África occidental. Eswatini, en África austral. Tonga, en el Pacífico Sur. Tres proyectos distintos, tres contextos completamente diferentes. Lo que nos sorprendió: los patrones se repiten. Muestro hallazgos seleccionados — lo que cualquier destino puede usar."

---

### S4 — Tres Voces

**Cards** (abstract — not labeled to specific countries):
- **DMO** — Afirma
- **El operador internacional** — Vende
- **El visitante** — Dice

**Fragment**: *"Y otras voces: medios, cine, boca a boca — pero estas tres se pueden mover."*

**Spoken (~45s)**:
> "Una marca turística se construye con muchas voces. Los medios, el cine, el boca a boca — todo contribuye. Pero hay tres voces que tienen algo en común: son públicas, cuantificables, y se pueden mover. Lo que el DMO afirma. Lo que los operadores internacionales venden. Lo que los visitantes dicen. Tres destinos, tres ángulos distintos de la misma pregunta."

---

### S5 — Eswatini INTRO

**On screen**: África Austral · **ESWATINI** · *"¿Estás contando una historia que invite a quedarse?"*

**Map**: SVG polygon silhouette (diamond shape), white, opacity 0.55.
**Photo bg**: Unsplash `photo-p3xW6mqxhzs` (landscape, greenhouses).

**Spoken (~15s)**:
> "Primer destino: Eswatini. Un pequeño reino en el sur de África, entre Sudáfrica y Mozambique."

---

### S6 — Eswatini STAT

**On screen**:
- Headline: *"La mitad solo pasa."*
- **48,76%** en tránsito o una sola noche
- **1,8** noches promedio — turista de ocio

**Spoken (~30s)**:
> "La estadía promedio de un turista de ocio es 1,8 noches. Y casi la mitad de todos los visitantes — 48,76% — están en tránsito o se quedan una sola noche. La pregunta que nos hicimos es: ¿por qué? ¿Es que no hay demanda para quedarse más?"

---

### S7 — Eswatini REVEAL

**Headline**: *"Los nichos que sí se quedan — ya existen."*

**Two cards**:
- 🇫🇷 Senderismo y turismo cultural — **2,70** días · segmento 25–34 · encuestas de salida ETA
- 🇬🇧 Aventura y naturaleza — **4–9** días · segmento 45–64 · ETA database

**Fragment**: *"Operadores internacionales ya piden paquetes de 4+ días. El producto — no. Los itinerarios conectados — tampoco."*

**Spoken (~30s)**:
> "Porque los datos de salida muestran que ciertos grupos ya están quedándose más tiempo. Turistas franceses de cultura y senderismo: 2,70 días. Segmentos británicos de aventura: entre 4 y 9 días. Los operadores internacionales ya están pidiendo paquetes de 4 días o más. La demanda existe. Lo que falta son los itinerarios que hagan que quedarse sea creíble."

---

### S8 — Eswatini CONCLUSION

**On screen**: *"El problema no es la demanda."* / **"Es la imagen."**

**Fragment**: *"Mientras el destino se vende como escala, se visitará como escala."*

**Spoken (~20s)**:
> "El problema no es la demanda. Es la imagen. El destino tiene una imagen de lugar de paso. Y mientras esa imagen no cambie — en cómo lo venden los operadores, en cómo lo presentan los guías, en cómo lo cuentan los visitantes — la estadía no cambia."

---

### S9 — Gambia INTRO

**On screen**: África Occidental · **GAMBIA** · *"¿Quién está contando la historia de tu destino?"*

**Map**: SVG elongated strip (thin east-west band), white, with labels "← Atlántico" and "Senegal →".

**Spoken (~15s)**:
> "Segundo destino: Gambia. El país más pequeño de África continental. Una franja de territorio que sigue el río Gambia, completamente rodeada por Senegal excepto por su costa atlántica."

---

### S10 — Gambia BAR CHART

**On screen**:
- Hero: **9%** — *"de itinerarios internacionales menciona cultura o artesanía gambiana"*
- Bar chart: Senegal 26% · Ghana 21% · **Gambia 9%** (magenta bar)
- Source: 239 páginas de operadores analizadas · contenido cultural en itinerarios

**Spoken (~35s)**:
> "Analizamos 239 páginas de operadores internacionales vendiendo destinos en África occidental. Solo el 9% menciona contenido cultural o artesanal de Gambia. Comparado con Senegal — 26%. Ghana — 21%. La frustración interna que escuchamos de los propios actores está confirmada en los datos. Pero la pregunta es: ¿por qué?"

---

### S11 — Gambia DIGITAL GAP

**Three stat blocks**:
- **61%** de actores culturales sin presencia digital básica
- **64%** publican menos de una vez al mes en redes
- **–25%** visibilidad máxima en búsqueda — invisible para clientes internacionales

**Fragment**: *"Si no pueden encontrarte, solo cuentan lo que conocen."*

**Spoken (~35s)**:
> "El 61% de los actores del sector cultural y creativo son prácticamente invisibles online. El 64% publica en redes sociales menos de una vez al mes. Y la visibilidad en búsqueda no supera el 25%. Entonces los operadores solo pueden hablar de lo que encuentran. Lo que encuentran — es la playa. Y aquí está el punto sobre estacionalidad: los destinos de la región que han construido una oferta cultural visible han empezado a romper la dependencia de temporada — porque el producto cultural viaja durante todo el año."

---

### S12 — Gambia CONCLUSION

**On screen**: *"Cambiar lo que te venden"* / **"= cambiar cuándo te visitan."**

**Fragment**: *"Y eso empieza por hacerte encontrable."*

**Spoken (~20s)**:
> "Cambiar lo que te venden es cambiar cuándo te visitan. La dependencia estacional de Gambia no es inevitable — es consecuencia de lo que los operadores pueden encontrar y contar. Y eso empieza por hacerse encontrable."

---

### S13 — Tonga INTRO

**On screen**: Pacífico Sur · **TONGA** · *"¿Cómo aparece tu marca cuando alguien te busca?"*

**Map**: SVG island chain (dots and ellipses, north-south archipelago), white.

**Spoken (~15s)**:
> "Tercer destino: Tonga. Un archipiélago de 170 islas en el Pacífico Sur — el único reino constitucional que persiste en Polinesia."

---

### S14 — Tonga VENN

**Headline**: *"Dos sitios. Una sola marca."*

**SVG Venn**: tongatourism.travel **377** keywords ↔ thekingdomoftonga.com **312** keywords (large overlap, competing for same traffic)

**Fragment**: *"El sitio abandonado sigue activo, sigue indexado, sigue capturando visitantes."*

**Spoken (~25s)**:
> "Tonga tiene dos sitios web oficiales. Uno activo, uno abandonado. Los dos compiten por el mismo tráfico. Esta es la superposición de palabras clave que cada uno captura. El sitio abandonado no está muerto — sigue siendo indexado, sigue capturando visitantes. ¿Qué pasa cuando alguien busca términos específicos?"

---

### S15 — Tonga KEYWORDS

**Headline**: *"El sitio abandonado sigue ganando."*

**Table** (fragment reveals per row):

| Búsqueda | tongatourism.travel | thekingdomoftonga.com |
|---|---|---|
| "tonga" · 49,500/mes | **#22** ✓ | #31 |
| "kingdom of tonga" · 12,100/mes | #30 | **#3** ✗ |
| "hotels in tonga" [Comercial] | #20 | **#4** ✗ |
| "where is tonga" | #32 | **#9** ✗ |

*Fuente: SEMRush, marzo 2025*

**Spoken (~35s)**:
> "Para 'kingdom of tonga' — 12,100 búsquedas al mes — el sitio abandonado aparece en el puesto 3. El activo, en el 30. Para 'hotels in tonga' — intención comercial, alguien listo para reservar — el sitio abandonado: puesto 4. El activo: puesto 20. Solo para el genérico 'tonga', el sitio activo tiene ventaja. En todo lo demás, están perdiendo ante sí mismos."

---

### S16 — Tonga CONCLUSION

**On screen**: *"Tu competidor más fuerte:"* / **"eres tú mismo."**

**Fragment**: *"La versión que olvidaste desactivar."*

**Spoken (~25s)**:
> "El competidor más fuerte de Tonga no es Fiji. No es Samoa. Es la versión de Tonga que nadie desactivó. La pregunta para cualquier destino en esta sala: ¿qué versiones de ustedes mismos siguen vivas en Google ahora mismo? Microsites viejos, campañas olvidadas, fichas desactualizadas. La primera auditoría no es de sus socios — es de ustedes mismos."

---

### S17 — Tres cosas para el lunes

**Numbered list**:
1. **Escuchen lo que ya está dicho.** Las últimas 50 reseñas de su destino por tema. Una tarde — gratis.
2. **Auditen a sus socios.** Cómo describen cinco operadores internacionales su destino. Comparen con la mensajería oficial.
3. **Busquen su propio destino.** ¿Qué versiones de ustedes mismos encuentran? Las celdas que no coinciden son la prioridad — no la próxima campaña.

**Spoken (~45s)**:
> "Tres cosas que cualquier persona en esta sala puede hacer el lunes. Primero: lean las últimas 50 reseñas de su destino. Toma una tarde y es gratis. Segundo: lean cómo cinco operadores internacionales describen su destino, y compárenlo con lo que dicen ustedes. Tercero: busquen su propio destino en Google. ¿Qué aparece? ¿Qué versión de ustedes mismos encuentran primero?"

---

### S18 — Cierre

**On screen** (builds):
- *"La marca de su destino"*
- **"ya existe."**
- *"Su trabajo es escucharla."*

**Spoken (~30s)**:
> "La marca de su destino ya existe. Distribuida, en datos públicos, ahora mismo. Su trabajo no es inventarla. Su trabajo es escucharla — y decidir si quieren alinearse a ella o cambiarla. Pero no pueden hacer ninguna de las dos cosas si no la están midiendo. **Más que un sentimiento. Matemática.** Gracias."

---

### S19 — Gracias

**On screen**: ¡Gracias! (gradient: blue → purple → magenta)
*III Foro de Tendencias en el Turismo · País invitado: Francia · Medellín 2026*

---

## Resumen de stats por slide (referencia rápida)

| Slide | Destino | Stat o dato clave | Fuente |
|---|---|---|---|
| S6 | Eswatini | 48,76% tránsito/una noche; 1,8 noches ALOS turista de ocio | Eswatini VCA PDF |
| S7 | Eswatini | Franceses 25–34: 2,70 días (senderismo+cultura); UK 45–64: 4–9 días (aventura) | Eswatini VCA / encuestas ETA |
| S10 | Gambia | 9% itinerarios intl menciona cultura (Senegal 26%, Ghana 21%); 239 páginas analizadas | Gambia Deliverable 2 |
| S11 | Gambia | 61% actores culturales sin presencia digital básica; 64% <1 post/mes; <25% visibilidad búsqueda | Gambia Deliverable 1 |
| S14 | Tonga | tongatourism.travel 377 keywords; thekingdomoftonga.com 312 keywords; gran solapamiento | SEMRush / Tonga Assessment |
| S15 | Tonga | "kingdom of tonga": #30 activo vs #3 abandonado; "hotels in tonga": #20 vs #4 | SEMRush, marzo 2025 |

---

## Assets

### A. Fotografía

| Slide | Imagen | Estado |
|---|---|---|
| S5 | Eswatini landscape — Unsplash `photo-p3xW6mqxhzs` | En el HTML. Verificar que el CDN URL resuelve. Si no, descargar y usar local. |
| S9 | Gambia INTRO — sin foto (solo dark navy bg + silhouette) | OK |
| S13 | Tonga INTRO — sin foto (solo dark navy bg + silhouette) | OK |

### B. Brand / event assets

- Sponsor strip: textos placeholder en el HTML. Reemplazar con logos reales del template PDF antes del 27 mayo.
- Event lockup: "III Foro de Tendencias / País invitado: Francia" — en el footer de title + gracias.
- Wave ribbon SVG: recreado en el HTML, no necesita template PDF.

### C. Gráficos (inline en el HTML)

| Slide | Gráfico | Estado |
|---|---|---|
| S5 | Eswatini silhouette (diamond polygon) | SVG inline ✓ |
| S9 | Gambia silhouette (thin strip + labels) | SVG inline ✓ |
| S13 | Tonga island chain (dots/ellipses) | SVG inline ✓ |
| S14 | Venn diagram (tongatourism vs thekingdom) | SVG inline ✓ |
| S10 | Bar chart Senegal/Ghana/Gambia | HTML/CSS bars ✓ |
| S11 | Three stat blocks 61% / 64% / –25% | HTML/CSS ✓ |
| S15 | Keyword rankings table | HTML table with highlights ✓ |

---

## Fuentes

- `/foro/Eswatini - Value Chain Analysis_FINAL.pdf`
- `/foro/The Gambia - Deliverable 1 - Creative Industries Digital Baseline - 10102025.docx`
- `/foro/The Gambia - Deliverable 2 - Regional Benchmarking & Market Positioning Analysis - 29102025.docx`
- `/foro/Tonga Digital Tourism Assessment - Presentation.pptx (2).pdf`
- `/foro/Tonga Tourism Market Segmentation - Presentation.pptx (2).pdf`

*(All paths relative to `/Users/alexjeffries/Tourism/tourism-commons/projects/colombia/foro/`)*

---

## Pendientes antes del 27 mayo

1. **Verificar foto Eswatini**: abrir el HTML en el browser y confirmar que `https://images.unsplash.com/photo-p3xW6mqxhzs?auto=format&fit=crop&w=1920&q=80` carga. Si no, descargar y referenciar localmente.
2. **Sponsor strip**: reemplazar los logo-chips placeholder con los logos reales del template PDF.
3. **Lectura cronometrada**: leer el guion en voz alta con avance de slides, validar ≤9 min.
4. **Q&A prep**: anticipar preguntas frecuentes — "¿cómo se contrata?", "¿qué herramientas usan?", "¿por qué los DMO no lo hacen solos?" — tener respuestas listas (sin auto-promoción excesiva).

---

## Estado del archivo HTML

`/foro/presentacion-medellin.html` — **completo, 19 slides**. Listo para browser testing y ajustes visuales finales. Sponsor strip es lo único que requiere reemplazo antes de presentar.
