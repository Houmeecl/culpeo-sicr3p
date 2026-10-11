# SICR3P/ Journey — Especificación de producto y arquitectura

Versión 0.1 · Octubre 2026 · Estado: arquitectura + prototipo de escenas 0–2

> Convención: todo lo marcado **[SIMULADO]** no ejecuta operaciones reales (KYC, pago, POS, emisión).
> SICR3P/ articula y conecta: no es banco, financiera, aseguradora, adquirente ni procesador de pagos.

---

## 1. Resumen del producto

**SICR3P/ Journey** es un módulo web independiente de inscripción y onboarding con forma de recorrido
guiado por estaciones en un pequeño mundo 3D estilizado (una maqueta digital). El visitante elige
cómo entra a la red —**empresa** (guía: Culpeo, el zorro) o **persona** (guía: la chancha rosa)— y
avanza escena por escena: identidad conversacional, construcción de su negocio, estación POS
demostrativa, red empresarial, desarrollo, fidelización, merchandising, revisión, activación y
resultado.

- **Una sola red, sin niveles.** No existen Basic/Premium/Gold. Las capacidades dependen del tipo de
  cuenta, la validación y los servicios habilitados (`EnabledCapability`).
- **Una cuenta por empresa**, aunque tenga varias marcas, locales o canales.
- **El POS es una estación explicativa**, no el centro: el recorrido continúa si no está disponible.
- **Dos modos:** _Evento_ (datos ficticios, KYC y pago simulados, reinicio rápido, QR para continuar en
  el teléfono) y _Real_ (avance guardado, consentimientos, documentos, envío y consulta de estado).
- **Activación única:** $19.990 CLP — "Incorporación y operación básica de la cuenta". En la primera
  versión el pago es **[SIMULADO]** detrás de una interfaz `PaymentProvider`.

## 2. Arquitectura modular

Cuatro capas con dependencias en un solo sentido (de arriba hacia abajo). Ninguna escena visual
conoce el almacenamiento ni las APIs.

```
┌──────────────────────────────────────────────────────────────┐
│ PRESENTACIÓN                                                 │
│  world/  (3D: React Three Fiber)   ui/ (HUD, guía, entrevista)│
│  fallback 2D (SVG/CSS) cuando no hay WebGL o se pide 2D      │
└───────────────▲──────────────────────────────────────────────┘
                │ estado derivado + acciones (dispatch)
┌───────────────┴──────────────────────────────────────────────┐
│ JOURNEY ENGINE (TypeScript puro, sin React ni DOM)            │
│  steps · reducer · validaciones · progreso · personaje ·      │
│  próximos pasos · estado de solicitud                         │
└───────────────▲──────────────────────────────────────────────┘
                │ puertos (interfaces)
┌───────────────┴──────────────────────────────────────────────┐
│ DATOS / INTEGRACIONES (adaptadores intercambiables)           │
│  JourneyRepository: LocalRepository │ ApiRepository           │
│  KycProvider:       SimulatedKyc    │ (externo, por definir)  │
│  PaymentProvider:   SimulatedPayment│ (externo, por definir)  │
│  PosStation:        SimulatedPos    │ (aliado, por definir)   │
└──────────────────────────────────────────────────────────────┘
```

Principios:

| Requisito             | Cómo se cumple                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Independiente         | Carpeta `src/journey/` sin imports del resto de la app; sólo React, three y R3F.                                                           |
| Modo demo / conectado | `config.mode` + adaptador elegido en `createJourneyServices()`.                                                                            |
| Autónomo o embebido   | Se monta con `<JourneyApp config={…} />`; acepta `onComplete`/`onStatusChange`. Para embeber en otro dominio: ruta propia + `postMessage`. |
| Sin depender del POS  | La estación consulta `PosStation.isAvailable()`; si es `false`, muestra versión explicativa y permite continuar.                           |
| Sin lógica financiera | Pago, KYC y POS sólo existen como **puertos**; las implementaciones de esta versión son simuladas.                                         |

