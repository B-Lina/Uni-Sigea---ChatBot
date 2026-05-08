import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
django.setup()
from documental.models import Documento
print(list(Documento.objects.values_list('id','estado_semaforo')[:20]))
