const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");


const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const API_URL = "https://www.tikwm.com/api/";

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (msg.from.is_bot) return; 


  if (msg.chat.type === "private" && text === "/start") {
    return bot.sendMessage(
      chatId,
      "👋 Привет! Добавь меня в группу, и я буду автоматически отправлять TikTok видео или фотопосты без водяного знака."
    );
  }


  if (text && text.includes("tiktok.com")) {
    try {
      const response = await axios.post(API_URL, { url: text });
      const data = response.data.data;

      if (!data) {
        return bot.sendMessage(chatId, "❌ Не удалось получить данные.");
      }

 
      if (data.images && data.images.length > 0) {
        const mediaGroup = data.images.slice(0, 10).map((img) => ({
          type: "photo",
          media: img,
        }));
        return bot.sendMediaGroup(chatId, mediaGroup);
      }

     
      if (data.play) {
        return bot.sendVideo(chatId, data.play, {
          caption: "🎬 Вот TikTok без водяного знака",
        });
      }

      bot.sendMessage(chatId, "⚠️ Ссылка есть, но не удалось скачать контент.");
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "⚠️ Ошибка при обработке ссылки.");
    }
  }


});