## 3. Mapa completo del recorrido

| #   | Escena                      | Empresa (Culpeo)                                                 | Persona (chancha rosa)                           | Checkpoint                 |
| --- | --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| 0   | Portada                     | ✓                                                                | ✓                                                | `journey_started`          |
| 1   | Elección de camino          | ✓                                                                | ✓                                                | `path_chosen`              |
| 2   | Identidad (entrevista)      | empresa, RUT, representante, actividad, contacto, consentimiento | nombre, correo, teléfono, comuna, consentimiento | `identity_done`            |
| 3   | Construye tu negocio        | entidad, actividad, marcas, locales, canales, sucursales         | se omite (opcional: intereses)                   | `business_done`            |
| 4   | Estación POS **[SIMULADO]** | demo de compra + puntos                                          | demo de compra + puntos (como cliente)           | `pos_seen` (no bloqueante) |
| 5   | Red empresarial             | nodos explorables                                                | vista resumida                                   | `network_seen`             |
| 6   | Desarrollo                  | 4 estaciones                                                     | resumen breve                                    | `development_seen`         |
| 7   | Fidelización                | tarjeta rosa (cuenta empresa)                                    | tarjeta rosa (persona)                           | `loyalty_seen`             |
| 8   | Merchandising               | vitrina                                                          | vitrina                                          | `merch_seen`               |
| 9   | Revisión                    | bloques editables                                                | bloques editables                                | `review_confirmed`         |
| 10  | Activación **[SIMULADO]**   | $19.990 CLP                                                      | $19.990 CLP                                      | `payment_*`                |
| 11  | Resultado                   | activa / en revisión                                             | tarjeta preparada                                | `finished`                 |

Reglas de flujo: se puede retroceder a cualquier escena completada; "Revisión" permite saltar a
editar un bloque y volver; el modo _acompañado_ avanza la cámara con un único botón "Continuar".

## 4. Diagrama de estados (ApplicationStatus)

```
 draft ──► journey_started ──► identity_incomplete ──► kyc_pending ──► kyc_submitted
                                     ▲                                     │
                                     │                                     ▼
                         needs_documents ◄──────────── in_review ◄── payment_received ◄── payment_pending
                               │                        │   │
                               └────────► in_review     │   └──► rejected
                                                        ▼
                                                    approved ──► account_active
```

| Estado                | Etiqueta visible       | Quién lo cambia                     |
| --------------------- | ---------------------- | ----------------------------------- |
| `draft`               | Borrador               | sistema al crear sesión             |
| `journey_started`     | Recorrido iniciado     | engine (escena 0)                   |
| `identity_incomplete` | Identidad incompleta   | engine (faltan campos obligatorios) |
| `kyc_pending`         | Verificación pendiente | engine (identidad completa)         |
| `kyc_submitted`       | Verificación enviada   | KycProvider                         |
| `payment_pending`     | Pago pendiente         | engine (revisión confirmada)        |
| `payment_received`    | Pago recibido          | PaymentProvider                     |
| `in_review`           | En revisión            | backend                             |
| `needs_documents`     | Requiere antecedentes  | backend (con lista de correcciones) |
| `approved`            | Aprobado               | backend                             |
| `rejected`            | Rechazado              | backend (con motivo)                |
| `account_active`      | Cuenta activa          | backend                             |

Persona natural: tras `payment_received` puede pasar directo a `account_active` para fidelización;
capacidades no habilitadas se muestran "Próximamente". La fidelización de la persona nunca queda
bloqueada por la revisión empresarial.

El usuario ve siempre su estado en el HUD (chip de estado) y en el mapa.

## 5. Modelo de datos

Entidades separadas (identificadores `uuid`, fechas ISO-8601). Campos mínimos:

