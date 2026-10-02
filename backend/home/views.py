from django.http import JsonResponse  # pyright: ignore[reportMissingModuleSource]
import pymongo  # pyright: ignore[reportMissingImports]
from django.conf import settings

def obtener_recetas(request):
    try:
        cliente = pymongo.MongoClient(settings.MONGO_URI)
        db = cliente["granjanv_landing"]
        coleccion_recetas = db["recetas"]
        
        recetas = list(coleccion_recetas.find({}, {"_id": 0}))
        return JsonResponse(recetas, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
