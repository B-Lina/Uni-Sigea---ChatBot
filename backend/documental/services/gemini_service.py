import json
import logging
import os
import unicodedata
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

# ── Institutional Declaration ────────────────────────────────────────────────

DECLARACION_INSTITUCIONAL = {
    "es": (
        '"Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la '
        'construcción, como ideal regulativo; me dirijo, controlo y dicto '
        'mis propias leyes."'
    ),
    "en": (
        '"I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and '
        'construction, as a regulative ideal; I direct, control and dictate '
        'my own laws."'
    ),
}

# ── Bilingual fallback messages ──────────────────────────────────────────────

DOCUMENTAL_FALLBACK = {
    "es": "No fue posible procesar tu consulta documental en este momento.",
    "en": "We could not process your document query at this time.",
}
FUERA_DE_CONTEXTO = {
    "es": "Solo puedo ayudarte con documentacion del proceso de vinculacion. "
          "Sin embargo, recuerda: " + DECLARACION_INSTITUCIONAL["es"],
    "en": "I can only help you with documentation related to the onboarding process. "
          "However, remember: " + DECLARACION_INSTITUCIONAL["en"],
}

# ── Topic keywords (Spanish + English) ──────────────────────────────────────

TEMAS_DOCUMENTALES = (
    # Spanish
    "cedula",
    "cedula de ciudadania",
    "cc",
    "documento de identidad",
    "identificacion",
    "hoja de vida",
    "curriculum",
    "cv",
    "certificado laboral",
    "certificados laborales",
    "experiencia laboral",
    "certificado academico",
    "certificados academicos",
    "titulo",
    "rut",
    "antecedentes disciplinarios",
    "procuraduria",
    "antecedentes fiscales",
    "contraloria",
    "antecedentes judiciales",
    "certificado policia",
    "certificado de policia",
    "policia nacional",
    "policia",
    "declaracion juramentada",
    "declaracion juramentada de bienes y rentas",
    "bienes y rentas",
    "sigep",
    "tratamiento de datos",
    "autorizacion tratamiento de datos",
    "autorizacion de tratamiento de datos",
    "datos personales",
    "habeas data",
    "sistema nacional de medidas correctivas",
    "medidas correctivas",
    "rnmc",
    "comparendos",
    "clausula de confidencialidad",
    "confidencialidad",
    "inhabilidades",
    "incompatibilidades",
    "conflictos",
    "conflicto de intereses",
    "conflictos de intereses",
    "delitos sexuales",
    "menores de 18",
    "menores",
    "nit",
    "sg-sst",
    "sgsst",
    "curso sg-sst",
    "seguridad y salud en el trabajo",
    "redam",
    "deudores alimentarios",
    "moroso alimentario",
    "compromiso anticorrupcion",
    "anticorrupcion",
    "eps",
    "salud",
    "pension",
    "fondo de pensiones",
    "cuenta bancaria",
    "banco",
    "certificacion bancaria",
    "diploma",
    "acta de grado",
    "archivo",
    "documento",
    "documentos",
    "requisito",
    "requisitos",
    "cargar",
    "subir",
    "validacion",
    "revision",
    "rechazado",
    "aprobado",
    # English
    "id card",
    "identity card",
    "identity document",
    "identification",
    "resume",
    "work certificate",
    "work certificates",
    "work experience",
    "academic certificate",
    "academic certificates",
    "degree",
    "tax id",
    "disciplinary record",
    "disciplinary records",
    "fiscal record",
    "fiscal records",
    "criminal record",
    "criminal records",
    "police certificate",
    "police clearance",
    "sworn declaration",
    "assets and income",
    "data processing",
    "data authorization",
    "personal data",
    "corrective measures",
    "confidentiality clause",
    "confidentiality",
    "disqualifications",
    "incompatibilities",
    "conflict of interest",
    "conflicts of interest",
    "sexual offenses",
    "minors",
    "occupational health",
    "occupational safety",
    "anti-corruption",
    "health insurance",
    "pension fund",
    "bank account",
    "bank certificate",
    "graduation certificate",
    "file",
    "document",
    "documents",
    "requirement",
    "requirements",
    "upload",
    "validation",
    "review",
    "rejected",
    "approved",
)

