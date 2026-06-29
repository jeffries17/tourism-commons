# Plan de Referencias Visuales — Día 1 y Día 2

> Brief visual para los dos decks presenciales. Cubre: identidad heredada del sistema online, fotografía de fondo, iconografía, infografías custom (matriz RTA × nicho, comparativas B2B/B2C, diagramas de roleplay), y producción/responsabilidades.

> **Principio rector:** los decks presenciales son visualmente más cálidos, más colombianos y menos abstractos que los online. La fotografía deja de ser stock y pasa a ser contexto real (operadores, mesas de trabajo, ferias). El sistema tipográfico y de color **no cambia** — la coherencia con los decks online ancla el módulo dentro del programa completo.

---

## 1. Identidad heredada (no se modifica)

De `sesion1-deck.html` / `sesion2-deck.html` se conserva tal cual:

| Elemento | Valor |
|---------|-------|
| Paleta primaria | Teal `#3E9987` · Teal-dark `#2D7A6A` · Teal-light `#E6F4F1` |
| Paleta acento | Gold `#F5C400` · Gold-light `#FEF7D6` |
| Paleta soporte | Navy `#1B2B5A` · Navy-mid `#2E4080` · Red `#C8352A` |
| Fondos | `--bg #F7F8F5` · `--bg-alt #EEF2EF` · `--white #FFFFFF` · `--navy` para alto contraste |
| Tipografía cuerpo | Georgia / Times serif · `--text #1A1A1A` |
| Tipografía sans | Arial / Arial Black para labels, kickers, slide-counter, ítems de tabla |
| Topbar | TRECC logo (rojo/navy) + slide-counter + section-label en teal-dark |
| Nav buttons | Fixed bottom-right · navy con sombra |
| Accent bar | 3px × 60px gold, antes del título |

**Ajuste mínimo entre Día 1 y Día 2:**
- Topbar `slide-section-label` en Día 1 lee "DÍA 1 · CONSTRUYENDO TU HISTORIA"
- En Día 2 lee "DÍA 2 · CONSTRUYENDO TU SISTEMA"
- Color del label: teal-dark en Día 1, navy en Día 2 — micro-diferencia que ancla qué día estamos sin romper la paleta

**Ajuste contextual para presencial:**
- La pregunta ancla *"¿Puede un comprador europeo entender, confiar, y revender lo que vos hacés responsablemente?"* aparece persistente en una banda menor del topbar (debajo del slide-section-label) en **todos los slides de Día 1 y Día 2**, no sólo en el slide dedicado. Refuerzo permanente, como está en la pared física.

---

## 2. Fotografía de fondo — `block-intro` slides

Cada bloque mayor abre con un `block-intro` que usa una foto a pantalla completa con overlay degradado navy + teal (ya definido en CSS). Total:

- **Día 1:** 5 fotos (Bloque 1 Galería, Bloque 2 Tres pitches, Bloque 3 Compradores, Bloque 4 Roleplay R1, Bloque 5 Artefacto)
- **Día 2:** 4 fotos (Bloque 1 Preguntas difíciles, Bloque 2 Roleplay R2, Bloque 3 CRM, Bloque 4 Speed-feria)
- **Adicional:** 2 covers (hero slide cada día) + 2 closings = 4 fotos más

**Total: 13 imágenes.**

### Brief por foto

