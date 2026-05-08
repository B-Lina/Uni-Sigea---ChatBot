# Cómo verificar que las migraciones se aplicaron correctamente

Hay varias formas de verificar que las migraciones se aplicaron correctamente sin depender solo de la consola:

## Método 1: Script de verificación automática (Recomendado)

Ejecuta el script que verifica todo automáticamente:

```powershell
cd c:\Users\lball\Desktop\G-Doc\backend
python verificar_migraciones.py
```

Este script verifica:
- ✓ Que el modelo Documento existe
- ✓ Que todos los campos están presentes
- ✓ Que la tabla existe en la base de datos
- ✓ Que las columnas coinciden con el modelo
- ✓ Que se pueden crear instancias del modelo

## Método 2: Django Admin (Visual)

1. **Crea un superusuario** (si no lo tienes):
   ```powershell
   python manage.py createsuperuser
   ```

2. **Inicia el servidor:**
   ```powershell
   python manage.py runserver
   ```

3. **Abre el admin:**
   - Ve a http://127.0.0.1:8000/admin/
   - Inicia sesión con tu superusuario
   - Debe aparecer la sección **"DOCUMENTAL"** con **"Documentos"**
   - Si ves "Documentos" y puedes hacer clic, las migraciones están aplicadas

## Método 3: Probar la API directamente

1. **Inicia el servidor:**
   ```powershell
   python manage.py runserver
   ```

2. **Abre en el navegador o usa Postman/Thunder Client:**
   ```
   GET http://127.0.0.1:8000/api/documentos/
   ```

3. **Resultado esperado:**
   - Si las migraciones están bien: `[]` (lista vacía) o lista de documentos
   - Si hay error: mensaje de error relacionado con la tabla

## Método 4: Desde el frontend

1. **Inicia backend y frontend:**
   ```powershell
   # Terminal 1
   cd backend
   python manage.py runserver

   # Terminal 2
   cd frontend
   npm run dev
   ```

2. **Abre http://localhost:5173**

3. **Intenta subir un documento:**
   - Si el formulario aparece y puedes subir un archivo sin errores, las migraciones están bien
   - Si aparece un error relacionado con la base de datos, hay un problema

## Método 5: Verificar archivo de migración

Revisa que existe el archivo de migración:

```
backend/documental/migrations/0001_initial.py
```

Este archivo debe contener la definición del modelo `Documento` con todos sus campos.

## Método 6: Comando showmigrations

```powershell
python manage.py showmigrations documental
```

Debe mostrar:
```
documental
 [X] 0001_initial
```

El `[X]` indica que la migración está aplicada.

## Método 7: Verificar directamente en SQLite (si usas SQLite)

Si estás usando SQLite, puedes abrir el archivo `backend/db.sqlite3` con un visor SQLite (como DB Browser for SQLite) y verificar que existe la tabla `documental_documento` con todas las columnas.

---

## ¿Qué hacer si algo falla?

1. **Si el script de verificación falla:** Revisa el mensaje de error específico
2. **Si el admin no muestra Documentos:** Ejecuta `python manage.py migrate` de nuevo
3. **Si la API da error 500:** Revisa los logs del servidor Django para ver el error específico
4. **Si no puedes crear documentos:** Verifica que la carpeta `backend/media/` existe y tiene permisos de escritura
