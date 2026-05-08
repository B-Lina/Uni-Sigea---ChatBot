# Guía de Pruebas Postman - API G-Doc

Documentación de endpoints para probar la API Django en fase desarrollo.

---

## 📋 Configuración Base

### Entorno de Desarrollo
- **Backend:** Django en `http://127.0.0.1:8000`
- **Frontend:** React en `http://localhost:5173`
- **Base de Datos:** SQLite (desarrollo)

### Tipos de Contenido
- **Aplicable a todos los endpoints:** `Content-Type: application/json`
- **Para upload de archivos:** `Content-Type: multipart/form-data`

---

## ✅ Health Check

### GET /api/health/

Verifica que el backend responde correctamente.

**URL:**
```
http://127.0.0.1:8000/api/health/
```

**Método:** GET

**Respuesta esperada (200 OK):**
```json
{
    "status": "ok",
    "message": "API G-Doc operativa",
    "version": "2.0"
}
```

---

## 📊 Dashboard - Estadísticas

### GET /api/dashboard/stats/

Endpoint especial que retorna métricas agregadas para el dashboard. **NO ES UN CRUD SIMPLE** - calcula estadísticas en tiempo real.

**URL:**
```
http://127.0.0.1:8000/api/dashboard/stats/
```

**Método:** GET

**Parámetros:** Ninguno

**Respuesta esperada (200 OK):**
```json
{
    "total_documentos": 10,
    "documentos_aprobados": 5,
    "documentos_pendientes": 3,
    "documentos_rechazados": 2,
    "documentos_en_revision": 0,
    "semaforo_verde": 5,
    "semaforo_amarillo": 3,
    "semaforo_rojo": 2,
    "convocatorias_activas": 3,
    "convocatorias_cerradas": 1,
    "total_postulantes": 45,
    "expedientes_total": 10,
    "expedientes_completos": 3,
    "expedientes_incompletos": 4,
    "expedientes_en_proceso": 3,
    "documentos_vencidos": 1,
    "documentos_por_vencer": 2
}
```

**Campos explicados:**
- `total_documentos`: Suma total de documentos en BD
- `documentos_aprobados`: Documentos con estado = "aprobado"
- `documentos_pendientes`: Documentos con estado = "pendiente"
- `documentos_rechazados`: Documentos con estado = "rechazado"
- `documentos_en_revision`: Documentos con estado = "en_revision"
- `semaforo_verde`: Documentos con estado_semaforo = "verde" (válidos)
- `semaforo_amarillo`: Documentos con estado_semaforo = "amarillo" (requieren revisión)
- `semaforo_rojo`: Documentos con estado_semaforo = "rojo" (inválidos)
- `convocatorias_activas`: Convocatorias abiertas hoy
- `convocatorias_cerradas`: Convocatorias cerradas
- `total_postulantes`: Postulantes activos
- `expedientes_total`: Total de expedientes
- `expedientes_completos`: Expedientes estado = "completo"
- `expedientes_incompletos`: Expedientes estado = "incompleto"
- `expedientes_en_proceso`: Expedientes estado = "en_proceso"
- `documentos_vencidos`: Documentos con fecha_vencimiento < hoy
- `documentos_por_vencer`: Documentos con vencimiento en próximos 30 días

---

## 📑 CRUD - Convocatorias

### 1. Listar Convocatorias