# ── Philosophical / institutional keywords ──────────────────────────────────

TEMAS_FILOSOFICOS = (
    # Spanish
    "autonomia", "autonomo", "libre", "libertad", "responsable",
    "responsabilidad", "etica", "valores", "desarrollo humano",
    "transformacion", "bienestar", "evolucion personal",
    "responsabilidad social", "dialogo", "construccion",
    "ideal regulativo", "filosofia", "filosofia institucional",
    "declaracion institucional", "mision", "principios",
    # English
    "autonomy", "autonomous", "free", "freedom", "responsible",
    "responsibility", "ethics", "values", "human development",
    "transformation", "well-being", "wellbeing", "personal evolution",
    "social responsibility", "dialogue", "construction",
    "regulative ideal", "philosophy", "institutional philosophy",
    "institutional declaration", "mission", "principles",
)

# ── Document catalogue (bilingual descriptions) ─────────────────────────────

DOCUMENTOS_PERMITIDOS = """
- Cedula de ciudadania / ID Card: documento de identidad legible y vigente / legible and valid identity document.
- Hoja de vida / Resume: datos personales, formacion y experiencia completos / complete personal data, education and experience.
- Certificados laborales / Work certificates: deben incluir fecha de inicio y fin, cargo, funciones y estar firmados / must include start and end date, position, duties and be signed.
- Certificados academicos / Academic certificates: diplomas, actas o soportes academicos legibles y a nombre del titular / legible diplomas, transcripts at the holder's name.
- RUT / Tax ID: documento tributario actualizado y legible / updated and legible tax document.
- Certificado Contraloria / Comptroller Certificate: fecha menor a 30 dias y sin antecedentes fiscales / date less than 30 days old and no fiscal records. Link: https://www.contraloria.gov.co/web/guest/persona-natural
- Certificado Procuraduria / Attorney General Certificate: fecha menor a 30 dias y datos coincidentes / date less than 30 days and matching data. Link: https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx
- Certificado Policia Nacional / Police Clearance: validar numero de cedula y fecha reciente / verify ID number and recent date. Link: https://antecedentes.policia.gov.co:7005/WebJudicial/
- Declaracion Juramentada de Bienes y Rentas / Sworn Asset Declaration (SIGEP): debe indicar "Contratista" y tener datos completos / must indicate "Contractor" with complete data. Link: https://www1.funcionpublica.gov.co/acceso-directo-byr/
- Autorizacion Tratamiento de Datos / Data Processing Authorization: completar solo campos permitidos y firmar / fill only allowed fields and sign.
- Sistema Nacional de Medidas Correctivas / National Corrective Measures: fecha menor a 30 dias y sin antecedentes / date less than 30 days and no records. Link: https://srvcnpc.policia.gov.co/PSC/frm_cnp_consulta.aspx
- Clausula de Confidencialidad / Confidentiality Clause: debe incluir correo y firma, con fecha vigente / must include email and signature with valid date. Link: https://share.google/4YHiYYXLZYBrl9rAz
- Inhabilidades, Incompatibilidades y Conflictos / Disqualifications and Conflicts: incluir fecha, hora, numero de proceso y firma valida / include date, time, case number and valid signature.
- Delitos Sexuales para Menores de 18 / Sexual Offenses for Minors: ingresar NIT correcto de la universidad / enter correct university NIT. Link: https://inhabilidades.policia.gov.co:8080/
- Curso SG-SST / Occupational Safety Course: certificado valido a nombre del titular / valid certificate at holder's name. Link: https://www.sura.co/arl/educacion/cursos/50-horas-sgsst
- REDAM / Child Support Debtors Registry: no aparecer como deudor y fecha menor a 30 dias / must not appear as debtor, date less than 30 days. Link: https://carpetaciudadana.and.gov.co/inicio-de-sesion
- Compromiso Anticorrupcion / Anti-corruption Commitment: fecha en formato especifico / date in specific format. Link: https://share.google/IffKcX485stFlLn7G
- EPS, pension y cuenta bancaria / Health insurance, pension and bank account: soportes legibles y a nombre del titular / legible documents at holder's name.
"""

