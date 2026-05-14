# UNI SIGEA - Chatbot Documental

UNI SIGEA es una aplicacion web para la gestion documental de procesos de vinculacion. Permite administrar convocatorias, postulantes, expedientes y documentos requeridos, con apoyo de validaciones, semaforo documental y un chatbot para orientar al postulante.

El foco principal de esta version es el **chatbot documental bilingue**, disponible en el portal del postulante para responder preguntas en espanol e ingles sobre documentos, validaciones y carga de archivos.

## Que Hace El Chatbot

El chatbot ayuda al postulante con dudas relacionadas exclusivamente con el proceso documental de vinculacion.

Puede responder sobre:

- Cedula o documento de identidad.
- Hoja de vida.
- Certificados laborales y academicos.
- RUT.
- Antecedentes judiciales, fiscales y disciplinarios.
- Tratamiento de datos personales.
- SG-SST.
- REDAM.
- Medidas correctivas.
- Carga, revision, aprobacion o rechazo de documentos.
- Enlaces oficiales para obtener documentos.

El usuario puede seleccionar el idioma desde la interfaz con los botones:

```txt
ES | EN
```

El idioma elegido se envia al backend para que las respuestas sean coherentes en espanol o ingles.

## Arquitectura General

El proyecto esta organizado como un monorepositorio:

```txt
UNI-SIGEA/
+-- frontend/   React + TypeScript + Vite + TailwindCSS
+-- backend/    Django + Django REST Framework
+-- docs/       Guias de validacion y documentacion tecnica
+-- README.md
```

### Frontend

El frontend es una SPA construida con React, TypeScript y Vite.

Directorios principales:

- `frontend/src/pages/`: vistas completas de la aplicacion.
- `frontend/src/components/`: componentes reutilizables, layouts y chatbot.
- `frontend/src/services/`: servicios para consumir la API del backend.
- `frontend/src/hooks/`: hooks personalizados.
- `frontend/src/contexts/`: estado global, principalmente autenticacion.
- `frontend/src/lib/api.ts`: cliente HTTP central.

Archivos clave del chatbot:

```txt
frontend/src/components/ChatBotDocumental.tsx
frontend/src/services/chatbotService.ts
```

### Backend

El backend es una API REST con Django y Django REST Framework.

Directorios principales:

- `backend/config/`: configuracion global del proyecto Django.
- `backend/accounts/`: autenticacion, registro, sesion y contrasenas.
- `backend/documental/`: modulo principal de negocio documental.
- `backend/documental/services/`: servicios internos como OCR, semaforo y chatbot.
- `backend/media/`: archivos subidos por los usuarios.

Archivos clave del chatbot:

```txt
backend/documental/views.py
backend/documental/services/gemini_service.py
```

## Flujo De Funcionamiento Del Chatbot

```txt
Usuario postulante
   |
Abre el boton flotante del chatbot
   |
Selecciona idioma: ES o EN
   |
Escribe una pregunta documental
   |
Frontend envia message + lang al backend
   |
Backend valida usuario, rol y mensaje
   |
Servicio documental procesa la consulta
   |
Si aplica, consulta Gemini
   |
Backend devuelve answer
   |
Frontend muestra la respuesta en el chat
```

Ejemplo de solicitud en espanol:

```json
{
  "message": "Donde descargo el certificado de policia?",
  "lang": "es"
}
```

Ejemplo de solicitud en ingles:

```json
{
  "message": "Where can I download the police certificate?",
  "lang": "en"
}
```

Ejemplo de respuesta:

```json
{
  "answer": "Puedes obtener Certificado Policia Nacional en este enlace: https://antecedentes.policia.gov.co:7005/WebJudicial/. Debe validar numero de cedula y fecha reciente."
}
```

## Comunicacion Frontend / Backend

La comunicacion se realiza mediante API REST sobre HTTP.

```txt
React Frontend
   |
apiClient
   | Authorization: Bearer <token>
Django REST Framework
   |
Views / ViewSets
   |
Serializers / Services / Models
   |
Base de datos y archivos
```

El cliente HTTP central esta en:

```txt
frontend/src/lib/api.ts
```

Este cliente:

- Usa `VITE_API_BASE_URL` como URL base.
- Si no existe esa variable, usa `/api`.
- Agrega automaticamente el token JWT desde `localStorage`.
- Envia JSON para operaciones normales.
- Envia `multipart/form-data` para carga de archivos.

El servicio del chatbot llama:

```ts
chatbotService.ask(message, lang)
```

