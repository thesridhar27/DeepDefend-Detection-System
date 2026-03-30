# 🛡️ DeepDefend Detection System

An AI-powered system to detect **deepfake text and audio content** using advanced machine learning models and stylometric analysis.

---

## 🚀 Overview

DeepDefend is designed to identify whether a given **text or audio input is human-generated or AI-generated**.
With the rapid growth of AI-generated content, this system helps in detecting misinformation, impersonation, and synthetic media.

---

## ✨ Features

* 🔍 **Text Analysis**

  * Detect AI-generated text using stylometric features
  * Integration with GPT output detection tools

* 🎧 **Audio Analysis**

  * Detect deepfake audio using trained ML models
  * Supports audio file uploads for verification

* 📊 **Dashboard**

  * User-friendly interface to view results
  * Scan history tracking

* 🔐 **Authentication System**

  * User login & registration
  * OTP verification

---

## 🧠 Models Used

* XceptionNet-based deepfake detection model
* ASVspoof-inspired audio detection model
* Stylometric analyzers for text
* GPT output detection techniques

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Python (Flask/FastAPI)
* Node.js (for frontend integration)

### Machine Learning

* TensorFlow / Keras
* Pre-trained deepfake detection models

---

## 📁 Project Structure

```
DeepDefend/
│
├── backend/
│   ├── app.py
│   ├── main.py
│   ├── requirements.txt
│   └── model/   (excluded from GitHub)
│
├── public/
├── src/
│   ├── components/
│   ├── App.js
│   └── index.js
│
├── package.json
├── tailwind.config.js
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/thesridhar27/DeepDefend-Detection-System.git
cd DeepDefend-Detection-System
```

---

### 2️⃣ Install frontend dependencies

```bash
npm install
```

---

### 3️⃣ Setup backend

```bash
cd backend
pip install -r requirements.txt
```

---

### 4️⃣ Run the project

#### Start backend:

```bash Terminal 1
cd backend
python app.py
```
```bash Terminal 2
cd backend
uvicorn main:app --reload

#### Start frontend:

```bash
npm start
```

---

## 📥 Model Files

⚠️ Due to GitHub size limits, model files are not included.

👉 Download models from:
**[Add your Google Drive / HuggingFace link here]**

Place them inside:

```
backend/model/
```

---

## 📸 Screenshots

*Add your project screenshots here (Dashboard, Scan UI, etc.)*

---

## 🔮 Future Enhancements

* 🌐 Real-time detection API
* 📱 Mobile app integration
* 🧠 Improved AI detection accuracy
* ☁️ Cloud deployment

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork this repo and submit a pull request.

---

## 📜 License

This project is for educational and research purposes.

---

## 👨‍💻 Author

**Sridhar**
GitHub: https://github.com/thesridhar27

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
