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
https://drive.google.com/file/d/14Mo2deaYPzJioJwtv_OO4IrNTbsYRmFF


Place them inside:

```
backend/model/
```

---

## 📸 Screenshots
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/63fe9044-3fd6-4764-a983-ca51911dff8a" />
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/a5fd2da2-472f-4536-b072-47e709ffe445" />
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/8cfd892c-37c4-424d-a3f7-fe2ae7bb5875" /> 
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/23dbacd3-e7bd-4ab2-8d23-58f0a9c908e1" />
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/11b7d435-86ad-42e2-9ce6-eee9044d523e" />
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/23f275be-cfc1-44d2-baba-8c9bb68fb5c8" />
<img width="509" height="375" alt="image" src="https://github.com/user-attachments/assets/ee52ed74-97ea-4ff9-98e7-7873bf349fc0" />

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
