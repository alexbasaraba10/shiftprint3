from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
sys.path.append('/app/backend')

router = APIRouter(prefix="/api/materials", tags=["materials"])

# Import db from server
def get_db():
    from server import db
    return db

class Material(BaseModel):
    name: str
    nameRo: str
    color: str
    colorRo: str
    type: str
    price: float
    description: str
    descriptionRo: str

class MaterialResponse(Material):
    id: str

@router.get("/", response_model=List[MaterialResponse])
async def get_materials():
    """Get all materials"""
    db = get_db()
    materials = await db.materials.find().to_list(1000)
    return [
        MaterialResponse(
            id=str(mat['_id']),
            name=mat['name'],
            nameRo=mat['nameRo'],
            color=mat['color'],
            colorRo=mat['colorRo'],
            type=mat['type'],
            price=mat['price'],
            description=mat['description'],
            descriptionRo=mat['descriptionRo']
        )
        for mat in materials
    ]

@router.post("/", response_model=MaterialResponse)
async def create_material(material: Material):
    """Create a new material"""
    material_dict = material.dict()
    result = await db.materials.insert_one(material_dict)
    material_dict['id'] = str(result.inserted_id)
    return MaterialResponse(**material_dict)

@router.put("/{material_id}", response_model=MaterialResponse)
async def update_material(material_id: str, material: Material):
    """Update a material"""
    from bson import ObjectId
    
    result = await db.materials.update_one(
        {"_id": ObjectId(material_id)},
        {"$set": material.dict()}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    
    updated = await db.materials.find_one({"_id": ObjectId(material_id)})
    return MaterialResponse(id=str(updated['_id']), **material.dict())

@router.delete("/{material_id}")
async def delete_material(material_id: str):
    """Delete a material"""
    from bson import ObjectId
    
    result = await db.materials.delete_one({"_id": ObjectId(material_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    
    return {"message": "Material deleted successfully"}