| Entidad               | Campos clave                                                                                          | Relaciones                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `User`                | id, email, phone, createdAt                                                                           | 1–1 PersonProfile; 0–n CompanyProfile (como representante) |
| `PersonProfile`       | userId, fullName, commune, interests[]                                                                | → LoyaltyAccount                                           |
| `CompanyProfile`      | id, legalEntityId, displayName, activityCategory                                                      | → LegalEntity, Brand[], Store[], Channel[]                 |
| `LegalEntity`         | id, taxId (RUT), legalName                                                                            | 1–1 CompanyProfile (**una cuenta por empresa**)            |
| `Representative`      | id, companyId, userId, fullName, role                                                                 |                                                            |
| `Brand`               | id, companyId, name                                                                                   |                                                            |
| `Store`               | id, companyId, brandId?, name, commune, isBranch                                                      |                                                            |
| `Channel`             | id, companyId, kind (`physical`·`web`·`mobile`), url?                                                 |                                                            |
| `JourneySession`      | id, mode (`event`·`real`), path (`company`·`person`), currentStepId, answers{}, startedAt, expiresAt? | → JourneyCheckpoint[]                                      |
| `JourneyCheckpoint`   | id, sessionId, stepId, completedAt                                                                    |                                                            |
| `KycCase`             | id, subjectType, subjectId, status, provider, simulated                                               |                                                            |
| `Consent`             | id, userId, purpose, textVersion, acceptedAt, channel                                                 |                                                            |
| `Document`            | id, ownerType, ownerId, kind, storageRef, status                                                      |                                                            |
| `Subscription`        | id, accountType, amountClp (19990), status                                                            | → PaymentAttempt[]                                         |
| `PaymentAttempt`      | id, subscriptionId, provider, status, simulated, externalRef?                                         |                                                            |
| `LoyaltyAccount`      | id, ownerType (`person`·`company`), ownerId, publicId, points                                         | → LoyaltyTransaction[]                                     |
| `LoyaltyTransaction`  | id, accountId, kind (`earn`·`redeem`·`grant`), points, source, simulated                              |                                                            |
| `Reward`              | id, title, kind, pointsCost?                                                                          |                                                            |
| `MerchandiseItem`     | id, title, acquisition[] (`purchase`·`points`·`action`·`event`·`milestone`)                           |                                                            |
| `PartnerRelationship` | id, fromCompanyId, toCompanyId, kind (`buys_from`·`sells_to`·`collaborates`)                          |                                                            |
| `EnabledCapability`   | id, accountRef, capability, status (`enabled`·`coming_soon`·`pending_validation`)                     |                                                            |
| `ApplicationStatus`   | id, sessionId, status, reason?, corrections[], updatedAt                                              | historial                                                  |

No hay entidad "nivel" ni "tier". Las capacidades son explícitas por cuenta.

## 6. Estructura de componentes

```
<JourneyApp config>                      orquesta engine + servicios + modo
 │   (estado vía useReducer(journeyReducer); servicios inyectados por config)
 ├─ <WorldStage>                         elige 3D o 2D
 │   ├─ <World3D>                        Canvas R3F, luces, cámara guiada
 │   │   ├─ <CameraRig station>          interpola a la estación activa
 │   │   ├─ <Island>  <PathRoad lit>     maqueta + ruta iluminada
 │   │   ├─ <Station*>                   una por escena (POS, red, tienda…)
 │   │   └─ <Culpeo3D> / <Chancha3D>     guías procedurales
 │   └─ <World2D>                        SVG equivalente (fallback / accesibilidad)
 ├─ <Hud>                                avanzar · retroceder · mapa · pausa · accesibilidad · estado
 ├─ <GuideBubble>                        texto del guía = subtítulo
 ├─ <SceneOverlay>                       UI de la escena activa
 │   ├─ <CoverOverlay> <PathChoice> <Interview> … <Review> <Activation> <Result>
 └─ <EventModeBar>                       sólo modo evento: reiniciar, datos ficticios, QR
```

## 7. Diseño visual de cada escena