DOCUMENTOS_INFO = (
    {
        "nombre": {"es": "Certificado Contraloria", "en": "Comptroller Certificate"},
        "keywords": ("contraloria", "antecedentes fiscales", "certificado fiscal", "comptroller", "fiscal record", "fiscal records"),
        "enlace": "https://www.contraloria.gov.co/web/guest/persona-natural",
        "resumen": {
            "es": "Debe tener fecha menor a 30 dias y no presentar antecedentes fiscales. Error comun: certificado vencido o con deudas fiscales.",
            "en": "Must be dated within the last 30 days with no fiscal records. Common error: expired certificate or fiscal debts.",
        },
    },
    {
        "nombre": {"es": "Certificado Procuraduria", "en": "Attorney General Certificate"},
        "keywords": ("procuraduria", "antecedentes disciplinarios", "certificado disciplinario", "attorney general", "disciplinary record", "disciplinary records"),
        "enlace": "https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx",
        "resumen": {
            "es": "Debe tener fecha menor a 30 dias y datos coincidentes. Error comun: nombre o cedula no coinciden.",
            "en": "Must be dated within the last 30 days with matching data. Common error: name or ID number mismatch.",
        },
    },
    {
        "nombre": {"es": "Certificado Policia Nacional", "en": "National Police Clearance"},
        "keywords": ("policia nacional", "antecedentes judiciales", "certificado policia", "certificado de policia", "police clearance", "police certificate", "criminal record", "criminal records"),
        "enlace": "https://antecedentes.policia.gov.co:7005/WebJudicial/",
        "resumen": {
            "es": "Debe validar numero de cedula y fecha reciente. Error comun: fecha de consulta antigua.",
            "en": "Must verify ID number and recent date. Common error: outdated query date.",
        },
    },
    {
        "nombre": {"es": "Declaracion Juramentada de Bienes y Rentas (SIGEP)", "en": "Sworn Asset and Income Declaration (SIGEP)"},
        "keywords": ("declaracion juramentada", "bienes y rentas", "sigep", "sworn declaration", "assets and income"),
        "enlace": "https://www1.funcionpublica.gov.co/acceso-directo-byr/",
        "resumen": {
            "es": "Debe indicar Contratista y tener datos completos. Error comun: colocar Docente o confundir datos personales.",
            "en": "Must indicate Contractor with complete data. Common error: entering Teacher or confusing personal data.",
        },
    },
    {
        "nombre": {"es": "Autorizacion Tratamiento de Datos", "en": "Data Processing Authorization"},
        "keywords": ("tratamiento de datos", "autorizacion tratamiento de datos", "datos personales", "habeas data", "data processing", "data authorization", "personal data"),
        "enlace": "https://www1.funcionpublica.gov.co/acceso-directo-byr/",
        "resumen": {
            "es": "Completa solo campos permitidos y firma. Error comun: editar campos protegidos o no seleccionar tipo de documento.",
            "en": "Fill only allowed fields and sign. Common error: editing protected fields or not selecting document type.",
        },
    },
    {
        "nombre": {"es": "Sistema Nacional de Medidas Correctivas", "en": "National Corrective Measures System"},
        "keywords": ("sistema nacional de medidas correctivas", "medidas correctivas", "rnmc", "comparendos", "corrective measures"),
        "enlace": "https://srvcnpc.policia.gov.co/PSC/frm_cnp_consulta.aspx",
        "resumen": {
            "es": "Debe tener fecha menor a 30 dias y no presentar antecedentes. Error comun: documento vencido.",
            "en": "Must be dated within the last 30 days with no records. Common error: expired document.",
        },
    },
    {
        "nombre": {"es": "Clausula de Confidencialidad", "en": "Confidentiality Clause"},
        "keywords": ("clausula de confidencialidad", "confidencialidad", "confidentiality clause", "confidentiality"),
        "enlace": "https://share.google/4YHiYYXLZYBrl9rAz",
        "resumen": {
            "es": "Debe incluir correo y firma, con fecha vigente. Error comun: omitir correo o firma.",
            "en": "Must include email and signature with a valid date. Common error: missing email or signature.",
        },
    },
    {
        "nombre": {"es": "Delitos Sexuales (Menores de 18)", "en": "Sexual Offenses Certificate (Minors)"},
        "keywords": ("delitos sexuales", "menores de 18", "menores", "nit universidad", "sexual offenses", "minors"),
        "enlace": "https://inhabilidades.policia.gov.co:8080/",
        "resumen": {
            "es": "Ingresa el NIT correcto de la universidad y verifica que la fecha este vigente. Error comun: NIT incorrecto o vacio.",
            "en": "Enter the correct university NIT and verify the date is valid. Common error: incorrect or empty NIT.",
        },
    },
    {
        "nombre": {"es": "Curso SG-SST", "en": "Occupational Safety Course (SG-SST)"},
        "keywords": ("curso sg-sst", "sg-sst", "sgsst", "seguridad y salud en el trabajo", "occupational health", "occupational safety"),
        "enlace": "https://www.sura.co/arl/educacion/cursos/50-horas-sgsst",
        "resumen": {
            "es": "El certificado debe estar vigente y a nombre del titular. Error comun: certificado vencido o de otra persona.",
            "en": "The certificate must be valid and in the holder's name. Common error: expired or someone else's certificate.",
        },
    },
    {
        "nombre": {"es": "REDAM", "en": "Child Support Debtors Registry (REDAM)"},
        "keywords": ("redam", "deudores alimentarios", "moroso alimentario", "child support", "debtors registry"),
        "enlace": "https://carpetaciudadana.and.gov.co/inicio-de-sesion",
        "resumen": {
            "es": "No debes aparecer como deudor y la fecha debe ser menor a 30 dias. Error comun: registro como moroso activo.",
            "en": "You must not appear as a debtor and the date must be within the last 30 days. Common error: active debtor record.",
        },
    },
    {
        "nombre": {"es": "Compromiso Anticorrupcion", "en": "Anti-corruption Commitment"},
        "keywords": ("compromiso anticorrupcion", "anticorrupcion", "anti-corruption"),
        "enlace": "https://share.google/IffKcX485stFlLn7G",
        "resumen": {
            "es": "La fecha debe ir como Villa de San Diego, [dia] de [mes] del [año]. Error comun: usar Ubate o formato numerico.",
            "en": "The date must follow the format 'Villa de San Diego, [day] de [month] del [year]'. Common error: using Ubate or numeric format.",
        },
    },
)


