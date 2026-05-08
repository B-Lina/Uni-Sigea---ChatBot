# Instalación de Tesseract en Windows

## Paso 1: Descargar e instalar

1. **Descarga el instalador:**
   - Ve a: https://github.com/UB-Mannheim/tesseract/wiki
   - Descarga la versión más reciente para Windows (ej. `tesseract-ocr-w64-setup-5.x.x.exe`)

2. **Ejecuta el instalador:**
   - **Carpeta de instalación:** Deja la predeterminada: `C:\Program Files\Tesseract-OCR\` (o la que prefieras)
   - **Carpeta del menú de inicio:** Puedes usar cualquier nombre (ej. "Tesseract-OCR" o dejar el predeterminado). **No necesitas usar "Cursor"** - esto es solo para crear accesos directos en el menú de inicio.
   - **Componentes:** Asegúrate de instalar al menos:
     - ✅ Tesseract OCR engine
     - ✅ Spanish language data (para reconocer texto en español)
     - ✅ English language data (para reconocer texto en inglés)
   - Completa la instalación.

## Paso 2: Verificar la instalación

Después de instalar, **cierra y vuelve a abrir** PowerShell/CMD para que se actualice el PATH.

Luego ejecuta:

```powershell
tesseract --version
```

Si funciona, verás algo como:
```
tesseract 5.x.x
 leptonica-1.x.x
  libgif 5.x.x : libjpeg 8d (libjpeg-turbo 2.x.x) : libpng 1.x.x : libtiff 4.x.x : zlib 1.x.x : libwebp 1.x.x
```

Si **NO funciona** (dice "no se reconoce como comando"), sigue con el Paso 3.

## Paso 3: Configurar la ruta

Tienes **dos opciones**:

### Opción A: Añadir al PATH del sistema (recomendado)

1. **Busca "Variables de entorno"** en el menú de inicio de Windows.
2. Haz clic en **"Editar las variables de entorno del sistema"**.
3. En "Variables del sistema", selecciona **"Path"** y haz clic en **"Editar"**.
4. Haz clic en **"Nuevo"** y añade la ruta donde instalaste Tesseract:
   ```
   C:\Program Files\Tesseract-OCR
   ```
   (O la ruta que hayas elegido durante la instalación)
5. Haz clic en **"Aceptar"** en todas las ventanas.
6. **Cierra y vuelve a abrir** PowerShell/CMD.
7. Verifica: `tesseract --version`

### Opción B: Usar variable de entorno TESSERACT_CMD (más rápido, solo para este proyecto)

Si no quieres modificar el PATH del sistema, puedes configurarlo solo para Django:

1. En `backend/.env` (crea el archivo si no existe), añade:
   ```env
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```
   (Ajusta la ruta si instalaste en otra ubicación)

2. Reinicia el servidor Django.

**Ventaja:** No necesitas modificar el PATH del sistema.
**Desventaja:** Solo funciona para este proyecto Django.

## Paso 4: Verificar que funciona con Python

1. **Instala las dependencias Python:**
   ```powershell
   cd backend
   pip install -r requirements.txt
   ```

2. **Prueba desde Python:**
   ```powershell
   python -c "import pytesseract; print(pytesseract.get_tesseract_version())"
   ```

   Si funciona, verás el número de versión de Tesseract.

   Si da error, verifica:
   - Que Tesseract esté en el PATH (Opción A) o que `TESSERACT_CMD` esté en `.env` (Opción B)
   - Que hayas cerrado y vuelto a abrir la terminal después de configurar el PATH

## Paso 5: Probar con el proyecto

1. **Reinicia el servidor Django** (si estaba corriendo):
   ```powershell
   python manage.py runserver
   ```

2. **Sube un documento con texto** desde el frontend (imagen PNG/JPG o PDF).

3. **Verifica** que en la respuesta de la API (`GET /api/documentos/{id}/`) el campo `texto_extraido` tiene contenido.

## Resumen: ¿PATH o TESSERACT_CMD?

- **PATH del sistema (Opción A):** Mejor si quieres usar Tesseract desde cualquier lugar (terminal, otros proyectos, etc.). Requiere reiniciar terminales.
- **TESSERACT_CMD en .env (Opción B):** Más rápido, solo para este proyecto. No requiere reiniciar terminales.

**Recomendación:** Si es la primera vez que instalas Tesseract, usa **Opción A (PATH)**. Si solo lo necesitas para este proyecto y quieres algo rápido, usa **Opción B**.

## Solución de problemas

### "tesseract no se reconoce como comando"
- Verifica que añadiste la ruta correcta al PATH.
- Cierra y vuelve a abrir PowerShell/CMD.
- Verifica que el archivo `tesseract.exe` existe en la carpeta que añadiste.

### "pytesseract no encuentra Tesseract"
- Si usas PATH: reinicia la terminal y el servidor Django.
- Si usas TESSERACT_CMD: verifica que la ruta en `.env` es correcta y que el archivo existe.

### "No se puede encontrar el idioma 'spa'"
- Reinstala Tesseract y asegúrate de marcar "Spanish language data" durante la instalación.
- O descarga manualmente el archivo `spa.traineddata` y colócalo en `C:\Program Files\Tesseract-OCR\tessdata\`
