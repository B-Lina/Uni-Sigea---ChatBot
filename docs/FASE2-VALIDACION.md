# FASE 2 – Modelo de Datos (CRUD) – Validación

## Resumen de lo construido

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| Modelo Documento | `backend/documental/models.py` | Campos: archivo, fecha_emision, fecha_vencimiento, estado, texto_extraido, fecha_carga |
| Serializador | `backend/documental/serializers.py` | DocumentoSerializer con campos calculados |
| ViewSet CRUD | `backend/documental/views.py` | DocumentoViewSet (list, create, retrieve, update, delete) |
| URLs | `backend/documental/urls.py` | Router DRF: `/api/documentos/` |
| Admin Django | `backend/documental/admin.py` | Interfaz admin para gestión |
| Componente Upload | `frontend/src/components/DocumentoUpload.tsx` | Formulario para subir documentos |
| Componente List | `frontend/src/components/DocumentosList.tsx` | Lista con colores según estado |

## Campos del modelo Documento

- **archivo**: FileField (PDF o imagen)
- **fecha_emision**: DateField (opcional)
- **fecha_vencimiento**: DateField (opcional)
- **estado**: CharField con choices: `verde`, `amarillo`, `rojo` (default: `amarillo`)
- **texto_extraido**: TextField (opcional, para Fase 3 - OCR)
- **fecha_carga**: DateTimeField (auto_now_add)

## Endpoints API disponibles

- `GET /api/documentos/` - Lista todos los documentos
- `POST /api/documentos/` - Crea un nuevo documento (multipart/form-data)
- `GET /api/documentos/{id}/` - Obtiene un documento específico
- `PATCH /api/documentos/{id}/` - Actualiza parcialmente un documento
- `PUT /api/documentos/{id}/` - Actualiza completamente un documento
- `DELETE /api/documentos/{id}/` - Elimina un documento

## Pasos para validar

### 1. Aplicar migraciones

```powershell
cd c:\Users\lball\Desktop\G-Doc\backend
.venv\Scripts\activate  # Si usas venv
python manage.py makemigrations
python manage.py migrate
```

Debe crear la tabla `documental_documento` en la base de datos.

### 2. Reiniciar el servidor Django

```powershell
python manage.py runserver
```

### 3. Probar desde el frontend

1. Abre **http://localhost:5173** (si no está corriendo, ejecuta `npm run dev` en `frontend/`)
2. Debe aparecer el formulario "Subir Documento"
3. **Sube un archivo PDF o imagen** (puedes usar cualquier archivo de prueba)
4. Opcionalmente completa fecha de emisión y/o vencimiento
5. Haz clic en "Subir Documento"
6. Debe aparecer el documento en la lista con estado **🟡 amarillo** (por defecto)

### 4. Probar desde Postman/Thunder Client (opcional)

**Crear documento:**
```
POST http://127.0.0.1:8000/api/documentos/
Content-Type: multipart/form-data

archivo: [seleccionar archivo]
fecha_emision: 2024-01-15 (opcional)
fecha_vencimiento: 2025-12-31 (opcional)
```

**Listar documentos:**
```
GET http://127.0.0.1:8000/api/documentos/
```

**Obtener un documento:**
```
GET http://127.0.0.1:8000/api/documentos/1/
```

**Actualizar estado:**
```
PATCH http://127.0.0.1:8000/api/documentos/1/
Content-Type: application/json

{
  "estado": "verde"
}
```

**Eliminar:**
```
DELETE http://127.0.0.1:8000/api/documentos/1/
```

### 5. Probar desde Django Admin (opcional)

1. Crea un superusuario: `python manage.py createsuperuser`
2. Abre **http://127.0.0.1:8000/admin/**
3. Inicia sesión
4. Ve a "Documentos" → debe aparecer la lista de documentos subidos

## Checklist de validación

- [ ] Migraciones aplicadas sin errores
- [ ] Puedo subir un documento desde el frontend
- [ ] El documento aparece en la lista con el estado correcto (🟡 por defecto)
- [ ] Puedo ver los detalles del documento (nombre, fechas, estado)
- [ ] Puedo eliminar un documento desde el frontend
- [ ] Los endpoints API responden correctamente (probado con Postman o desde frontend)
- [ ] El admin de Django muestra los documentos correctamente

## Confirmación

Cuando todos los items del checklist estén marcados, la **FASE 2 está validada** y se puede continuar con la **FASE 3** (Integración OCR).