**GET /api/convocatorias/**

**URL:**
```
http://127.0.0.1:8000/api/convocatorias/
```

**Parámetros Query (opcionales):**
- `estado=abierta` o `estado=cerrada` - Filtrar por estado
- `search=java` - Buscar por título o descripción
- `ordering=-fecha_inicio` - Ordenar (negativo = descendente)
- `page=1` - Paginación (20 resultados por página)

**Respuesta esperada (200 OK):**
```json
{
    "count": 5,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "titulo": "Docentes Cátedra 2025-I",
            "descripcion": "Convocatoria para vinculación de docentes de cátedra",
            "estado": "abierta",
            "fecha_inicio": "2025-01-15",
            "fecha_fin": "2025-03-15",
            "documentos_requeridos": [
                {
                    "id": 1,
                    "nombre": "Hoja de Vida",
                    "descripcion": "Formato institucional",
                    "obligatorio": true,
                    "convocatoria": 1
                },
                {
                    "id": 2,
                    "nombre": "Cédula de Ciudadanía",
                    "descripcion": "Copia ampliada al 150%",
                    "obligatorio": true,
                    "convocatoria": 1
                }
            ],
            "postulantes_count": 34,
            "is_abierta": true,
            "creado_en": "2025-01-15T10:30:00Z",
            "actualizado_en": "2025-01-15T10:30:00Z"
        }
    ]
}
```

---

### 2. Crear Convocatoria

**POST /api/convocatorias/**

**URL:**
```
http://127.0.0.1:8000/api/convocatorias/
```

**Body JSON:**
```json
{
    "titulo": "Docentes Tiempo Completo 2025",
    "descripcion": "Convocatoria para docentes tiempo completo en el programa de Ingeniería Informática",
    "estado": "abierta",
    "fecha_inicio": "2025-02-01",
    "fecha_fin": "2025-04-30"
}
```

**Respuesta esperada (201 Created):**
```json
{
    "id": 6,
    "titulo": "Docentes Tiempo Completo 2025",
    "descripcion": "Convocatoria para docentes tiempo completo en el programa de Ingeniería Informática",
    "estado": "abierta",
    "fecha_inicio": "2025-02-01",
    "fecha_fin": "2025-04-30",
    "documentos_requeridos": [],
    "postulantes_count": 0,
    "is_abierta": true,
    "creado_en": "2025-03-01T12:45:00Z",
    "actualizado_en": "2025-03-01T12:45:00Z"
}
```

---

### 3. Obtener Detalle de Convocatoria

**GET /api/convocatorias/{id}/**

**URL:**
```
http://127.0.0.1:8000/api/convocatorias/1/
```

**Respuesta esperada (200 OK):**
```json
{
    "id": 1,
    "titulo": "Docentes Cátedra 2025-I",
    "descripcion": "Convocatoria para vinculación de docentes de cátedra",
    "estado": "abierta",
    "fecha_inicio": "2025-01-15",
    "fecha_fin": "2025-03-15",
    "documentos_requeridos": [
        {
            "id": 1,
            "nombre": "Hoja de Vida",
            "descripcion": "Formato institucional",
            "obligatorio": true,
            "convocatoria": 1
        }
    ],
    "postulantes_count": 34,
    "is_abierta": true,
    "creado_en": "2025-01-15T10:30:00Z",
    "actualizado_en": "2025-01-15T10:30:00Z"
}
```

---

### 4. Actualizar Convocatoria

**PUT /api/convocatorias/{id}/** (actualización completa)  
**PATCH /api/convocatorias/{id}/** (actualización parcial)

**URL:**
```
http://127.0.0.1:8000/api/convocatorias/1/
```

**Body JSON (ejemplo con PATCH):**
```json
{
    "estado": "cerrada"
}
```

**Respuesta esperada (200 OK):**
```json
{
    "id": 1,
    "titulo": "Docentes Cátedra 2025-I",
    "descripcion": "Convocatoria para vinculación de docentes de cátedra",
    "estado": "cerrada",
    "fecha_inicio": "2025-01-15",
    "fecha_fin": "2025-03-15",
    "documentos_requeridos": [...],
    "postulantes_count": 34,
    "is_abierta": false,
    "creado_en": "2025-01-15T10:30:00Z",
    "actualizado_en": "2025-03-01T14:20:00Z"
}
```

---

### 5. Eliminar Convocatoria

**DELETE /api/convocatorias/{id}/**

**URL:**
```
http://127.0.0.1:8000/api/convocatorias/1/
```

**Respuesta esperada (204 No Content):** `(sin cuerpo)`

---

## 👥 CRUD - Postulantes

### 1. Listar Postulantes

**GET /api/postulantes/**

**URL:**
```
http://127.0.0.1:8000/api/postulantes/
```

**Parámetros Query:**
- `estado=activo` - Filtrar por estado
- `numero_documento=1234567890` - Filtrar por número de documento
- `search=María` - Buscar por nombres, apellidos, email, etc.

**Respuesta esperada (200 OK):**
```json
{
    "count": 45,
    "next": "http://127.0.0.1:8000/api/postulantes/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "usuario": {
                "id": 2,
                "username": "maria.garcia",
                "first_name": "María",
                "last_name": "García López",
                "email": "maria.garcia@email.com"
            },
            "nombres": "María",
            "apellidos": "García López",
            "tipo_documento": "Cédula de Ciudadanía",
            "numero_documento": "1234567890",
            "email": "maria.garcia@email.com",
            "telefono": "3015551234",
            "direccion": "Calle 10 #20-30, Apto 302",
            "fecha_registro": "2025-02-10T09:15:00Z",
            "estado": "activo"
        }
    ]
}
```

---

### 2. Crear Postulante

**POST /api/postulantes/**

**URL:**
```
http://127.0.0.1:8000/api/postulantes/
```

**Body JSON:**
```json
{
    "nombres": "Juan",
    "apellidos": "López Rodríguez",
    "tipo_documento": "Cédula de Ciudadanía",
    "numero_documento": "9876543210",
    "email": "juan.lopez@email.com",
    "telefono": "3105552345",
    "direccion": "Carrera 15 #45-60",
    "estado": "activo"
}
```

**Respuesta esperada (201 Created):**
```json
{
    "id": 50,
    "usuario": null,
    "nombres": "Juan",
    "apellidos": "López Rodríguez",
    "tipo_documento": "Cédula de Ciudadanía",
    "numero_documento": "9876543210",
    "email": "juan.lopez@email.com",
    "telefono": "3105552345",
    "direccion": "Carrera 15 #45-60",
    "fecha_registro": "2025-03-01T13:00:00Z",
    "estado": "activo"
}
```

---

## 📄 CRUD - Documentos

### 1. Listar Documentos

**GET /api/documentos/**

**URL:**
```
http://127.0.0.1:8000/api/documentos/?estado=aprobado&semaforo=verde
```

**Parámetros Query:**
- `postulante=1` - Filtrar por postulante
- `convocatoria=1` - Filtrar por convocatoria
- `estado=aprobado|pendiente|en_revision|rechazado` - Filtrar por estado
- `semaforo=verde|amarillo|rojo` - Filtrar por semáforo
- `search=hoja` - Buscar por nombre de archivo o postulante
- `ordering=-fecha_carga` - Ordenar (negativo = descendente)

**Respuesta esperada (200 OK):**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "archivo": "/media/documentos/2025/03/01/hoja_vida_garcia.pdf",
            "nombre_archivo": "hoja_vida_garcia.pdf",
            "url_archivo": "http://127.0.0.1:8000/media/documentos/2025/03/01/hoja_vida_garcia.pdf",
            "postulante": 1,
            "postulante_nombre": "María",
            "convocatoria": 1,
            "convocatoria_titulo": "Docentes Cátedra 2025-I",
            "documento_requerido": 1,
            "documento_requerido_nombre": "Hoja de Vida",
            "fecha_emision": "2024-06-15",
            "fecha_vencimiento": "2026-06-15",
            "estado": "aprobado",
            "estado_semaforo": "verde",
            "texto_extraido": "Hoja de Vida de María García López...",
            "confianza_ocr": 95,
            "observaciones": null,
            "tipo_validacion": "automatica",
            "numero_documento_usuario": "1234567890",
            "fecha_carga": "2025-02-10T09:20:00Z"
        }
    ]
}
```

---

### 2. Crear (Upload) Documento

**POST /api/documentos/**

**URL:**
```
http://127.0.0.1:8000/api/documentos/
```

**Body:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `archivo` | File | Sí | PDF o imagen (PDF, PNG, JPG, JPEG, TIFF, BMP) |
| `postulante` | Integer | Sí | ID del postulante |
| `convocatoria` | Integer | Sí | ID de la convocatoria |
| `documento_requerido` | Integer | No | ID del tipo de documento |
| `fecha_emision` | Date | No | Formato: YYYY-MM-DD |
| `fecha_vencimiento` | Date | No | Formato: YYYY-MM-DD |
| `numero_documento_usuario` | String | No | Ej: DNI, pasaporte |

**En Postman:**
1. Seleccionar "POST"
2. Ir a pestaña "Body"
3. Seleccionar "form-data"
4. Agregar campos:
   - `archivo` (type: **File**) - Seleccionar archivo PDF/imagen
   - `postulante` (type: **Text**) - Valor: `1`
   - `convocatoria` (type: **Text**) - Valor: `1`
   - `fecha_vencimiento` (type: **Text**) - Valor: `2025-06-01`

**Respuesta esperada (201 Created):**
```json
{
    "id": 101,
    "archivo": "/media/documentos/2025/03/01/documento_nuevo.pdf",
    "nombre_archivo": "documento_nuevo.pdf",
    "url_archivo": "http://127.0.0.1:8000/media/documentos/2025/03/01/documento_nuevo.pdf",
    "postulante": 1,
    "postulante_nombre": "María",
    "convocatoria": 1,
    "convocatoria_titulo": "Docentes Cátedra 2025-I",
    "documento_requerido": null,
    "documento_requerido_nombre": null,
    "fecha_emision": null,
    "fecha_vencimiento": "2025-06-01",
    "estado": "pendiente",
    "estado_semaforo": "amarillo",
    "texto_extraido": "Texto extraído por OCR...",
    "confianza_ocr": 78,
    "observaciones": null,
    "tipo_validacion": "automatica",
    "numero_documento_usuario": null,
    "fecha_carga": "2025-03-01T14:35:00Z"
}
```

**Nota:** El sistema automáticamente:
- Ejecuta OCR sobre el archivo (FASE 3)
- Calcula el estado del semáforo (FASE 4)
- Llena `texto_extraido`, `confianza_ocr` y `estado_semaforo`

---

### 3. Obtener Detalle de Documento

**GET /api/documentos/{id}/**

**URL:**
```
http://127.0.0.1:8000/api/documentos/1/
```

---

### 4. Actualizar Documento

**PATCH /api/documentos/{id}/**

**URL:**
```
http://127.0.0.1:8000/api/documentos/1/
```

**Body JSON (ejemplo):**
```json
{
    "estado": "aprobado",
    "observaciones": "Documento verificado correctamente"
}
```

**Respuesta esperada (200 OK):** Documento actualizado

---

### 5. Eliminar Documento

**DELETE /api/documentos/{id}/**

**URL:**
```
http://127.0.0.1:8000/api/documentos/1/
```

**Respuesta esperada (204 No Content)**

---

## 📦 CRUD - Expedientes

### 1. Listar Expedientes

**GET /api/expedientes/**

**URL:**
```
http://127.0.0.1:8000/api/expedientes/
```

**Parámetros Query:**
- `postulante=1` - Filtrar por postulante
- `convocatoria=1` - Filtrar por convocatoria
- `estado=completo|incompleto|en_proceso` - Filtrar por estado
- `search=García` - Buscar por postulante o convocatoria

**Respuesta esperada (200 OK):**
```json
{
    "count": 10,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "postulante": 1,
            "postulante_nombre": "María",
            "postulante_apellidos": "García López",
            "postulante_numero_documento": "1234567890",
            "postulante_email": "maria.garcia@email.com",
            "convocatoria": 1,
            "convocatoria_titulo": "Docentes Cátedra 2025-I",
            "estado": "completo",
            "documentos_count": 6,
            "documentos_aprobados_count": 6,
            "progreso_porcentaje": 100.0,
            "creado_en": "2025-02-10T09:15:00Z",
            "actualizado_en": "2025-02-15T10:30:00Z"
        }
    ]
}
```

**Campos explicados:**
- `documentos_count`: Total de documentos en este expediente
- `documentos_aprobados_count`: Cuántos están aprobados
- `progreso_porcentaje`: (aprobados/total) * 100

---

### 2. Crear Expediente

**POST /api/expedientes/**

**URL:**
```
http://127.0.0.1:8000/api/expedientes/
```

**Body JSON:**
```json
{
    "postulante": 1,
    "convocatoria": 1,
    "estado": "en_proceso"
}
```

**Respuesta esperada (201 Created)**

---

## 👤 CRUD - Usuarios - Perfil

### 1. Listar Perfiles de Usuario

**GET /api/usuarios-perfil/**

**URL:**
```
http://127.0.0.1:8000/api/usuarios-perfil/
```

**Parámetros Query:**
- `rol=admin|revisor|postulante` - Filtrar por rol
- `search=carlos` - Buscar por username o nombre

**Respuesta esperada (200 OK):**
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "usuario": {
                "id": 1,
                "username": "carlos",
                "first_name": "Carlos",
                "last_name": "Rodríguez",
                "email": "carlos@udec.edu.co"
            },
            "rol": "admin",
            "creado_en": "2025-01-15T10:00:00Z",
            "actualizado_en": "2025-01-15T10:00:00Z"
        }
    ]
}
```

---

### 2. Crear Perfil de Usuario

**POST /api/usuarios-perfil/**

**URL:**
```
http://127.0.0.1:8000/api/usuarios-perfil/
```

**Body JSON:**
```json
{
    "usuario": 1,
    "rol": "revisor"
}
```

**Respuesta esperada (201 Created)**

---

## 🔧 Troubleshooting

### CORS Origin Not Allowed

**Problema:** Error `Access to XMLHttpRequest blocked by CORS policy`

**Solución:**
1. Verificar que el frontend corre en puerto **5173** (Vite) o **3000** (CRA)
2. Verificar que `settings.py` tiene `CORS_ALLOWED_ORIGINS` configurado
3. El backend debe tener `corsheaders` en `INSTALLED_APPS`

### Campo Requerido Faltante

**Respuesta esperada (400 Bad Request):**
```json
{
    "error_field": ["Este campo es requerido."]
}
```

Verificar que todos los campos requeridos estén presentes en el body.

### Documento No Encontrado

**Respuesta esperada (404 Not Found):**
```json
{
    "detail": "No encontrado."
}
```

Verificar que el ID existe en la base de datos.

---

## 📝 Ejemplo: Workflow Completo

Simulación de un flujo completo:

1. **Crear Convocatoria**
   ```
   POST /api/convocatorias/
   {
       "titulo": "Test Convocatoria",
       "descripcion": "Para pruebas",
       "estado": "abierta",
       "fecha_inicio": "2025-03-01",
       "fecha_fin": "2025-06-01"
   }
   ```
   → Retorna: `id: 10`

2. **Crear Postulante**
   ```
   POST /api/postulantes/
   {
       "nombres": "Test",
       "apellidos": "Usuario",
       "numero_documento": "999888777",
       "email": "test@email.com",
       "telefono": "3001234567",
       "direccion": "Calle Test",
       "estado": "activo"
   }
   ```
   → Retorna: `id: 50`

3. **Crear Expediente**
   ```
   POST /api/expedientes/
   {
       "postulante": 50,
       "convocatoria": 10,
       "estado": "en_proceso"
   }
   ```
   → Retorna: `id: 15`

4. **Subir Documento**
   ```
   POST /api/documentos/
   Form-data:
   - archivo: [seleccionar archivo PDF]
   - postulante: 50
   - convocatoria: 10
   - fecha_vencimiento: 2025-12-31
   ```
   → Retorna documento con OCR y semáforo calculados

5. **Verificar Dashboard**
   ```
   GET /api/dashboard/stats/
   ```
   → Retorna métricas actualizadas

---

## 📞 Soporte

Para más detalles sobre cada modelo, revisar:
- [backend/documental/models.py](../backend/documental/models.py)
- [backend/documental/serializers.py](../backend/documental/serializers.py)
- [backend/documental/views.py](../backend/documental/views.py)

Para iniciar el servidor:
```bash
cd backend
python manage.py runserver
```