# ── Language detection ───────────────────────────────────────────────────────

_ENGLISH_MARKERS = (
    "hello", "hi", "how", "what", "where", "when", "which", "who", "why",
    "can", "could", "would", "should", "need", "want", "please", "thank",
    "thanks", "help", "document", "documents", "upload", "download", "get",
    "obtain", "certificate", "requirement", "requirements", "file",
    "the", "is", "are", "do", "does", "have", "has", "my", "your",
    "this", "that", "about", "from", "with", "for", "how do i",
    "i need", "i want", "tell me",
)


def _detectar_idioma(mensaje):
    """Detect whether a message is in English or Spanish. Returns 'en' or 'es'."""
    texto = _normalizar(mensaje)
    words = texto.split()
    english_count = sum(1 for w in words if w in _ENGLISH_MARKERS)
    # If more than 30 % of words are English markers, treat as English
    if len(words) > 0 and english_count / len(words) >= 0.3:
        return "en"
    return "es"


def _detectar_idioma_desde_param(lang_param, mensaje):
    """Resolve the language: explicit param wins, else auto-detect."""
    if lang_param in ("en", "es"):
        return lang_param
    return _detectar_idioma(mensaje)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _buscar_documento(mensaje):
    texto = _normalizar(mensaje)
    for doc in DOCUMENTOS_INFO:
        if any(keyword in texto for keyword in doc["keywords"]):
            return doc
    return None