Dirección: maqueta clara sobre fondo cálido neutro (#F4F1EC), geometría redondeada, materiales
mate (`MeshStandardMaterial`, roughness 0.6–0.9), una luz direccional suave + hemisférica, sombras
suaves. Rosa diferenciador (#FF8FB3 / #FFB3C7), negro #111114, blanco y grises. Texto Inter, mínimo
16 px en móvil. Movimiento lento (transiciones de cámara 1,4–2 s, `easeInOutCubic`).

| Escena          | Composición                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 Portada       | Isla circular flotante con caminos y volúmenes bajos; "sicr3p/" grande al centro (overlay HTML); cámara alta y lejana que hace _dolly_ hacia la isla al comenzar.         |
| 1 Elección      | Dos pedestales en una bifurcación del camino: izquierda bloque/edificio (empresa), derecha corazón/tarjeta (persona). Al elegir, el guía aparece con un salto corto.      |
| 2 Identidad     | Cámara cercana al guía; tarjeta de pregunta única anclada abajo; la ruta de baldosas se ilumina en rosa por cada respuesta.                                               |
| 3 Negocio       | Parcela vacía que se construye: volumen según categoría (toldo = restaurante, vitrina = comercio, etc.), carteles por marca, mini-locales por sucursal, antena web/móvil. |
| 4 POS           | Mostrador con terminal redondeado; productos como fichas grandes; la tarjeta rosa se acerca al terminal; anillo de luz + "+120 puntos" **[SIMULADO]**.                    |
| 5 Red           | Nodos-isla conectados por cintas; el usuario toca un nodo y la cámara se acerca; etiqueta de una línea.                                                                   |
| 6 Desarrollo    | Cuatro mini-plataformas con un objeto icónico y una micro-interacción cada una.                                                                                           |
| 7 Fidelización  | Tarjeta rosa ligeramente inclinada sobre plinto blanco; brillo suave (no metálico).                                                                                       |
| 8 Merchandising | Vitrina de repisas con figuras, llavero, tarjeta física, stickers; etiqueta de forma de obtención.                                                                        |
| 9 Revisión      | Bloques tipo "ficha" sobre la mesa de la maqueta, cada uno con "Editar".                                                                                                  |
| 10 Activación   | Un único plinto con el monto y botón; insignia **[SIMULADO]** en modo evento.                                                                                             |
| 11 Resultado    | La isla completa iluminada; el guía celebra; QR en modo evento.                                                                                                           |

## 8. Wireframes textuales

```
ESCENA 0 — PORTADA                         ESCENA 1 — ELECCIÓN
┌────────────────────────────────┐        ┌────────────────────────────────┐
│ [modo evento]          [♿][⏸] │        │ ●──○──○──○  (ruta)      [♿][⏸] │
│                                │        │   ¿Cómo quieres entrar a       │
│          (isla 3D)             │        │          SICR3P/?              │
│           sicr3p/              │        │ ┌────────────┐ ┌────────────┐  │
│ "Todo comienza con una         │        │ │ 🏢 Soy      │ │ 💗 Soy      │  │
│     conexión."                 │        │ │   empresa   │ │   persona   │  │
│  [ Comenzar recorrido ]        │        │ │ con Culpeo  │ │ con la      │  │
│                                │        │ └────────────┘ └────────────┘  │
└────────────────────────────────┘        │ [← Atrás]                       │
                                          └────────────────────────────────┘
ESCENA 2 — ENTREVISTA
┌────────────────────────────────┐
│ ●━━●━━◉──○──○   Identidad 2/5   │   ← ruta iluminada, no barra
│        (guía 3D)               │
│ ┌────────────────────────────┐ │
│ │ Culpeo: ¿Cuál es el RUT de  │ │   ← burbuja = subtítulo
│ │ tu empresa?                 │ │
│ │ [ 76.123.456-7          ]   │ │
│ │ [← Atrás]     [Continuar →] │ │
│ └────────────────────────────┘ │
│ Estado: Identidad incompleta   │
└────────────────────────────────┘
```

## 9. Contratos de API (modo conectado)

Base: `POST/GET {apiBase}/journey/v1/...` · JSON · autenticación por token de sesión del journey
(`Authorization: Bearer <sessionToken>`) emitido al crear la sesión. Errores:
`{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {"email": "..."} } }`.

| Método | Ruta                         | Cuerpo / respuesta                                                                                           |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| POST   | `/sessions`                  | `{ mode, path?, locale }` → `{ sessionId, sessionToken, status, expiresAt }`                                 |
| GET    | `/sessions/{id}`             | → `JourneySessionDTO` (step, answers, checkpoints, status)                                                   |
| PATCH  | `/sessions/{id}`             | `{ path?, currentStepId?, answers? }` → `JourneySessionDTO` (guardado incremental)                           |
| POST   | `/sessions/{id}/checkpoints` | `{ stepId }` → `{ checkpointId, completedAt }`                                                               |
| POST   | `/sessions/{id}/consents`    | `{ purpose, textVersion, accepted: true }` → `ConsentDTO`                                                    |
| POST   | `/sessions/{id}/documents`   | multipart `{ kind, file }` → `DocumentDTO`                                                                   |
| POST   | `/sessions/{id}/kyc`         | `{}` → `{ kycCaseId, status }` (proveedor por definir)                                                       |
| POST   | `/sessions/{id}/submit`      | `{}` → `{ status: "payment_pending" \| "in_review" }`                                                        |
| POST   | `/sessions/{id}/payments`    | `{ subscription: "activation", amountClp: 19990, returnUrl }` → `{ paymentAttemptId, status, redirectUrl? }` |
| GET    | `/sessions/{id}/status`      | → `{ status, reason?, corrections: [{ field, message }], updatedAt }`                                        |
| POST   | `/sessions/{id}/handoff`     | `{}` → `{ resumeUrl, qrPayload, expiresAt }` (continuar en teléfono)                                         |
| GET    | `/catalog/merchandise`       | → `MerchandiseItemDTO[]`                                                                                     |
| GET    | `/capabilities?accountType=` | → `EnabledCapabilityDTO[]`                                                                                   |

Puertos en el cliente (TypeScript):

```ts
interface JourneyRepository {
  create(input): Promise<Session>;
  load(id): Promise<Session | null>;
  save(session): Promise<void>;
  submit(id): Promise<StatusDTO>;
  status(id): Promise<StatusDTO>;
}
interface PaymentProvider {
  readonly simulated: boolean;
  start(req: { sessionId: string; amountClp: number }): Promise<PaymentResult>;
}
interface KycProvider {
  readonly simulated: boolean;
  submit(sessionId: string): Promise<KycResult>;
}
interface PosStation {
  isAvailable(): Promise<boolean>;
  demoPurchase(p): Promise<PosDemoResult>;
}
```

## 10. Estrategia modo evento / modo real

| Aspecto          | Modo evento                                                                                                                   | Modo real                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Datos            | Identidades ficticias con un toque; sin RUT/teléfono reales obligatorios                                                      | Datos reales validados                                        |
| Persistencia     | Memoria + `sessionStorage`; se borra al reiniciar o tras inactividad (por defecto 90 s en pantalla final, 5 min en recorrido) | `JourneyRepository` remoto; reanudación por enlace            |
| KYC / pago / POS | **[SIMULADO]** con insignia visible                                                                                           | Proveedores externos a definir; hasta entonces "Próximamente" |
| Final            | QR con enlace de continuación (handoff) para el teléfono del visitante; el stand no guarda datos                              | Pantalla de estado + correo                                   |
| Velocidad        | Recorrido completo en 3–4 min; modo acompañado activado por defecto                                                           | Ritmo libre, guardado continuo                                |
| Reinicio         | Botón "Reiniciar" (con confirmación) y atajo de teclado                                                                       | No aplica                                                     |
| Red              | Recursos esenciales empaquetados localmente; funciona sin internet salvo el QR remoto (fallback: QR con resumen local)        | Requiere conexión                                             |

## 11. Plan de implementación por fases

| Fase         | Alcance                                                                                               | Entregable                     |
| ------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| F0 (este PR) | Arquitectura, engine, adaptador local, escenas 0–2 en 3D + 2D, modo evento básico                     | Prototipo navegable `/journey` |
| F1           | Escenas 3–5 (negocio, POS simulado, red) + mapa del recorrido                                         | Demo de evento parcial         |
| F2           | Escenas 6–9 (desarrollo, fidelización, merchandising, revisión editable)                              | Recorrido completo simulado    |
| F3           | Activación simulada, resultado, QR/handoff, autolimpieza del stand, pruebas en dispositivos de evento | **Versión evento**             |
| F4           | `ApiRepository`, consentimientos versionados, documentos, consulta de estado y correcciones           | Modo real (beta)               |
| F5           | Conectar proveedores externos de KYC y pago elegidos por SICR3P/, POS de aliado                       | Onboarding real                |

## 12. Criterios de aceptación

1. La portada carga con contenido visible en < 3 s en 4G y muestra "sicr3p/" y "Todo comienza con una conexión.".
2. "Comenzar recorrido" mueve la cámara de forma suave (o con fundido si se pidió movimiento reducido).
3. Elegir "Soy empresa" muestra a Culpeo; "Soy persona" muestra a la chancha rosa. Ninguna pantalla menciona niveles.
4. La entrevista muestra una sola pregunta por vez, valida en línea (RUT, correo, teléfono) y no avanza sin consentimiento.
5. La ruta se ilumina por cada respuesta; no existe barra de progreso tradicional.
6. Teclado: `Enter` continúa, `Esc`/`Alt+←` retrocede, `Tab` recorre controles con foco visible.
7. Sin WebGL, o con "Modo 2D" activo, el recorrido completo funciona con la ilustración 2D.
8. Con `prefers-reduced-motion` no hay animaciones de cámara ni rebotes.
9. Todo componente simulado muestra una insignia "Simulado".
10. Modo evento: "Reiniciar" borra la sesión del dispositivo; los datos ficticios permiten completar la entrevista en < 30 s.
11. Sin errores de consola; usable a 390×844 sin desplazamiento horizontal.
12. El módulo no importa código de otras partes de la app (verificable con búsqueda de imports).

## 13. Riesgos técnicos

| Riesgo                                     | Mitigación                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Equipos de stand o teléfonos con GPU débil | Geometría procedural ligera, `dpr` limitado a 1,5, sombras simples, detección de WebGL y modo 2D.      |
| Conexión inestable en el evento            | Sin modelos ni texturas remotas; todo procedural; fuentes con _fallback_ del sistema.                  |
| Peso del bundle 3D                         | `three` + R3F (~245 KB gzip) se cargan de forma diferida sólo al mostrar el 3D; el 2D no los requiere. |
| Datos personales en el stand               | Modo evento con datos ficticios, `sessionStorage` y autolimpieza por inactividad.                      |
| Confusión con producto financiero          | Copy revisado: "articula y conecta", tarjeta de fidelización, insignias de simulación.                 |
| Acoplamiento escena ↔ datos                | Engine puro con pruebas unitarias; escenas sólo leen estado derivado.                                  |
| SSR y WebGL                                | El canvas se monta sólo en el cliente.                                                                 |

## 14. Estructura del proyecto

```
src/sicr3p-journey/
├── app/
│   ├── experience/     JourneyApp (orquestación, teclado, eventos), Hud, GuideBubble,
│   │                   PathTrail, Cover, PathChoice
│   ├── onboarding/     Interview (una pregunta por vez)
│   ├── review/         IdentityReview (identidad construida + resultado de verificación)
│   └── completion/     Activación y Resultado (fase F3)
├── modules/
│   ├── journey-engine/ tipos, escenas, reducer y selectores (sin React)
│   ├── identity/       preguntas y validadores (RUT, correo, teléfono)
│   ├── kyc/            puerto KycProvider + declaración de cumplimiento
│   ├── company-profile/ LegalEntity, Brand, Store, Channel (una cuenta por empresa)
│   ├── loyalty/        cuentas, transacciones, recompensas, merchandising
│   ├── subscription/   activación única $19.990 (sin niveles)
│   ├── payment-adapter/ puerto PaymentProvider
│   └── status/         estados de solicitud y transiciones
├── world/
│   ├── scenes/         World3D (R3F), Island, World2D (alternativa), WorldStage, useWebGL
│   ├── characters/     Culpeo y chancha rosa procedurales + Walker (camina por el anillo)
│   ├── stations/       layout del anillo, estaciones y baldosas de avance
│   └── assets/         paleta (sin modelos remotos)
├── adapters/
│   ├── demo/           repositorio local, KYC/pago/POS simulados, identidades ficticias
│   └── production/     repositorio API, klarna/ (payload, función de servidor, KycProvider)
├── contracts/
│   ├── events/         eventos de dominio (journey.*, identity.*, kyc.*, status.*)
│   ├── api/            puertos y DTOs del API
│   └── schemas/        zod: respuestas de entrevista y payload de onboarding Klarna
├── config.ts           elige adaptadores según modo
├── index.ts            API pública
└── journey.css
src/routes/journey.tsx  ruta de demostración (/journey, /journey?modo=real)
```

### Personaje que avanza por los puntos

Cada escena es un punto (estación) del anillo. El guía elegido es el personaje del usuario:
camina de estación en estación (`world/characters/Walker.tsx`) y, durante la entrevista,
avanza una baldosa por cada respuesta hasta llegar a la siguiente estación. La cámara lo
sigue en tercera persona desde el interior del anillo. Las estaciones completadas se
pueden tocar para volver a ellas. En 2D el personaje se desplaza igual sobre el plano.

### Verificación y cumplimiento con Klarna (modo real)

Referencia: [Klarna Network Distribution](https://docs.klarna.com/klarna-network-distribution/).

- **KYB de empresas:** `adapters/production/klarna/` traduce el perfil de empresa al payload
  de _Onboard a merchant_ del Klarna Management API (marca → `store_group`, local → `store`,
  RUT → `legal_registration`, representante → `stakeholders`) y lo envía desde una
  **función de servidor**. Autenticación `Authorization: Basic <API key>`.
- **Cumplimiento:** la entrevista de empresa incluye la declaración de actividad fuera de la
  lista de [negocios prohibidos y restringidos](https://docs.klarna.com/klarna-network-distribution/resources/legal-and-compliance/policies-and-term-of-service/prohibited-and-restricted-businesses/).
- **Datos faltantes:** si el payload no está completo (dirección legal, tipo de entidad, marcas
  y locales) no se llama a Klarna; el resultado `pending_data` lista lo que falta y se
  completa en "Construye tu negocio".
- **Configuración (variables del despliegue, nunca en el navegador):** `KLARNA_API_KEY`,
  `KLARNA_ONBOARD_URL`. Sin ellas el resultado es `not_configured` y el recorrido continúa.
- **Condiciones:** el Management API está pensado para **Acquiring Partners** habilitados por
  Klarna. SICR3P/ no es adquirente: requiere operar junto a un adquirente aliado o con
  credenciales que Klarna otorgue. Los campos internos marcados `VALIDAR` en
  `contracts/schemas/klarna-onboarding.ts` deben confirmarse con la referencia del API.
- **Personas:** su verificación externa aún no está definida (`not_configured`); la
  fidelización no se bloquea.
- **Modo evento:** siempre verificación simulada.

## 15. Prototipo

Disponible en la ruta `/journey`: portada 3D, elección de camino con los dos guías, personaje que
camina por las estaciones, entrevista completa (empresa y persona) con verificación (simulada o
Klarna), modo evento, modo 2D, movimiento reducido y teclado.
Las escenas 3 en adelante aparecen como "Próxima estación" en el mapa.