Internamente ejecuta:

```ts
apiClient.post("/chatbot/", { message, lang })
```

La URL final es:

```txt
POST /api/chatbot/
```

## Seguridad Del Chatbot

El chatbot no es publico. Para usarlo, el backend valida que:

- El usuario este autenticado.
- El usuario tenga perfil documental.
- El rol sea `postulante`.
- El mensaje sea texto valido.
- El mensaje no supere 500 caracteres.
- El idioma sea `es` o `en`.

Si alguna condicion no se cumple, el backend devuelve un error controlado.

## Consumo De IA

El frontend no consume Gemini directamente. La integracion con IA vive en el backend para proteger la API key y controlar el prompt.

```txt
Frontend React
   |
POST /api/chatbot/
   |
Backend Django
   |
gemini_service.py
   |
Google Gemini API
   |
Respuesta al backend
   |
Respuesta al frontend
```

Variables de entorno usadas por el servicio:

```txt
GEMINI_API_KEY
GEMINI_MODEL
```

Si `GEMINI_MODEL` no esta definido, se usa:

```txt
gemini-2.5-flash
```

El backend construye un prompt controlado que indica al modelo:

- Responder solo sobre documentos del proceso de vinculacion.
- Usar el catalogo documental permitido.
- Responder en el idioma seleccionado.
- Mantener respuestas breves.
- Incluir enlaces cuando el usuario pregunte donde obtener documentos.
- Rechazar preguntas fuera del alcance documental.

## Fallback Local

El chatbot puede responder sin depender totalmente de Gemini.

Antes de llamar al modelo, el backend revisa si puede responder con su catalogo local. Esto se usa especialmente para preguntas sobre enlaces o reglas conocidas.

Tambien usa respuesta local si:

- No existe `GEMINI_API_KEY`.
- Gemini no responde.
- La respuesta de Gemini no tiene el formato esperado.

Esto permite que preguntas frecuentes sigan funcionando, por ejemplo:

```txt
Donde descargo antecedentes judiciales?
```

```txt
Where can I download the police certificate?
```

## Endpoints Principales

Autenticacion:

```txt
POST /api/auth/login/
POST /api/auth/refresh/
POST /api/auth/register/
GET  /api/auth/me/
POST /api/auth/change-password/
POST /api/auth/forgot-password/
POST /api/auth/reset-password/
```

Modulo documental:

```txt
GET/POST/PATCH/DELETE /api/postulantes/
GET/POST/PATCH/DELETE /api/convocatorias/
GET/POST/PATCH/DELETE /api/documentos-requeridos/
GET/POST/PATCH/DELETE /api/documentos/
GET/POST/PATCH/DELETE /api/usuarios-perfil/
GET/POST/PATCH/DELETE /api/expedientes/
GET                 /api/dashboard/stats/
GET                 /api/health/
POST                /api/chatbot/
```

## Modelos Principales

El dominio documental se apoya en:

- `UsuarioPerfil`: rol documental del usuario (`admin`, `revisor`, `postulante`).
- `Postulante`: informacion personal del candidato.
- `Convocatoria`: proceso de vinculacion.
- `DocumentoRequerido`: documento solicitado en una convocatoria.
- `Documento`: archivo cargado, estado, OCR, semaforo y observaciones.
- `Expediente`: relacion entre postulante, convocatoria y documentos.

## Variables De Entorno

Backend:

```txt
DJANGO_SECRET_KEY
DJANGO_DEBUG
ALLOWED_HOSTS
GDOC_DB_ENGINE
GDOC_DB_NAME
GDOC_DB_USER
GDOC_DB_PASSWORD
GDOC_DB_HOST
GDOC_DB_PORT
GEMINI_API_KEY
GEMINI_MODEL
```

Frontend:

```txt
VITE_API_BASE_URL
```

## Ejecucion En Desarrollo

Backend:

```bash
cd backend
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm run dev
```

## Validaciones Recomendadas

Frontend:

```bash
cd frontend
npm exec tsc -- -p tsconfig.app.json --noEmit
```

Backend:

```bash
backend\.venv\Scripts\python.exe backend\manage.py check
```

## Resumen

UNI SIGEA es una aplicacion React + Django REST para gestion documental. El chatbot documental es una pieza central del portal del postulante: recibe preguntas en espanol o ingles, valida que pertenezcan al dominio documental, responde con informacion y enlaces utiles, y puede apoyarse en Gemini sin exponer claves ni logica sensible en el frontend.
