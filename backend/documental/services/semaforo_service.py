"""
================================================================================
SERVICIO DEL SEMÁFORO INTELIGENTE - LÓGICA DE VALIDACIÓN
================================================================================
FASE 4: Evalúa el estado de un documento según reglas de negocio.
La lógica está en un servicio independiente para mantener las vistas limpias 
y poder reutilizar/testear.

UBICACIÓN DE LA LÓGICA DEL SEMÁFORO:
- Este archivo: documental/services/semaforo_service.py
- Función principal: calcular_estado_semaforo()
- Se llama desde: documental/views.py en perform_create() y perform_update()
================================================================================
"""
import logging
import re
from datetime import date, timedelta
from typing import Literal

logger = logging.getLogger(__name__)

EstadoSemafaro = Literal['verde', 'amarillo', 'rojo']


def extraer_numeros_documento(texto: str) -> list[str]:
    """
    Extrae posibles números de documento del texto OCR.
    Busca patrones comunes: DNI, pasaporte, números de 7-9 dígitos, etc.
    
    :param texto: Texto extraído por OCR
    :return: Lista de números encontrados (como strings)
    """
    if not texto:
        return []
    
    # Patrones comunes para números de documento:
    # - DNI argentino: 7-8 dígitos
    # - Pasaporte: puede tener letras y números
    # - Números seguidos de 7-9 dígitos
    
    numeros_encontrados = []
    
    # Buscar números de 7 a 9 dígitos consecutivos (DNI típico)
    patron_dni = r'\b\d{7,9}\b'
    matches = re.findall(patron_dni, texto)
    numeros_encontrados.extend(matches)
    
    # Buscar patrones como "DNI: 12345678" o "Documento: 12345678"
    patron_con_prefijo = r'(?:DNI|Documento|DOC|Pasaporte|PAS)[\s:]*(\d{7,9})'
    matches = re.findall(patron_con_prefijo, texto, re.IGNORECASE)
    numeros_encontrados.extend(matches)
    
    # Eliminar duplicados y devolver
    return list(set(numeros_encontrados))


def calcular_estado_semaforo(
    fecha_vencimiento: date | None = None,
    texto_extraido: str | None = None,
    fecha_emision: date | None = None,
    numero_documento_usuario: str | None = None,
) -> EstadoSemafaro:
    """
    ================================================================================
    FUNCIÓN PRINCIPAL DEL SEMÁFORO - AQUÍ ESTÁ LA LÓGICA DE VALIDACIÓN
    ================================================================================
    Calcula el estado del semáforo según las reglas de validación.
    
    REGLAS (en orden de prioridad):
    1. 🔴 ROJO: 
       - Documento vencido (fecha_vencimiento < hoy)
       - Fecha de emisión mayor a un mes de antigüedad (fecha_emision < hoy - 30 días)
       - Número de documento del usuario NO coincide con el del archivo
    
    2. 🟡 AMARILLO: 
       - Falta texto extraído o es muy corto (< 10 caracteres)
       - No se puede verificar el número de documento (no hay texto o no se encontró número)
    
    3. 🟢 VERDE: 
       - No está vencido
       - Fecha de emisión no mayor a un mes
       - Número de documento coincide
       - Tiene texto legible
    
    :param fecha_vencimiento: Fecha de vencimiento del documento (opcional)
    :param texto_extraido: Texto extraído por OCR (opcional)
    :param fecha_emision: Fecha de emisión del documento (opcional)
    :param numero_documento_usuario: Número de documento del usuario (opcional)
    :return: 'verde', 'amarillo' o 'rojo'
    ================================================================================
    """
    hoy = date.today()
    un_mes_atras = hoy - timedelta(days=30)
    
    # ============================================================================
    # REGLA 1: VERIFICACIONES CRÍTICAS → 🔴 ROJO
    # ============================================================================
    
    # 1.1: Si está vencido → 🔴 ROJO
    if fecha_vencimiento:
        if fecha_vencimiento < hoy:
            logger.debug(f"Documento vencido ({fecha_vencimiento} < {hoy}) → ROJO")
            return 'rojo'
    
    # 1.2: Si la fecha de emisión es mayor a un mes → 🔴 ROJO
    if fecha_emision:
        if fecha_emision < un_mes_atras:
            logger.debug(f"Documento con fecha de emisión mayor a un mes ({fecha_emision} < {un_mes_atras}) → ROJO")
            return 'rojo'
    
    # 1.3: Verificar coincidencia del número de documento → 🔴 ROJO si no coincide
    texto = (texto_extraido or "").strip()
    if numero_documento_usuario:
        numero_usuario = numero_documento_usuario.strip()
        if numero_usuario:
            # Extraer números de documento del texto OCR
            numeros_en_archivo = extraer_numeros_documento(texto)
            
            # Verificar si el número del usuario está en los números encontrados
            numero_coincide = False
            for num in numeros_en_archivo:
                # Comparar normalizando (eliminar espacios, guiones, etc.)
                num_normalizado = re.sub(r'[\s\-\.]', '', num)
                usuario_normalizado = re.sub(r'[\s\-\.]', '', numero_usuario)
                if num_normalizado == usuario_normalizado:
                    numero_coincide = True
                    break
            
            if not numero_coincide:
                logger.debug(f"Número de documento del usuario ({numero_usuario}) NO coincide con el del archivo → ROJO")
                return 'rojo'
    
    # ============================================================================
    # REGLA 2: VERIFICACIONES DE ADVERTENCIA → 🟡 AMARILLO
    # ============================================================================
    
    # 2.1: Si falta texto o es muy corto → 🟡 AMARILLO
    if not texto or len(texto) < 10:
        logger.debug(f"Documento sin texto legible (longitud: {len(texto)}) → AMARILLO")
        return 'amarillo'
    
    # 2.2: Si hay número de usuario pero no se encontró ningún número en el archivo → 🟡 AMARILLO
    if numero_documento_usuario and numero_documento_usuario.strip():
        numeros_en_archivo = extraer_numeros_documento(texto)
        if not numeros_en_archivo:
            logger.debug("No se encontró ningún número de documento en el archivo → AMARILLO")
            return 'amarillo'
    
    # ============================================================================
    # REGLA 3: TODO CORRECTO → 🟢 VERDE
    # ============================================================================
    logger.debug("Documento válido (todas las validaciones pasaron) → VERDE")
    return 'verde'


def actualizar_estado_documento(documento) -> None:
    """
    ================================================================================
    ACTUALIZA EL ESTADO DEL SEMÁFORO DE UN DOCUMENTO
    ================================================================================
    Calcula y actualiza el estado del semáforo de un documento.
    Esta función se llama automáticamente desde:
    - documental/views.py -> perform_create() (al crear documento)
    - documental/views.py -> perform_update() (al actualizar documento)
    
    :param documento: Instancia de Documento
    :return: None (modifica el objeto in-place, no guarda en BD)
    ================================================================================
    """
    estado_calculado = calcular_estado_semaforo(
        fecha_vencimiento=documento.fecha_vencimiento,
        texto_extraido=documento.texto_extraido,
        fecha_emision=documento.fecha_emision,
        numero_documento_usuario=documento.numero_documento_usuario,
    )
    documento.estado = estado_calculado
