"""
Configuración del admin de Django para el módulo documental.
"""
from django.contrib import admin
from .models import Documento, Convocatoria, Postulante, Expediente, DocumentoRequerido, UsuarioPerfil

# Tu configuración actual de Documento (la dejamos igual)
@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre_archivo', 'estado', 'fecha_carga']
    list_filter = ['estado', 'fecha_carga']
    
    def nombre_archivo(self, obj):
        return obj.archivo.name.split('/')[-1] if obj.archivo else '-'

# AGREGAMOS ESTOS PARA QUE APAREZCAN EN EL PANEL AZUL
admin.site.register(Convocatoria)
admin.site.register(Postulante)
admin.site.register(Expediente)
admin.site.register(DocumentoRequerido)
admin.site.register(UsuarioPerfil)