| Deck | # | Bloque | Mood/Contenido buscado |
|------|---|--------|------------------------|
| D1 | 1 | Hero cover | Operador colombiano en su elemento — guía hablando con un turista en paisaje (preferible: café, comunidad, naturaleza) · luz natural, no posada |
| D1 | 2 | Bloque 1 Galería | Notas adhesivas / pared con texto · pueden ser de talleres previos del programa |
| D1 | 3 | Bloque 2 Tres pitches | Persona hablando con expresión segura · puede ser facilitador o operador participante en sesión previa |
| D1 | 4 | Bloque 3 Compradores | Mesa de trabajo con mapas / docs europeos · o stand de feria internacional · concepto: "mirar al mercado" |
| D1 | 5 | Bloque 4 Roleplay R1 | Dos personas frente a frente en conversación · mesa con tarjetas visibles · ambiente de aula taller |
| D1 | 6 | Bloque 5 Artefacto | Manos sosteniendo o trabajando en material impreso · tarjeta, one-pager, escritura · detalle cercano |
| D1 | 7 | Closing Día 1 | Sala vacía al final del día / luz dorada · o grupo colombiano sonriendo · sensación de "lo logramos" |
| D2 | 1 | Hero cover | Operador con expresión más resuelta que en Día 1 · o equipo colombiano en reunión seria |
| D2 | 2 | Bloque 1 Preguntas difíciles | Persona con expresión escéptica / pensativa · puede ser foto cándida de feria internacional · concepto: "duda que pide ser respondida" |
| D2 | 3 | Bloque 2 Roleplay R2 | Mesa mixta · personas escribiendo, escuchando · más intensidad que D1 (esta ronda es exigente) |
| D2 | 4 | Bloque 3 CRM | Celular + tarjeta de presentación + notas escritas · concepto: "captura inmediata después de la conversación" · detalle cercano |
| D2 | 5 | Bloque 4 Speed-feria | Filas enfrentadas en feria · ritmo · movimiento · ojalá una foto real de speed-meeting B2B |
| D2 | 6 | Closing módulo | Grupo final · aplauso · evento de cierre · sensación de "ahora salen al ruedo" |

### Sourcing — 3 opciones, orden de preferencia

1. **Fotos propias del programa** *(óptimo)*
   - ¿Existen fotos de los Módulos 1 (online) anteriores o de talleres TRECC previos en Colombia?
   - Fotos de la Sesión 1 del 27 de abril (si fue grabada/fotografiada)
   - Workshops anteriores del facilitador en otros países latinoamericanos pueden funcionar si el mood encaja

2. **Fotografía contratada Colombia** *(mejor calidad, costo mayor)*
   - Una sesión de 1 día con un fotógrafo en Medellín / con operadores locales = banco para los 6 slides de D1 + portada
   - Costo aproximado a investigar

3. **Stock fotografía cuidadosamente seleccionada** *(fallback)*
   - Unsplash / Pexels con búsquedas específicas: "Colombia tourism", "Medellin workshop", "Latin American guide", "trade fair B2B"
   - Riesgo: se siente genérico, contradice el principio "real, no abstracto"
   - Si se usa, **todos** los slides de stock comparten estilo de luz y composición para no romper coherencia

**Decisión pendiente:** ¿hay fotos propias disponibles del programa? Si sí, hago inventario.

---

## 3. Iconografía y sistema simbólico

### Tipos de comprador (Día 1 láminas 35–38 + Día 2 tarjetas de comprador)
- 🔬 **Especialista RT** — lupa o microscopio (búsqueda de evidencia)
- 🌍 **Generalista verde** — globo o globo+hoja (escala + verde)
- ✨ **FIT premium** — estrella o gema (curaduría exclusiva)

Decisión: usar emojis (🔬 🌍 ✨) o íconos custom dibujados. Recomiendo **emojis** — son universales, no requieren producción, se ven bien en pantalla y en tarjetas impresas.

### Veredictos del Speed-feria (Día 2 láminas 48–53)
- 🤝 **LinkedIn / Conexión**
- ✉️ **Email**
- 📅 **Meeting**

Estos ya están en el outline del Día 2. Usarlos consistente y grandes (tamaño 4–5 rem) en las láminas relevantes — son el motivo visual del bloque speed-feria.

### Etiquetas de la galería de indicadores (Día 1 lámina 14)
- 🟢 **Creíble como está**
- 🟡 **Necesita más evidencia**
- 🔴 **Poco claro para comprador europeo**

Tres círculos de color sólido + texto. También se usan como etiquetas físicas pre-impresas para la pared.

