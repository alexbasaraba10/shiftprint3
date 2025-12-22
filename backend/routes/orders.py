from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import aiofiles
from datetime import datetime
from pathlib import Path
import telegram
import asyncio

router = APIRouter(prefix="/api/orders", tags=["orders"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Telegram bot
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

# File upload directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class Order(BaseModel):
    fileName: str
    fileUrl: str
    materialId: Optional[str] = None
    materialName: Optional[str] = None
    operatorChoice: bool = False
    purpose: Optional[str] = None
    loads: Optional[str] = None
    status: str = "pending"
    uploadDate: datetime

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    materialId: Optional[str] = Form(None),
    materialName: Optional[str] = Form(None),
    operatorChoice: bool = Form(False),
    purpose: Optional[str] = Form(None),
    loads: Optional[str] = Form(None)
):
    """Upload 3D file and send to Telegram"""
    
    # Validate file type
    if not file.filename.lower().endswith(('.stl', '.obj')):
        raise HTTPException(status_code=400, detail="Only STL and OBJ files are supported")
    
    # Save file
    file_path = UPLOAD_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Create order in database
    order_data = {
        "fileName": file.filename,
        "fileUrl": str(file_path),
        "materialId": materialId,
        "materialName": materialName,
        "operatorChoice": operatorChoice,
        "purpose": purpose,
        "loads": loads,
        "status": "pending",
        "uploadDate": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_data)
    order_id = str(result.inserted_id)
    
    # Send notification to Telegram
    if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
        try:
            bot = telegram.Bot(token=TELEGRAM_TOKEN)
            
            message = f"""
🔔 <b>Новый заказ #{order_id}</b>

📄 <b>Файл:</b> {file.filename}
🎨 <b>Материал:</b> {materialName if materialName else 'Выбор оператора'}

"""
            if purpose:
                message += f"📋 <b>Назначение:</b> {purpose}\n"
            if loads:
                message += f"⚖️ <b>Нагрузки:</b> {loads}\n"
            
            message += f"\n📅 {datetime.now().strftime('%d.%m.%Y %H:%M')}"
            
            await bot.send_document(
                chat_id=TELEGRAM_CHAT_ID,
                document=open(file_path, 'rb'),
                caption=message,
                parse_mode='HTML'
            )
        except Exception as e:
            print(f"Error sending to Telegram: {e}")
    
    return {
        "success": True,
        "orderId": order_id,
        "message": "Файл загружен и отправлен оператору"
    }

@router.get("/")
async def get_orders():
    """Get all orders"""
    orders = await db.orders.find().sort("uploadDate", -1).to_list(100)
    return [
        {
            "id": str(order['_id']),
            "fileName": order['fileName'],
            "materialName": order.get('materialName'),
            "status": order['status'],
            "uploadDate": order['uploadDate'].isoformat()
        }
        for order in orders
    ]

@router.put("/{order_id}/approve")
async def approve_order(order_id: str, finalCost: float):
    """Approve order with final cost"""
    from bson import ObjectId
    
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "approved", "finalCost": finalCost}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"success": True, "message": "Order approved"}
