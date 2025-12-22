from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import hashlib
import aiofiles
from pathlib import Path
from bson import ObjectId
from stl import mesh
import numpy as np

# This will be set by server.py
db = None

def set_db(database):
    global db
    db = database

router = APIRouter()

# ============ MATERIALS ============
class Material(BaseModel):
    name: str
    nameRo: str
    colors: List[str] = []
    type: str
    price: float
    description: str
    descriptionRo: str

class MaterialResponse(Material):
    id: str

@router.get("/api/materials", response_model=List[MaterialResponse])
async def get_materials():
    materials = await db.materials.find().to_list(1000)
    return [MaterialResponse(id=str(m['_id']), **{k:v for k,v in m.items() if k != '_id'}) for m in materials]

@router.post("/api/materials", response_model=MaterialResponse)
async def create_material(material: Material):
    result = await db.materials.insert_one(material.dict())
    return MaterialResponse(id=str(result.inserted_id), **material.dict())

@router.put("/api/materials/{material_id}", response_model=MaterialResponse)
async def update_material(material_id: str, material: Material):
    result = await db.materials.update_one({"_id": ObjectId(material_id)}, {"$set": material.dict()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return MaterialResponse(id=material_id, **material.dict())

@router.delete("/api/materials/{material_id}")
async def delete_material(material_id: str):
    result = await db.materials.delete_one({"_id": ObjectId(material_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted"}

# ============ GALLERY ============
class GalleryItem(BaseModel):
    title: str
    titleRo: str
    image: str
    material: str
    description: str

class GalleryItemResponse(GalleryItem):
    id: str

@router.get("/api/gallery", response_model=List[GalleryItemResponse])
async def get_gallery():
    items = await db.gallery.find().to_list(1000)
    return [GalleryItemResponse(id=str(i['_id']), **{k:v for k,v in i.items() if k != '_id'}) for i in items]

@router.post("/api/gallery", response_model=GalleryItemResponse)
async def create_gallery_item(item: GalleryItem):
    result = await db.gallery.insert_one(item.dict())
    return GalleryItemResponse(id=str(result.inserted_id), **item.dict())

@router.put("/api/gallery/{item_id}", response_model=GalleryItemResponse)
async def update_gallery_item(item_id: str, item: GalleryItem):
    result = await db.gallery.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return GalleryItemResponse(id=item_id, **item.dict())

@router.delete("/api/gallery/{item_id}")
async def delete_gallery_item(item_id: str):
    result = await db.gallery.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"message": "Gallery item deleted"}

# ============ SHOP ============
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

@router.get("/api/shop", response_model=List[ShopItemResponse])
async def get_shop():
    items = await db.shop.find().to_list(1000)
    return [ShopItemResponse(id=str(i['_id']), **{k:v for k,v in i.items() if k != '_id'}) for i in items]

@router.post("/api/shop", response_model=ShopItemResponse)
async def create_shop_item(item: ShopItem):
    result = await db.shop.insert_one(item.dict())
    return ShopItemResponse(id=str(result.inserted_id), **item.dict())

@router.put("/api/shop/{item_id}", response_model=ShopItemResponse)
async def update_shop_item(item_id: str, item: ShopItem):
    result = await db.shop.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict()})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Shop item not found")
    return ShopItemResponse(id=item_id, **item.dict())

@router.delete("/api/shop/{item_id}")
async def delete_shop_item(item_id: str):
    result = await db.shop.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shop item not found")
    return {"message": "Shop item deleted"}

# ============ AUTH ============
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    email: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    admin_emails = [
        os.environ.get('ADMIN_EMAIL_1'),
        os.environ.get('ADMIN_EMAIL_2'),
        os.environ.get('ADMIN_EMAIL_3')
    ]
    admin_password = os.environ.get('ADMIN_PASSWORD')
    
    if request.email in admin_emails and request.password == admin_password:
        token = hash_password(f"{request.email}:{request.password}")
        return LoginResponse(success=True, token=token, email=request.email)
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/api/auth/contact-info")
async def get_contact_info():
    return {
        "telegram": f"https://t.me/{os.environ.get('TELEGRAM_USERNAME', 'Shiftprint')}",
        "whatsapp": os.environ.get('WHATSAPP_LINK', 'https://wa.me/37360972200')
    }

# ============ ORDERS ============
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def calculate_stl_volume_and_weight(file_path: str, material_density: float = 1.24) -> dict:
    """
    Calculate volume and weight from STL file
    Args:
        file_path: Path to STL file
        material_density: Material density in g/cm³ (default PLA: 1.24)
    Returns:
        dict with volume_cm3, weight_g, dimensions
    """
    try:
        # Load STL file
        stl_mesh = mesh.Mesh.from_file(file_path)
        
        # Calculate volume using mesh method (in cubic units from STL file)
        volume, cog, inertia = stl_mesh.get_mass_properties()
        
        # Convert from mm³ to cm³ (assuming STL is in mm)
        volume_cm3 = volume / 1000
        
        # Calculate weight in grams
        weight_g = volume_cm3 * material_density
        
        # Get bounding box dimensions
        mins = stl_mesh.vectors.reshape(-1, 3).min(axis=0)
        maxs = stl_mesh.vectors.reshape(-1, 3).max(axis=0)
        dimensions = {
            'x': float(maxs[0] - mins[0]),
            'y': float(maxs[1] - mins[1]),
            'z': float(maxs[2] - mins[2])
        }
        
        return {
            'volume_cm3': float(volume_cm3),
            'weight_g': float(weight_g),
            'dimensions': dimensions
        }
    except Exception as e:
        print(f"Error calculating STL properties: {e}")
        return None

@router.post("/api/orders/upload")
async def upload_file(
    file: UploadFile = File(...),
    materialId: Optional[str] = Form(None),
    materialName: Optional[str] = Form(None),
    operatorChoice: bool = Form(False),
    purpose: Optional[str] = Form(None),
    loads: Optional[str] = Form(None),
    customerPhone: Optional[str] = Form(None),
    customerName: Optional[str] = Form(None),
    scale: Optional[str] = Form('1'),
    infill: Optional[str] = Form('20'),
    layerHeight: Optional[str] = Form('0.2')
):
    if not file.filename.lower().endswith(('.stl', '.obj')):
        raise HTTPException(status_code=400, detail="Only STL and OBJ files supported")
    
    file_path = UPLOAD_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Auto-calculate volume and weight from STL
    calculated_weight = None
    calculated_time = None
    estimated_cost = None
    
    if file.filename.lower().endswith('.stl'):
        # Get material density
        material_density = 1.24  # Default PLA
        material_type_from_db = 'PLA'
        
        if materialId and len(materialId) == 24:  # Valid ObjectId
            try:
                material = await db.materials.find_one({"_id": ObjectId(materialId)})
                if material:
                    material_type_from_db = material.get('type', 'PLA')
                    # Map material types to densities (g/cm³)
                    density_map = {
                        'PLA': 1.24,
                        'ABS': 1.04,
                        'PETG': 1.27,
                        'TPU': 1.21,
                        'Nylon': 1.14,
                        'ASA': 1.07
                    }
                    material_density = density_map.get(material_type_from_db, 1.24)
            except:
                pass  # Use default density
        
        stl_props = calculate_stl_volume_and_weight(str(file_path), material_density)
        
        if stl_props:
            calculated_weight = stl_props['weight_g']
            # Estimate print time based on volume (rough estimate: 1cm³ = 5 minutes)
            calculated_time = (stl_props['volume_cm3'] * 5) / 60  # Convert to hours
            
            # Calculate cost if we have material
            if materialId:
                settings = await db.print_settings.find_one()
                if not settings:
                    settings = {
                        "electricityCost": 2.5,
                        "printerPower": 0.3,
                        "markup": 30,
                        "laborCost": 50
                    }
                
                weight_kg = calculated_weight / 1000
                material_cost = weight_kg * material['price']
                electricity_cost = calculated_time * settings['printerPower'] * settings['electricityCost']
                labor_cost = calculated_time * settings['laborCost']
                
                subtotal = material_cost + electricity_cost + labor_cost
                markup_amount = subtotal * (settings['markup'] / 100)
                estimated_cost = subtotal + markup_amount
    
    order_data = {
        "fileName": file.filename,
        "fileUrl": str(file_path),
        "materialId": materialId,
        "materialName": materialName,
        "operatorChoice": operatorChoice,
        "purpose": purpose,
        "loads": loads,
        "weight": calculated_weight,
        "printTime": calculated_time,
        "estimatedCost": estimated_cost,
        "status": "pending",
        "uploadDate": datetime.utcnow(),
        "customerPhone": customerPhone,
        "customerName": customerName,
        "scale": scale,
        "infill": infill,
        "layerHeight": layerHeight
    }
    
    result = await db.orders.insert_one(order_data)
    order_id = str(result.inserted_id)
    
    # Send to Telegram
    try:
        import telegram
        TELEGRAM_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
        TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')
        
        if TELEGRAM_TOKEN and TELEGRAM_CHAT_ID:
            bot = telegram.Bot(token=TELEGRAM_TOKEN)
            
            # ===== НАСТРОЙКИ СЕБЕСТОИМОСТИ (как в таблице) =====
            ELECTRICITY_COST_PER_KW = 20      # MDL за кВт в час
            PRINTER_POWER_WATTS = 350          # Мощность принтера в ваттах
            PRINTER_AMORTIZATION_PER_HOUR = 22 # Амортизация принтера MDL/час
            MARKUP_COEFFICIENT = 1.3           # Наценка 30%
            
            # Цены материалов (MDL/кг)
            MATERIAL_PRICES = {
                'PLA': 290, 'PETG': 320, 'ABS': 300, 'TPU': 450, 'Nylon': 550
            }
            
            # Скорость печати (г/час) по высоте слоя
            PRINT_SPEEDS = {
                '0.15': 15, '0.2': 25, '0.28': 35, '0.32': 45
            }
            
            # Рассчитываем себестоимость для админа
            plastic_cost = 0
            electricity_cost = 0
            amortization_cost = 0
            print_time_hours = 0
            
            if calculated_weight:
                # Получаем тип материала и цену
                material_type = 'PLA'
                if materialId:
                    material = await db.materials.find_one({"_id": ObjectId(materialId)})
                    if material:
                        material_type = material.get('type', 'PLA')
                
                material_price = MATERIAL_PRICES.get(material_type, 290)
                print_speed = PRINT_SPEEDS.get(layerHeight, 25)
                
                # Время печати
                print_time_hours = calculated_weight / print_speed
                
                # Себестоимость пластика
                plastic_cost = (calculated_weight / 1000) * material_price
                
                # Себестоимость электричества
                electricity_cost = print_time_hours * (PRINTER_POWER_WATTS / 1000) * ELECTRICITY_COST_PER_KW
                
                # Амортизация
                amortization_cost = print_time_hours * PRINTER_AMORTIZATION_PER_HOUR
                
                # Итого себестоимость
                base_cost = plastic_cost + electricity_cost + amortization_cost
                final_price = round(base_cost * MARKUP_COEFFICIENT)
            
            message = f"""🔔 <b>Новый заказ #{order_id}</b>

📄 <b>Файл:</b> {file.filename}
🎨 <b>Материал:</b> {materialName if materialName else 'Выбор оператора'}
"""
            if calculated_weight:
                message += f"⚖️ <b>Вес:</b> {round(calculated_weight, 2)}г\n"
            if print_time_hours > 0:
                message += f"⏱ <b>Время печати:</b> {round(print_time_hours, 1)}ч ({round(print_time_hours * 60)}мин)\n"
            if infill:
                message += f"🔳 <b>Заполнение:</b> {infill}%\n"
            if layerHeight:
                message += f"🔬 <b>Высота слоя:</b> {layerHeight}mm\n"
            if scale and scale != '1':
                message += f"📐 <b>Масштаб:</b> {float(scale)*100:.0f}%\n"
            if purpose:
                message += f"📋 <b>Назначение:</b> {purpose}\n"
            if loads:
                message += f"📊 <b>Нагрузки:</b> {loads}\n"
            
            # ===== СЕБЕСТОИМОСТЬ (ТОЛЬКО ДЛЯ АДМИНА) =====
            if calculated_weight and plastic_cost > 0:
                message += f"""
━━━━━━━━━━━━━━━━━━
💵 <b>СЕБЕСТОИМОСТЬ:</b>
🧵 Пластик: <code>{round(plastic_cost)} MDL</code>
⚡ Электричество: <code>{round(electricity_cost)} MDL</code>
🔧 Амортизация: <code>{round(amortization_cost)} MDL</code>
📊 <b>Итого себест.:</b> <code>{round(base_cost)} MDL</code>
━━━━━━━━━━━━━━━━━━
💰 <b>Цена клиенту (×1.3):</b> <code>{final_price} MDL</code>
"""
            
            # Customer info
            if customerName or customerPhone:
                message += f"\n👤 <b>Клиент:</b> {customerName or 'Не указан'}\n"
                message += f"📞 <b>Телефон:</b> <code>{customerPhone or 'Не указан'}</code>\n"
            
            message += f"\n📅 {datetime.now().strftime('%d.%m.%Y %H:%M')}"
            
            # Create inline keyboard with buttons
            from telegram import InlineKeyboardButton, InlineKeyboardMarkup
            keyboard = [
                [
                    InlineKeyboardButton("✅ Подтвердить", callback_data=f"approve_{order_id}"),
                    InlineKeyboardButton("✏️ Изменить цену", callback_data=f"editprice_{order_id}")
                ],
                [
                    InlineKeyboardButton("📦 Завершить заказ", callback_data=f"complete_{order_id}")
                ]
            ]
            
            # Add material selection buttons if operator choice
            if operatorChoice:
                materials = await db.materials.find().to_list(10)
                mat_buttons = []
                for mat in materials[:3]:  # Max 3 materials in one row
                    mat_buttons.append(
                        InlineKeyboardButton(mat['name'], callback_data=f"selectmat_{order_id}_{mat['name']}")
                    )
                if mat_buttons:
                    keyboard.insert(1, mat_buttons)
            
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            with open(file_path, 'rb') as f:
                await bot.send_document(
                    chat_id=TELEGRAM_CHAT_ID, 
                    document=f, 
                    caption=message, 
                    parse_mode='HTML',
                    reply_markup=reply_markup
                )
    except Exception as e:
        print(f"Telegram error: {e}")
    
    return {"success": True, "orderId": order_id, "message": "Файл загружен"}

@router.get("/api/orders")
async def get_orders():
    orders = await db.orders.find().sort("uploadDate", -1).to_list(100)
    return [{"id": str(o['_id']), "fileName": o['fileName'], "materialName": o.get('materialName'), "status": o['status'], "uploadDate": o['uploadDate'].isoformat()} for o in orders]

# ============ TELEGRAM WEBHOOK ============
class TelegramUpdate(BaseModel):
    update_id: int
    callback_query: Optional[dict] = None
    message: Optional[dict] = None

@router.post("/api/telegram/webhook")
async def telegram_webhook(update: TelegramUpdate):
    """Handle Telegram bot callbacks"""
    try:
        import telegram
        from telegram import InlineKeyboardButton, InlineKeyboardMarkup
        
        TELEGRAM_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
        bot = telegram.Bot(token=TELEGRAM_TOKEN)
        
        # Handle callback queries (button presses)
        if update.callback_query:
            callback_data = update.callback_query.get('data')
            callback_id = update.callback_query.get('id')
            message = update.callback_query.get('message')
            chat_id = message.get('chat', {}).get('id')
            message_id = message.get('message_id')
            
            # Approve order
            if callback_data.startswith('approve_'):
                order_id = callback_data.replace('approve_', '')
                
                # Update order status in database
                await db.orders.update_one(
                    {"_id": ObjectId(order_id)},
                    {"$set": {"status": "approved", "approvedDate": datetime.utcnow()}}
                )
                
                # Send confirmation
                await bot.answer_callback_query(
                    callback_query_id=callback_id,
                    text="✅ Заказ подтверждён!"
                )
                
                # Update message
                order = await db.orders.find_one({"_id": ObjectId(order_id)})
                new_text = message.get('caption', '') + f"\n\n✅ <b>Статус:</b> ПОДТВЕРЖДЁН"
                
                await bot.edit_message_caption(
                    chat_id=chat_id,
                    message_id=message_id,
                    caption=new_text,
                    parse_mode='HTML'
                )
            
            # Edit price
            elif callback_data.startswith('editprice_'):
                order_id = callback_data.replace('editprice_', '')
                
                # Send instruction
                await bot.answer_callback_query(
                    callback_query_id=callback_id,
                    text="Отправьте новую цену числом (например: 350)"
                )
                
                # Store state that we're waiting for price
                await db.telegram_states.update_one(
                    {"chatId": chat_id},
                    {"$set": {"orderId": order_id, "action": "awaiting_price"}},
                    upsert=True
                )
                
                await bot.send_message(
                    chat_id=chat_id,
                    text=f"💰 Введите новую цену для заказа #{order_id} в Lei:"
                )
            
            # Complete order
            elif callback_data.startswith('complete_'):
                order_id = callback_data.replace('complete_', '')
                
                # Update order status
                await db.orders.update_one(
                    {"_id": ObjectId(order_id)},
                    {"$set": {"status": "completed", "completedDate": datetime.utcnow()}}
                )
                
                # Get order details for SMS
                order = await db.orders.find_one({"_id": ObjectId(order_id)})
                
                await bot.answer_callback_query(
                    callback_query_id=callback_id,
                    text="✅ Заказ отмечен как завершённый!"
                )
                
                # Send confirmation with customer info
                customer_phone = order.get('customerPhone', 'Не указан')
                customer_name = order.get('customerName', 'Не указан')
                
                await bot.send_message(
                    chat_id=chat_id,
                    text=f"✅ Заказ #{order_id} завершён!\n\n"
                         f"👤 Клиент: {customer_name}\n"
                         f"📞 Телефон: {customer_phone}\n\n"
                         f"📍 Адрес выдачи: г. Кишинёв, ул. Примэрией 45\n\n"
                         f"💡 Отправьте SMS клиенту о готовности заказа"
                )
            
            # Select material (if operator choice)
            elif callback_data.startswith('selectmat_'):
                parts = callback_data.replace('selectmat_', '').split('_')
                order_id = parts[0]
                material_name = parts[1] if len(parts) > 1 else ''
                
                await db.orders.update_one(
                    {"_id": ObjectId(order_id)},
                    {"$set": {"operatorSelectedMaterial": material_name, "status": "material_selected"}}
                )
                
                await bot.answer_callback_query(
                    callback_query_id=callback_id,
                    text=f"✅ Материал выбран: {material_name}"
                )
                
                await bot.send_message(
                    chat_id=chat_id,
                    text=f"🎨 Для заказа #{order_id} выбран материал: {material_name}"
                )
        
        # Handle text messages (for price input)
        elif update.message and update.message.get('text'):
            chat_id = update.message.get('chat', {}).get('id')
            text = update.message.get('text')
            
            # Check if we're waiting for price input
            state = await db.telegram_states.find_one({"chatId": chat_id})
            
            if state and state.get('action') == 'awaiting_price':
                try:
                    new_price = float(text)
                    order_id = state.get('orderId')
                    
                    # Update order with new price
                    await db.orders.update_one(
                        {"_id": ObjectId(order_id)},
                        {"$set": {"finalCost": new_price, "priceModifiedDate": datetime.utcnow()}}
                    )
                    
                    # Clear state
                    await db.telegram_states.delete_one({"chatId": chat_id})
                    
                    # Send confirmation
                    await bot.send_message(
                        chat_id=chat_id,
                        text=f"✅ Цена для заказа #{order_id} обновлена: {new_price} Lei"
                    )
                    
                except ValueError:
                    await bot.send_message(
                        chat_id=chat_id,
                        text="❌ Неверный формат. Введите число (например: 350)"
                    )
        
        return {"ok": True}
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"ok": False, "error": str(e)}

# ============ PRINT SETTINGS ============
class PrintSettings(BaseModel):
    electricityCost: float  # Lei per kWh
    printerPower: float     # kW
    markup: float           # Percentage (e.g., 20 for 20%)
    laborCost: float        # Lei per hour

class PrintSettingsResponse(PrintSettings):
    id: str

@router.get("/api/print-settings", response_model=PrintSettingsResponse)
async def get_print_settings():
    settings = await db.print_settings.find_one()
    if not settings:
        # Default settings
        default = {
            "electricityCost": 2.5,  # Lei per kWh
            "printerPower": 0.3,     # 300W = 0.3 kW
            "markup": 30,            # 30% markup
            "laborCost": 50          # 50 Lei per hour
        }
        result = await db.print_settings.insert_one(default)
        return PrintSettingsResponse(id=str(result.inserted_id), **default)
    return PrintSettingsResponse(id=str(settings['_id']), **{k:v for k,v in settings.items() if k != '_id'})

@router.put("/api/print-settings", response_model=PrintSettingsResponse)
async def update_print_settings(settings: PrintSettings):
    existing = await db.print_settings.find_one()
    if existing:
        await db.print_settings.update_one({"_id": existing['_id']}, {"$set": settings.dict()})
        return PrintSettingsResponse(id=str(existing['_id']), **settings.dict())
    else:
        result = await db.print_settings.insert_one(settings.dict())
        return PrintSettingsResponse(id=str(result.inserted_id), **settings.dict())

# ============ COST CALCULATION ============
class CalculateCostRequest(BaseModel):
    materialId: str
    weight: float  # grams
    printTime: float  # hours

class CalculateCostResponse(BaseModel):
    materialCost: float
    electricityCost: float
    laborCost: float
    subtotal: float
    markup: float
    totalCost: float
    currency: str

@router.post("/api/calculate-cost", response_model=CalculateCostResponse)
async def calculate_cost(request: CalculateCostRequest):
    # Get material
    material = await db.materials.find_one({"_id": ObjectId(request.materialId)})
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Get print settings
    settings = await db.print_settings.find_one()
    if not settings:
        settings = {
            "electricityCost": 2.5,
            "printerPower": 0.3,
            "markup": 30,
            "laborCost": 50
        }
    
    # Calculate costs
    weight_kg = request.weight / 1000
    material_cost = weight_kg * material['price']
    electricity_cost = request.printTime * settings['printerPower'] * settings['electricityCost']
    labor_cost = request.printTime * settings['laborCost']
    
    subtotal = material_cost + electricity_cost + labor_cost
    markup_amount = subtotal * (settings['markup'] / 100)
    total_cost = subtotal + markup_amount
    
    return CalculateCostResponse(
        materialCost=round(material_cost, 2),
        electricityCost=round(electricity_cost, 2),
        laborCost=round(labor_cost, 2),
        subtotal=round(subtotal, 2),
        markup=round(markup_amount, 2),
        totalCost=round(total_cost, 2),
        currency="Lei"
    )
