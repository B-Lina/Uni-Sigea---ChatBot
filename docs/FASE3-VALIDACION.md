# FASE 3 – Integración OCR – Validación

## Qué se construyó

- **Servicio OCR** (`backend/documental/services/ocr_service.py`): extrae texto de imágenes y PDFs con Tesseract.
- **Integración en la subida**: al crear un documento (POST `/api/documentos/`), se ejecuta OCR sobre el archivo y se guarda el resultado en `texto_extraido`.
- **Dependencias**: `pytesseract`, `PyMuPDF` (para convertir PDF a imágenes).
- **Configuración opcional**: variable de entorno `TESSERACT_CMD` (o en settings) para la ruta de Tesseract en Windows.

## Requisito: Tesseract instalado

El OCR usa **Tesseract**. Sin Tesseract instalado, la subida sigue funcionando pero `texto_extraido` quedará vacío.

### Windows

1. Descarga el instalador: https://github.com/UB-Mannheim/tesseract/wiki
2. Instala (por ejemplo en `C:\Program Files\Tesseract-OCR\`).
3. Opcional: añade al PATH o define la ruta en `backend/.env`:
   ```env
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

### Linux (ej. Ubuntu/Debian)

```bash
sudo apt install tesseract-ocr tesseract-ocr-spa
```

### macOS

```bash
brew install tesseract tesseract-lang
```

## Cómo probar

1. **Instalar dependencias Python:**
   ```powershell
   cd backend
   pip install -r requirements.txt
   ```

2. **Reiniciar el servidor Django.**

3. **Subir un documento con texto:**
   - Desde el frontend: sube una imagen (PNG/JPG) o un PDF que contenga texto.
   - O con Postman: POST `/api/documentos/` con `archivo` en multipart.

4. **Comprobar que hay texto extraído:**
   - En la lista del frontend debe aparecer un bloque "Texto OCR:" con el contenido extraído (o al menos un fragmento).
   - O GET `/api/documentos/{id}/` y revisar el campo `texto_extraido`.

## Si no hay texto extraído

- Verifica que Tesseract esté instalado: en terminal `tesseract --version` (o usando la ruta de `TESSERACT_CMD`).
- En Windows, si no está en el PATH, configura `TESSERACT_CMD` en `backend/.env`.
- Revisa logs del servidor Django por avisos del tipo "OCR falló" o "pytesseract no instalado".
- Prueba con una imagen nítida que contenga texto en español o inglés.

## Confirmación

- [ ] Subida de documento sigue funcionando.
- [ ] Tras subir una imagen/PDF con texto, el documento tiene `texto_extraido` no vacío.
- [ ] En el frontend se muestra el texto OCR en la lista (o en el detalle).

Cuando eso se cumpla, la FASE 3 está validada y se puede pasar a la FASE 4 (semáforo inteligente).
