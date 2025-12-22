import asyncio
from telegram import Bot
import os
from dotenv import load_dotenv

load_dotenv()

async def get_updates():
    bot = Bot(token=os.environ['TELEGRAM_BOT_TOKEN'])
    updates = await bot.get_updates()
    
    if updates:
        for update in updates:
            print(f"Chat ID: {update.message.chat.id}")
            print(f"Username: {update.message.chat.username}")
            print(f"First Name: {update.message.chat.first_name}")
            print("---")
    else:
        print("No updates found. Please send /start to your bot first!")

if __name__ == "__main__":
    asyncio.run(get_updates())