### Pictogramas de los 4 artefactos (Día 1 lámina 56)
- 📄 One-pager impreso
- 🔲 Tarjeta con QR
- 💼 Tarjeta de presentación con indicador
- 📖 Caso de cliente impreso

Mismo principio: emojis simples. Si se quiere algo más "premium", se pueden reemplazar por íconos line-style de un set como Phosphor o Lucide.

### Pictogramas del paquete de cierre (Día 2 lámina 59)
- 📘 Guía B2B & B2C impresa
- 📋 Listado preguntas difíciles por nicho
- 📊 Plantilla de Sheets (en email)
- 📇 Lista de empresas europeas por nicho

### Iconos por mercado (Día 1 láminas 36–38 + Día 2 lámina 38)
Banderas en formato emoji: 🇳🇱 🇩🇪 🇬🇧 🇫🇷 🇪🇸 🇩🇰 🇸🇪 🇳🇴

---

## 4. Infografías custom — el contenido visual más exigente

### A. Matriz RTA × Nicho (Día 1 lámina 17)
Ya descrito en `todos-deck-content-plan.md` TODO 3. Visualmente:
- Tabla 16 × 11 + agrupación por 4 temas (líneas separadoras horizontales gruesas)
- Celdas con círculos de color: 🔴 🟡 ⚪
- Header de nichos con ícono pequeño cada uno (lupa, planta, persona, etc.)
- Footer con leyenda
- **Probablemente requiere lámina apaisada** o `bg-navy` con la matriz en blanco/teal encima
- Versión impresa A3 para mesa

### B. Comparativa B2B vs B2C (Día 2 lámina 37)
- Dos columnas grandes lado a lado
- Cada columna: ícono superior + título + 3–4 frases en lista
- Centro: línea divisora con quizás un símbolo de contraste
- Pie: línea de tiempo visual: B2B = meses, B2C = días

### C. Diagrama de rotación de tarjetas (Día 1 lámina 51 + Día 2 lámina 20)
- Vista cenital: 4 mesas en cuadrícula
- Flechas curvas mostrando cómo la tarjeta viaja de mesa a mesa
- Operadores ilustrados como círculos sin nombres (quedan en su mesa)
- Tarjetas ilustradas como rectángulos pequeños que se mueven

### D. Layout de Speed-feria (Día 2 lámina 47)
- Vista cenital: dos filas enfrentadas (operadores arriba, compradores abajo)
- Flechas indicando rotación lateral después del campanazo
- Cronómetro/timer visual de 5 min
- Indicador de "pase 1 → cambio → pase 2"

### E. Los 3 veredictos como cards (Día 2 lámina 48)
- 3 cards grandes en horizontal
- Cada una: emoji grande arriba (~5rem) + título medio + frase textual en cursiva debajo
- Color de borde distinto por veredicto: 🤝 teal · ✉️ navy · 📅 gold (los más comprometedores en color más fuerte)

### F. Timeline de la mecánica del speed-feria (Día 2 lámina 50)
- Línea horizontal con bloques: Pase 1 (25 min · 5 rotaciones) → Cambio (5 min) → Pase 2 (25 min · 5 rotaciones)
- Estilo similar a la barra del `program-arc` pero con tiempo en lugar de fases

### G. Captura/screenshot de la plantilla de Sheets (Día 2 lámina 35)
- Screenshot real de la plantilla diseñada en Google Sheets
- Resaltar las columnas críticas con un highlight sutil
- Si la plantilla todavía no existe, mock-up en HTML/CSS dentro del slide (más esfuerzo, menos auténtico)

### H. QR code con link a plantilla (Día 2 lámina 36)
- QR a tamaño grande (300×300px mínimo)
- Texto: "Escaneá → Archivo > Hacer copia → tenés tu propia plantilla"
- Link en texto también, por si la cámara no funciona

---

## 5. Logos y branding de terceros

### Logos de empresas europeas (Día 1 lámina 39)
8 empresas en una grid. Opciones:
- **Logos reales** — más auténtico, pero requiere revisar términos de uso (logos en uso editorial/pedagógico generalmente OK)
- **Sólo nombres + bandera** — más seguro legalmente, menos visual

