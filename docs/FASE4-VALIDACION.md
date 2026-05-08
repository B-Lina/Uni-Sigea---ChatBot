# FASE 4 – Semáforo Inteligente – Validación

## Qué se construyó

- **Servicio semáforo** (`backend/documental/services/semaforo_service.py`): calcula el estado según reglas de negocio.
- **Integración automática**: al crear o actualizar un documento, se calcula y guarda el estado automáticamente.
- **Reglas implementadas**:
  1. 🔴 **ROJO**: Documento vencido (`fecha_vencimiento < hoy`)
  2. 🟡 **AMARILLO**: Falta texto legible (`texto_extraido` vacío o < 10 caracteres)
  3. 🟢 **VERDE**: No vencido y con texto legible

## Reglas del semáforo (MVP)

### Prioridad de evaluación

Las reglas se evalúan en orden de prioridad:

1. **Primero**: ¿Está vencido?
   - Si `fecha_vencimiento` existe y es anterior a hoy → 🔴 **ROJO**
   - Si no está vencido o no tiene fecha de vencimiento → continúa

2. **Segundo**: ¿Tiene texto legible?
   - Si `texto_extraido` está vacío o tiene menos de 10 caracteres → 🟡 **AMARILLO**
   - Si tiene texto suficiente → continúa

3. **Tercero**: Todo correcto
   - No vencido + tiene texto legible → 🟢 **VERDE**

## Cómo probar

### Prueba 1: Documento vencido → 🔴 ROJO

1. Sube un documento desde el frontend.
2. En la lista, haz clic en el documento o usa `PATCH /api/documentos/{id}/`:
   ```json
   {
     "fecha_vencimiento": "2020-01-01"
   }
   ```
3. **Resultado esperado**: El documento debe cambiar a estado 🔴 **ROJO**.

### Prueba 2: Documento sin texto → 🟡 AMARILLO

1. Sube una imagen sin texto (ej. una foto de paisaje) o un PDF escaneado sin texto reconocible.
2. **Resultado esperado**: El documento debe quedar en estado 🟡 **AMARILLO** (por defecto, y se mantiene porque no hay texto).

### Prueba 3: Documento válido → 🟢 VERDE

1. Sube un documento con texto legible (imagen o PDF con texto).
2. Asegúrate de que tiene `fecha_vencimiento` futura o no tiene fecha de vencimiento.
3. **Resultado esperado**: El documento debe quedar en estado 🟢 **VERDE**.

### Prueba 4: Actualización automática

1. Crea un documento con fecha de vencimiento futura y texto → debe ser 🟢 **VERDE**.
2. Actualiza la fecha de vencimiento a una fecha pasada:
   ```json
   PATCH /api/documentos/{id}/
   {
     "fecha_vencimiento": "2020-01-01"
   }
   ```
3. **Resultado esperado**: El estado debe cambiar automáticamente a 🔴 **ROJO**.

## Ejemplos de casos de prueba

| Fecha vencimiento | Texto extraído | Estado esperado |
|-------------------|----------------|-----------------|
| `2020-01-01` (pasada) | Cualquiera | 🔴 ROJO |
| `2025-12-31` (futura) | Vacío o < 10 chars | 🟡 AMARILLO |
| `2025-12-31` (futura) | "Este es un documento válido con texto suficiente" | 🟢 VERDE |
| `null` (sin fecha) | Vacío o < 10 chars | 🟡 AMARILLO |
| `null` (sin fecha) | "Texto legible con más de 10 caracteres" | 🟢 VERDE |

## Confirmación

- [ ] Documento vencido se marca como 🔴 ROJO automáticamente.
- [ ] Documento sin texto legible se marca como 🟡 AMARILLO automáticamente.
- [ ] Documento válido (no vencido + con texto) se marca como 🟢 VERDE automáticamente.
- [ ] Al actualizar `fecha_vencimiento`, el estado se recalcula automáticamente.
- [ ] El estado se muestra correctamente en el frontend con los colores correspondientes.

Cuando todos los items estén marcados, la **FASE 4 está validada** y se puede continuar con la **FASE 5** (visualización mejorada en React).

## Notas técnicas

- El cálculo del estado se ejecuta en `perform_create` y `perform_update` del `DocumentoViewSet`.
- La lógica está en `semaforo_service.py` para mantener separación de responsabilidades.
- El método `recalcular_estado()` en el modelo permite recalcular manualmente si es necesario.
