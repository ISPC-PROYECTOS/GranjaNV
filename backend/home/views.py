from django.http import JsonResponse
import pymongo

MONGO_URI= "mongodb+srv://granjanv-user:bduser@granjanv-bd.3a2xxcb.mongodb.net/?appName=Granjanv-bd"
def obtener_recetas(request):
    try:
        cliente = pymongo.MongoClient(MONGO_URI)
        db = cliente["granjanv_landing"]
        coleccion_recetas = db["recetas"]
        
        recetas = list(coleccion_recetas.find({}, {"_id": 0}))
        return JsonResponse(recetas, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