Recomiendo: logos reales en grayscale o monocromo (no a todo color) — uso pedagógico, no comercial, contexto formativo. **Verificar con la institución organizadora si hay duda.**

### Logos de TRECC + ICESI + ProColombia (Hero slides)
Ya en uso en los decks online. Reutilizar tal cual desde `sesion1-deck.html`.

### Logos de agencias francesas confirmadas (Día 1 lámina 44)
Mismo criterio que las empresas europeas — grayscale o monocromo si están disponibles.

---

## 6. Inventario consolidado de producción visual

### Lo que ya existe y se reutiliza
- Sistema CSS completo de `sesion1-deck.html` / `sesion2-deck.html`
- Logos TRECC + partners
- Tipografía (Georgia + Arial)
- Paleta de colores
- Iconografía emoji estándar

### Lo que se produce con esfuerzo bajo (texto/CSS)
- Comparativa B2B vs B2C (lámina D2-37) — HTML/CSS puro
- Cards de los 3 veredictos (lámina D2-48) — HTML/CSS puro
- Timeline speed-feria (lámina D2-50) — HTML/CSS puro
- Etiquetas verde/amarillo/rojo (lámina D1-14) — emojis o círculos CSS

### Lo que se produce con esfuerzo medio (diseño custom en herramientas externas)
- Matriz RTA × Nicho (D1-17) — Figma o ilustración · usar en HTML como SVG/PNG
- Diagrama de rotación de tarjetas (D1-51, D2-20) — ilustración custom
- Layout de speed-feria (D2-47) — ilustración custom
- Screenshot de plantilla Sheets (D2-35) — diseñar la plantilla primero, luego screenshot

### Lo que requiere input externo
- **13 fotos de fondo para `block-intro` y hero/closing** — decisión sobre sourcing
- Logos de las 8 empresas europeas — descargar de webs oficiales
- Logos de agencias francesas — pendiente de confirmar cuáles asisten

### Lo que se produce como contenido escrito + diseño
- 6–8 tarjetas de comprador "modo escéptico" — formato A4, diseño consistente, una ilustración o foto pequeña por tarjeta
- Booklet de banco de preguntas — 11 páginas, diseño tipográfico simple

---

## 7. Responsabilidades y plazos

| Componente | Quién produce | Plazo |
|------------|----------------|-------|
| 13 fotos block-intro/hero/closing | Alex (decisión sourcing) + fotógrafo si aplica | 22 de mayo |
| Matriz RTA × Nicho (gráfica) | Alex + diseñador | 22 de mayo |
| Diagramas de rotación + speed-feria layout | Alex / diseñador | 22 de mayo |
| Plantilla Sheets diseñada | Alex | 18–19 de mayo |
| Screenshot plantilla Sheets | Alex (después de tener plantilla) | 20 de mayo |
| Logos empresas europeas | Alex (descarga) | 20 de mayo |
| Tarjetas de comprador (diseño + contenido) | Alex | 21 de mayo |
| Booklet preguntas por nicho | Alex | 21 de mayo |
| Comparativas + cards + timelines (HTML/CSS) | En el momento de construir el HTML deck | 23–24 de mayo |
| Topbar con anchor question + section labels | En el momento de construir el HTML deck | 23–24 de mayo |

---

## 8. Decisiones abiertas que afectan producción visual

1. **Sourcing de fotos:** ¿hay banco propio del programa o se compra/contrata?
2. **Logos de empresas europeas:** ¿usar reales (recomendado) o sólo nombre + bandera (más seguro)?
3. **Estilo de íconos:** emojis (recomendado, sin producción) o íconos custom line-style?
4. **Matriz RTA × Nicho:** ¿incluir dimensión de mercado (3D) o sólo nicho × indicador (2D)? La 2D es más legible.
5. **Diferenciación visual D1 vs D2:** ¿el cambio de teal-dark a navy en el slide-section-label del topbar es suficiente, o querés algo más fuerte (banner, color de acento distinto)?
