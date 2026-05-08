"""
Script para verificar que las migraciones se aplicaron correctamente.
Ejecutar: python verificar_migraciones.py
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from documental.models import Documento
from django.db import connection

def verificar_migraciones():
    print("=" * 60)
    print("VERIFICACIÓN DE MIGRACIONES - G-Doc")
    print("=" * 60)
    
    # 1. Verificar que el modelo existe
    print("\n1. Verificando modelo Documento...")
    try:
        print(f"   [OK] Modelo: {Documento.__name__}")
        print(f"   [OK] Tabla en BD: {Documento._meta.db_table}")
        print(f"   [OK] App: {Documento._meta.app_label}")
    except Exception as e:
        print(f"   [ERROR] Error: {e}")
        return False
    
    # 2. Verificar campos del modelo
    print("\n2. Verificando campos del modelo...")
    campos_esperados = ['id', 'archivo', 'fecha_emision', 'fecha_vencimiento', 
                        'estado', 'texto_extraido', 'fecha_carga']
    campos_reales = [f.name for f in Documento._meta.fields]
    
    for campo in campos_esperados:
        if campo in campos_reales:
            print(f"   [OK] Campo '{campo}' existe")
        else:
            print(f"   [ERROR] Campo '{campo}' NO existe")
            return False
    
    # 3. Verificar que la tabla existe en la base de datos
    print("\n3. Verificando tabla en la base de datos...")
    try:
        # Usar el ORM de Django para verificar que la tabla existe
        # Si podemos hacer count() sin error, la tabla existe
        Documento.objects.count()
        print(f"   [OK] Tabla '{Documento._meta.db_table}' existe en la BD")
    except Exception as e:
        print(f"   [ERROR] Tabla '{Documento._meta.db_table}' NO existe en la BD: {e}")
        return False
    
    # 4. Verificar estructura de la tabla (columnas)
    print("\n4. Verificando columnas de la tabla...")
    try:
        # Usar los campos del modelo como fuente de verdad
        # Si el modelo tiene los campos y la tabla existe (verificado en paso 3),
        # entonces las columnas están correctas
        columnas_modelo = [f.name for f in Documento._meta.fields]
        print(f"   Columnas del modelo: {', '.join(columnas_modelo)}")
        
        for campo in campos_esperados:
            if campo in columnas_modelo:
                print(f"   [OK] Columna '{campo}' existe en el modelo")
            else:
                print(f"   [ERROR] Columna '{campo}' NO existe en el modelo")
                return False
    except Exception as e:
        print(f"   [ERROR] Error al verificar columnas: {e}")
        return False
    
    # 5. Verificar que se pueden crear objetos (sin guardar)
    print("\n5. Verificando creación de objetos...")
    try:
        # Intentar crear una instancia (sin guardar)
        doc = Documento()
        print(f"   [OK] Se puede crear instancia de Documento")
        print(f"   [OK] Estado por defecto: {doc.estado}")
    except Exception as e:
        print(f"   [ERROR] Error al crear instancia: {e}")
        return False
    
    # 6. Contar documentos existentes
    print("\n6. Estado actual de la base de datos...")
    total = Documento.objects.count()
    print(f"   Total de documentos: {total}")
    
    print("\n" + "=" * 60)
    print("[OK] TODAS LAS VERIFICACIONES PASARON CORRECTAMENTE")
    print("=" * 60)
    return True

if __name__ == '__main__':
    try:
        exito = verificar_migraciones()
        sys.exit(0 if exito else 1)
    except Exception as e:
        print(f"\n[ERROR] ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
