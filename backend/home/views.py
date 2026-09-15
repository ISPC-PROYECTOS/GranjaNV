from django.http import JsonResponse
import pymongo

def obtener_recetas(request):
    # 1. Nos conectamos al servidor local de MongoDB
    cliente = pymongo.MongoClient("mongodb://localhost:27017/")
    
    # 2. Seleccionamos la base de datos y la colección
    db = cliente["granjanv_landing"]
    coleccion_recetas = db["recetas"]
    
    # 3. Buscamos todas las recetas. 
    # El {'_id': 0} es un truco clave para ocultar el ID interno de Mongo, 
    # ya que Django a veces tiene problemas para transformarlo a JSON.
    recetas = list(coleccion_recetas.find({}, {'_id': 0}))
    
    # 4. Devolvemos la lista en formato JSON para que Angular la entienda
    return JsonResponse(recetas, safe=False)

# Create your views here.
