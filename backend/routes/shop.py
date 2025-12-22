from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/shop", tags=["shop"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

class ShopItem(BaseModel):
    name: str
    nameRo: str
    price: float
    material: str
    image: str
    description: str
    descriptionRo: str
    inStock: bool

class ShopItemResponse(ShopItem):
    id: str

@router.get("/", response_model=List[ShopItemResponse])
async def get_shop_items():
    """Get all shop items"""
    items = await db.shop.find().to_list(1000)
    return [
        ShopItemResponse(
            id=str(item['_id']),
            name=item['name'],
            nameRo=item['nameRo'],
            price=item['price'],
            material=item['material'],
            image=item['image'],
            description=item['description'],
            descriptionRo=item['descriptionRo'],
            inStock=item['inStock']
        )
        for item in items
    ]

@router.post("/", response_model=ShopItemResponse)
async def create_shop_item(item: ShopItem):
    """Create a new shop item"""
    item_dict = item.dict()
    result = await db.shop.insert_one(item_dict)
    item_dict['id'] = str(result.inserted_id)
    return ShopItemResponse(**item_dict)

@router.put("/{item_id}", response_model=ShopItemResponse)
async def update_shop_item(item_id: str, item: ShopItem):
    """Update a shop item"""
    from bson import ObjectId
    
    result = await db.shop.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": item.dict()}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Shop item not found")
    
    updated = await db.shop.find_one({"_id": ObjectId(item_id)})
    return ShopItemResponse(id=str(updated['_id']), **item.dict())

@router.delete("/{item_id}")
async def delete_shop_item(item_id: str):
    """Delete a shop item"""
    from bson import ObjectId
    
    result = await db.shop.delete_one({"_id": ObjectId(item_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shop item not found")
    
    return {"message": "Shop item deleted successfully"}