def _pide_enlace(mensaje):
    texto = _normalizar(mensaje)
    palabras = (
        # Spanish
        "donde", "obtener", "descargar", "generar", "consultar", "sacar", "enlace", "link", "pagina",
        # English
        "where", "obtain", "download", "generate", "get", "link", "page", "how to get",
    )
    return any(palabra in texto for palabra in palabras)


def _respuesta_enlace_si_aplica(mensaje, lang):
    if not _pide_enlace(mensaje):
        return None
    doc = _buscar_documento(mensaje)
    if not doc:
        return None
    nombre = doc["nombre"][lang]
    resumen = doc["resumen"][lang]
    enlace = doc["enlace"]
    if lang == "en":
        return f"You can obtain {nombre} at this link: {enlace}. {resumen}"
    return f"Puedes obtener {nombre} en este enlace: {enlace}. {resumen}"


def _respuesta_local(mensaje, lang):
    doc = _buscar_documento(mensaje)
    if not doc:
        return DOCUMENTAL_FALLBACK[lang]
    nombre = doc["nombre"][lang]
    resumen = doc["resumen"][lang]
    if lang == "en":
        return f"About {nombre}: {resumen}"
    return f"Sobre {nombre}: {resumen}"


def _normalizar(texto):
    limpio = unicodedata.normalize("NFKD", texto.lower())
    return "".join(c for c in limpio if not unicodedata.combining(c))


def es_consulta_filosofica(mensaje):
    """Check whether the message asks about institutional philosophy / values."""
    texto = _normalizar(mensaje)
    return any(tema in texto for tema in TEMAS_FILOSOFICOS)


def es_consulta_documental(mensaje):
    texto = _normalizar(mensaje)
    return any(tema in texto for tema in TEMAS_DOCUMENTALES)


# ── Philosophical local response ────────────────────────────────────────────

_RESPUESTA_FILOSOFICA = {
    "es": (
        f"{DECLARACION_INSTITUCIONAL['es']}\n\n"
        "Nuestro proyecto se fundamenta en los pilares del desarrollo humano integral, "
        "la etica, la autonomia, la transformacion positiva, el bienestar, "
        "la evolucion personal y la responsabilidad social. "
        "Cada paso en tu proceso de vinculacion refleja estos valores: "
        "al gestionar tus documentos con responsabilidad, ejerces tu autonomia "
        "y contribuyes a una comunidad mas justa y transparente."
    ),
    "en": (
        f"{DECLARACION_INSTITUCIONAL['en']}\n\n"
        "Our project is grounded in the pillars of integral human development, "
        "ethics, autonomy, positive transformation, well-being, "
        "personal evolution and social responsibility. "
        "Every step in your onboarding process reflects these values: "
        "by managing your documents responsibly, you exercise your autonomy "
        "and contribute to a more just and transparent community."
    ),
}


# ── Main entry point ────────────────────────────────────────────────────────

