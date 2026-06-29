# Herramienta: Quiz de Nicho Responsable
## Brief de desarrollo · Lo Responsable Vende · TRECC
*Borrador: 2026-04-24 · Para construir después de confirmar la estructura de sesiones*

---

## Propósito

Ayudar a operadores turísticos colombianos a identificar su nicho principal en el mercado europeo — y el ángulo responsable que lo diferencia — a través de 7–8 preguntas. La herramienta produce una combinación de **nicho base + modificador responsable** que el participante puede usar como punto de partida para su propuesta de valor.

**Ejemplo de output:**
> 🌿 Tu nicho principal: **Turismo de Aventura de Base Comunitaria**
> Tu nicho secundario: **Turismo de Naturaleza con Enfoque de Conservación**
> → Revisa la guía CBI para tu nicho: [Adventure Tourism · cbi.eu](#)

---

## Usuarios

- Operadores de tours y guías
- Hoteles, lodges, alojamientos
- Restaurantes y experiencias gastronómicas
- Agencias y DMCs receptivos

---

## Nicho base (fuente: CBI)

Los 27 niches del listado CBI están disponibles como outputs. Algunos solo aplican a ciertos tipos de negocio:

| Nicho | Tour op | Hotel | Restaurante |
|-------|---------|-------|-------------|
| Adventure Tourism | ✓ | ✓ (base camp) | — |
| Accessible Tourism | ✓ | ✓ | ✓ |
| Agritourism | ✓ | ✓ | ✓ |
| Birdwatching Tourism | ✓ | — | — |
| Community-Based Tourism | ✓ | ✓ | ✓ |
| Cruise Tourism | — | — | — |
| Cultural Tourism | ✓ | ✓ | ✓ |
| Cycling Tourism | ✓ | — | — |
| Dive Tourism | ✓ | — | — |
| Ecotourism | ✓ | ✓ | — |
| Fishing Tourism | ✓ | — | — |
| Food Tourism | ✓ | ✓ | ✓ |
| Gap Year Tourism | ✓ | ✓ | — |
| Honeymoon Tourism | ✓ | ✓ | — |
| Luxury Tourism | ✓ | ✓ | ✓ |
| MICE | — | ✓ | — |
| Nature Tourism | ✓ | ✓ | — |
| Religious Tourism | ✓ | — | — |
| Self-Drive Tourism | — | — | — |
| Sport Tourism | ✓ | — | — |
| Sun and Beach Tourism | ✓ | ✓ | — |
| Urban Experiences | ✓ | ✓ | ✓ |
| Volunteer & Educational Tourism | ✓ | ✓ | — |
| Walking Tourism | ✓ | — | — |
| Water Sports Tourism | ✓ | — | — |
| Wellness Tourism | ✓ | ✓ | ✓ |
| Wildlife Tourism | ✓ | — | — |

---

## Modificadores responsables (capa 2)

Derivados de las categorías BE-RTA:

| Modificador | Descripción | BE-RTA origen |
|-------------|-------------|---------------|
| Community-Led | La comunidad local diseña, guía o co-gestiona | Involvement of Local Communities |
| Locally-Rooted | La economía local recibe la mayoría del gasto | Local Economic Footprint |
| Conservation-Focused | La experiencia protege o regenera el entorno | Cultural & Environmental Preservation |
| Culturally Immersive | El patrimonio cultural es el core del producto | Cultural & Environmental Preservation |
| High-Impact | El viajero sale transformado, no solo satisfecho | Satisfaction |
| Community-Owned | La operación es propiedad parcial o total de la comunidad | Involvement of Local Communities |

El output muestra el modificador más relevante según las respuestas, combinado con el nicho base.

---

## Las preguntas (7 total)

### Q1 — Tipo de negocio *(filtra nicho options disponibles)*
**Selecciona uno:**
- Operador de tours / guía
- Hotel, lodge o alojamiento
- Restaurante o experiencia gastronómica
- Agencia receptiva / DMC
- Otro

### Q2 — Entorno principal
**¿Dónde se desarrolla tu experiencia?** *(selecciona hasta 2)*
- Selva / bosque / naturaleza tropical
- Montaña / páramo / volcán
- Costa / océano / ríos
- Ciudad / barrio / patrimonio urbano
- Campo / finca / zona rural
- Múltiples entornos

### Q3 — Actividad principal
**¿Qué hace principalmente tu viajero?** *(selecciona hasta 2)*
- Moverse / explorar activamente (senderismo, ciclismo, buceo, escalada)
- Observar la naturaleza (aves, fauna, flora)
- Comer, beber, descubrir gastronomía
- Aprender sobre cultura, historia o comunidad
- Descansar, sanar, practicar bienestar
- Contribuir / aprender haciendo (voluntariado, talleres)

### Q4 — Ritmo
**¿Cómo es el ritmo de tu experiencia?**
- Activa e intensa (el cuerpo trabaja)
- Lenta e inmersiva (el tiempo se estira)
- Basada en un evento o momento específico
- Combinación de ritmos

### Q5 — Comunidad local
**¿Qué papel juegan las comunidades locales en tu producto?**
- Son guías, personal o proveedores clave
- Co-diseñan o co-gestionan la experiencia
- La comunidad ES el producto (turismo comunitario)
- No es un elemento central actualmente

### Q6 — Tu activo responsable más fuerte
**¿Qué es lo más genuino de tu operación?** *(selecciona uno)*
- Nuestra relación con el entorno natural (conservación, bajo impacto)
- Nuestra conexión con la cultura y el patrimonio local
- El impacto económico real que generamos en la comunidad
- La transformación genuina que vive el viajero
- Todavía lo estoy definiendo

### Q7 — Nivel de documentación
**¿Cómo están documentadas tus prácticas responsables?**
- Las tengo pero no están escritas formalmente
- Algunas están documentadas (procedimientos, políticas internas)
- Tengo certificación del MinCIT u otra entidad colombiana
- Tengo o estoy en proceso de certificación internacional (TourCert, Travelife, etc.)

---

## Lógica de scoring (borrador)

Cada respuesta suma puntos a uno o más niches y a uno o más modificadores. El output muestra:
- **Nicho principal** (el de mayor puntaje disponible para el tipo de negocio)
- **Nicho secundario** (el segundo mayor)
- **Modificador responsable** (el de mayor puntaje en capa 2)
- **Frase de posicionamiento** combinada
- **Link al CBI page** del nicho principal

Ejemplo de mapeo parcial:
- Q3 "observar la naturaleza" + Q2 "selva" → +3 Birdwatching, +2 Wildlife, +2 Nature, +2 Ecotourism
- Q5 "comunidad ES el producto" → +3 Community-Based, +2 Cultural, modificador: Community-Led o Community-Owned
- Q3 "comer/beber" → +3 Food Tourism, +1 Cultural Tourism
- Q6 "entorno natural/conservación" → modificador: Conservation-Focused
- Q6 "cultura y patrimonio" → modificador: Culturally Immersive
- Q6 "impacto económico" → modificador: Locally-Rooted

*Scoring completo a desarrollar al construir la herramienta.*

---

## Output — formato

```
┌─────────────────────────────────────────────────┐
│  Tu nicho principal                              │
│  🌿 Community-Based Cycling Tourism             │
│                                                  │
│  Tu nicho secundario                            │
│  🏔️ Adventure Tourism with Conservation Focus  │
│                                                  │
│  Tu tarea para la Sesión 2:                     │
│  Lee la guía CBI para tu nicho →               │
│  [cbi.eu/cycling-tourism]                       │
│                                                  │
│  Pregunta para llevar al taller:                │
│  "¿Cómo describes este nicho en una frase       │
│   para un comprador europeo?"                   │
└─────────────────────────────────────────────────┘
```

---

## Diseño / stack

- HTML standalone (mismo sistema visual que sesion1-deck.html)
- Sin backend — lógica de scoring en JavaScript puro
- Compartible como link directo durante la sesión
- Funciona en móvil (participantes pueden completarlo en el teléfono si están en un ordenador compartido)
- Los resultados no se guardan — es una herramienta de reflexión, no un formulario de datos

---

## Uso en sesión

1. Facilitador muestra el walkthrough de una página CBI (ej. Adventure Tourism) — 5 min
2. Facilitador comparte el link de la herramienta en el chat
3. Participantes responden en ~3–4 minutos
4. Cada uno tiene su nicho antes de abrir la Hoja de Mapeo de Nicho
5. El nicho identificado se convierte en el punto de partida del taller

---

## Conexión con el resto del programa

| Momento | Cómo conecta |
|---------|--------------|
| BE-RTA (Bloque 1 sesión 1) | Las categorías BE-RTA son el origen de los modificadores responsables |
| Hoja de Mapeo de Nicho (Sesión 1) | El quiz da el nicho; el taller construye la propuesta de valor sobre ese nicho |
| Tarea CBI (homework) | El quiz sugiere qué página CBI leer |
| Módulo 2 presencial | El nicho + propuesta de valor son el input para construir materiales de venta |

---

*Brief listo para desarrollo · Construir después de confirmar nueva estructura de Sesión 1 y Sesión 2*
