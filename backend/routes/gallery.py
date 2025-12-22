from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/gallery", tags=["gallery"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class GalleryItem(BaseModel):
    title: str
    titleRo: str
    image: str
    material: str
    description: str

class GalleryItemResponse(GalleryItem):
    id: str

@router.get("/", response_model=List[GalleryItemResponse])
async def get_gallery_items():
    """Get all gallery items"""
    items = await db.gallery.find().to_list(1000)
    return [
        GalleryItemResponse(
            id=str(item['_id']),
            title=item['title'],
            titleRo=item['titleRo'],
            image=item['image'],
            material=item['material'],
            description=item['description']
        )
        for item in items
    ]

@router.post("/", response_model=GalleryItemResponse)
async def create_gallery_item(item: GalleryItem):
    """Create a new gallery item"""
    item_dict = item.dict()
    result = await db.gallery.insert_one(item_dict)
    item_dict['id'] = str(result.inserted_id)
    return GalleryItemResponse(**item_dict)

@router.put("/{item_id}", response_model=GalleryItemResponse)
async def update_gallery_item(item_id: str, item: GalleryItem):
    """Update a gallery item"""
    from bson import ObjectId
    
    result = await db.gallery.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": item.dict()}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    
    updated = await db.gallery.find_one({"_id": ObjectId(item_id)})
    return GalleryItemResponse(id=str(updated['_id']), **item.dict())

@router.delete("/{item_id}")
async def delete_gallery_item(item_id: str):
    """Delete a gallery item"""
    from bson import ObjectId
    
    result = await db.gallery.delete_one({"_id": ObjectId(item_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    
    return {"message": "Gallery item deleted successfully"}