def responder_consulta_documental(mensaje, lang=None):
    """
    Answer a document-related query. Supports Spanish and English.
    Also responds to questions about the institutional philosophy.

    Parameters:
        mensaje: the user's message text
        lang: 'es' or 'en' (optional). If omitted, language is auto-detected.
    """
    lang = _detectar_idioma_desde_param(lang, mensaje)

    # Handle philosophical / institutional questions
    if es_consulta_filosofica(mensaje):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return _RESPUESTA_FILOSOFICA[lang]
        return _consultar_gemini_filosofico(mensaje, lang)

    if not es_consulta_documental(mensaje):
        return FUERA_DE_CONTEXTO[lang]

    respuesta_enlace = _respuesta_enlace_si_aplica(mensaje, lang)
    if respuesta_enlace:
        return respuesta_enlace

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY no esta configurada.")
        return _respuesta_local(mensaje, lang)

    # ── Institutional philosophy preamble for the Gemini prompt ──────────
    filosofia_preamble_es = (
        "CONTEXTO INSTITUCIONAL IMPORTANTE: Este asistente esta guiado por la "
        "siguiente declaracion institucional: "
        f"{DECLARACION_INSTITUCIONAL['es']} "
        "Los valores que orientan este proyecto son: desarrollo humano, etica, "
        "autonomia, transformacion positiva, bienestar, evolucion personal "
        "y responsabilidad social. Cuando sea pertinente, refuerza estos valores "
        "en tus respuestas de forma natural y breve.\n\n"
    )
    filosofia_preamble_en = (
        "IMPORTANT INSTITUTIONAL CONTEXT: This assistant is guided by the "
        "following institutional declaration: "
        f"{DECLARACION_INSTITUCIONAL['en']} "
        "The guiding values of this project are: human development, ethics, "
        "autonomy, positive transformation, well-being, personal evolution "
        "and social responsibility. When relevant, naturally reinforce these "
        "values in your responses.\n\n"
    )

    if lang == "en":
        prompt = (
            f"{filosofia_preamble_en}"
            "You are the document assistant of the UNI SIGEA system. "
            "Answer only about documents related to the staff onboarding process. "
            "Allowed documents, synonyms and rules:\n"
            f"{DOCUMENTOS_PERMITIDOS}\n"
            "If the question does not belong to those topics, answer exactly: "
            f"'{FUERA_DE_CONTEXTO['en']}'. "
            "Give brief, clear answers in English, maximum 3 sentences. "
            "When applicable, mention required date, data to review and common error. "
            "If the user asks where to obtain, download, generate or consult a document, answer with the link from the catalogue. "
            f"Applicant's question: {mensaje}"
        )
    else:
        prompt = (
            f"{filosofia_preamble_es}"
            "Eres el asistente documental del sistema UNI SIGEA. "
            "Responde solo sobre documentos del proceso de vinculacion. "
            "Documentos, sinonimos y reglas permitidas:\n"
            f"{DOCUMENTOS_PERMITIDOS}\n"
            "Si la pregunta no pertenece a esos temas, responde exactamente: "
            f"'{FUERA_DE_CONTEXTO['es']}'. "
            "Da respuestas breves, claras, en espanol, maximo 3 frases. "
            "Cuando aplique, menciona fecha requerida, dato a revisar y error comun. "
            "Si el usuario pregunta donde obtener, descargar, generar o consultar un documento, responde con el enlace del catalogo. "
            f"Pregunta del postulante: {mensaje}"
        )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 350,
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        logger.error("Error consultando Gemini: %s", exc, exc_info=True)
        return _respuesta_local(mensaje, lang)

    try:
        texto = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError):
        logger.error("Respuesta inesperada de Gemini: %s", data)
        return _respuesta_local(mensaje, lang)

    return texto or _respuesta_local(mensaje, lang)


def _consultar_gemini_filosofico(mensaje, lang):
    """Handle philosophical / institutional queries via Gemini or local fallback."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _RESPUESTA_FILOSOFICA[lang]

    if lang == "en":
        prompt = (
            "You are the philosophical assistant of the UNI SIGEA system. "
            "The institutional declaration is: "
            f"{DECLARACION_INSTITUCIONAL['en']} "
            "The guiding pillars are: human development, ethics, autonomy, "
            "positive transformation, well-being, personal evolution and "
            "social responsibility. "
            "Answer the user's question about these values in a brief, warm "
            "and inspiring manner. Maximum 4 sentences. "
            f"User's question: {mensaje}"
        )
    else:
        prompt = (
            "Eres el asistente filosofico del sistema UNI SIGEA. "
            "La declaracion institucional es: "
            f"{DECLARACION_INSTITUCIONAL['es']} "
            "Los pilares orientadores son: desarrollo humano, etica, autonomia, "
            "transformacion positiva, bienestar, evolucion personal y "
            "responsabilidad social. "
            "Responde la pregunta del usuario sobre estos valores de forma breve, "
            "calida e inspiradora. Maximo 4 frases. "
            f"Pregunta del usuario: {mensaje}"
        )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 350,
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        logger.error("Error consultando Gemini (filosofico): %s", exc, exc_info=True)
        return _RESPUESTA_FILOSOFICA[lang]

    try:
        texto = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError):
        logger.error("Respuesta inesperada de Gemini (filosofico): %s", data)
        return _RESPUESTA_FILOSOFICA[lang]

    return texto or _RESPUESTA_FILOSOFICA[lang]
