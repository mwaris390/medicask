# 🩺 MedicAsk – Your AI Medical Info Assistant

**MedicAsk** is an AI-powered mobile application built with **Expo React Native** that allows users to query detailed medicine information — either via **text** or by capturing a **photo** of the medicine. Think of it as **ChatGPT, but for medicines**.

> 🚀 Ask about ingredients, effects, usage, and availability – using text or just a snapshot of your medicine!

---

## ✨ Features

- 🤖 **AI-powered Q&A** – Ask medicine-related questions via text.
- 📸 **Camera Integration** – Take a photo of medicine using **Expo Camera**.
- 🧠 **Image Recognition** – Identify medicine through packaging/image using **OpenGVLab model**.
- 🧾 **Text-to-AI** – Use the **Qwen 3 model** from OpenRouter for accurate medical responses.
- 💾 **Base64 Conversion** – Images are converted to Base64 using **Expo FileSystem** for AI processing.

---

## 📱 Tech Stack

| Technology       | Purpose                                |
|------------------|----------------------------------------|
| Expo React Native| Mobile app framework                   |
| Expo Camera      | Taking medicine images                 |
| Expo FileSystem  | Converting captured images to Base64   |
| OpenRouter API   | Free Qwen 3 model for text queries     |
| OpenGVLab        | AI model for medicine image recognition|

---

## 🧰 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mwaris390/medicask.git
   cd medicask
2. **Install dependencies:**
   ```node
   npm install
   npx expo start
3. **Configure API keys**

   Create a .env file in the root with your API keys
   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   OPENGVLAB_API_KEY=your_opengvlab_key