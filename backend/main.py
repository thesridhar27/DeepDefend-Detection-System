from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from datetime import datetime
from io import BytesIO
import base64
import tempfile
import os
import pymysql
import tensorflow as tf
import numpy as np
from PIL import Image

import resampy

# PDF export
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet

# ─────────────────────────────────────────────
# App & CORS
# ─────────────────────────────────────────────
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# DB
# ─────────────────────────────────────────────
def get_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="sridhara",
        database="dds",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )

# Make sure your table is like this (run once in MySQL):
# ALTER TABLE scan_history
#   MODIFY scanned_content LONGBLOB NULL,
#   ADD COLUMN IF NOT EXISTS mime_type VARCHAR(64) NULL;

# ─────────────────────────────────────────────
# TEXT HISTORY SAVE
# ─────────────────────────────────────────────
class TextScanRecord(BaseModel):
    email: str
    label: str
    confidence: float
    scanned_content: str

@app.post("/save-text-history")
async def save_text_history(record: TextScanRecord):
    try:
        content_bytes = (record.scanned_content or "").encode("utf-8")
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO scan_history
                   (email, scan_type, label, confidence, timestamp, scanned_content, mime_type)
                   VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                (record.email, "text", record.label, record.confidence, datetime.now(), content_bytes, "text/plain"),
            )
            conn.commit()
        conn.close()
        return {"message": "Text scan history saved."}
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)


# Add this entire new function to main.py
import uuid
import shutil
from pathlib import Path
@app.get("/get-scan-content/{item_id}")
def get_scan_content(item_id: int):
    try:
        conn = get_db()
        with conn.cursor() as cur:
            # Fetch the filename (which now stores the path)
            cur.execute(
                "SELECT filename, mime_type FROM scan_history WHERE id=%s",
                (item_id,)
            )
            result = cur.fetchone()
        conn.close()

        if not result or not result["filename"]:
            return JSONResponse({"error": "Content not found"}, 404)

        file_path = result["filename"]
        
        # Check if the file exists on disk
        if not os.path.exists(file_path):
             return JSONResponse({"error": "File not found on server"}, 404)

        # Use FileResponse to efficiently stream the file
        return FileResponse(path=file_path, media_type=result["mime_type"])
        
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)

# ─────────────────────────────────────────────
# HISTORY (base64 encode for frontend)
# ─────────────────────────────────────────────
from fastapi.responses import JSONResponse, FileResponse, Response
@app.get("/history/{email}")
def get_history(email: str):
    try:
        conn = get_db()
        with conn.cursor() as cur:
            # 👇 FIX 1: Add 'filename' to the SELECT statement
            cur.execute("""
                SELECT id,email,scan_type,label,confidence,timestamp,scanned_content,mime_type,filename
                FROM scan_history
                WHERE LOWER(email)=%s
                ORDER BY timestamp DESC
            """, (email.lower(),))
            rows = cur.fetchall()
        conn.close()

        out = []
        for r in rows:
            content_bytes = r["scanned_content"] or b""
            mime = r.get("mime_type") or ""

            if r["scan_type"] == "text":
                content_str = content_bytes.decode("utf-8", errors="ignore")
                scanned_content = content_str
            elif r["scan_type"] == "video":
                scanned_content = None # Don't send large video files in the main list
            else: # This handles audio and image
                scanned_content = base64.b64encode(content_bytes).decode("utf-8")

            out.append({
                "id": r["id"],
                "email": r["email"],
                "scan_type": r["scan_type"],
                "label": r["label"],
                "confidence": float(r["confidence"]),
                "timestamp": r["timestamp"].isoformat(),
                "scanned_content": scanned_content,
                "mime_type": mime,
                # 👇 FIX 2: Add the filename to the JSON response
                "filename": r.get("filename")
            })
        return {"history": out}
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)



# ─────────────────────────────────────────────
# DELETE
# ─────────────────────────────────────────────
@app.delete("/delete-history/{item_id}")
def delete_history_item(item_id: int):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Step 1: Get the filename before deleting the record
            cur.execute("SELECT filename FROM scan_history WHERE id=%s", (item_id,))
            result = cur.fetchone()

            # Step 2: If a file path exists, delete the file from the server
            if result and result.get("filename"):
                file_path = result["filename"]
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        print(f"Deleted file: {file_path}")
                    except OSError as e:
                        # Log the error but don't stop the process
                        print(f"Error deleting file {file_path}: {e}")

            # Step 3: Delete the record from the database
            cur.execute("DELETE FROM scan_history WHERE id=%s", (item_id,))
            conn.commit()
        
        return {"message": "Deleted"}
    except Exception as e:
        conn.rollback()
        return JSONResponse({"error": str(e)}, 500)
    finally:
        conn.close()

@app.delete("/delete-all-history/{email}")
def delete_all_history(email: str):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Step 1: Get all filenames for the user
            cur.execute("SELECT filename FROM scan_history WHERE email=%s", (email,))
            results = cur.fetchall()

            # Step 2: Loop through and delete each associated file
            for row in results:
                if row and row.get("filename"):
                    file_path = row["filename"]
                    if os.path.exists(file_path):
                        try:
                            os.remove(file_path)
                            print(f"Deleted file: {file_path}")
                        except OSError as e:
                            print(f"Error deleting file {file_path}: {e}")

            # Step 3: Delete all database records for that user
            cur.execute("DELETE FROM scan_history WHERE email=%s", (email,))
            conn.commit()

        return {"message": "All history deleted"}
    except Exception as e:
        conn.rollback()
        return JSONResponse({"error": str(e)}, 500)
    finally:
        conn.close()

# ─────────────────────────────────────────────
# PDF EXPORT (images embedded, text included; audio noted)
# ─────────────────────────────────────────────
@app.get("/export-history-pdf/{email}")
def export_history_pdf(email: str):
    try:
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute("""
            SELECT id,email,scan_type,label,confidence,timestamp,scanned_content,mime_type,filename
            FROM scan_history
            WHERE LOWER(email)=%s
            ORDER BY timestamp DESC
        """, (email.lower(),)) # Add filename to SELECT
        rows = cur.fetchall()
        conn.close()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_path = tmp.name

        styles = getSampleStyleSheet()
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        elements = []
        elements.append(Paragraph(f"DeepDefend Scan History for {email}", styles["Heading1"]))
        elements.append(Paragraph(datetime.now().strftime("Generated on %Y-%m-%d %H:%M:%S"), styles["Normal"]))
        elements.append(Spacer(1, 12))

        for r in rows:
          elements.append(Paragraph(f"<b>Type:</b> {r['scan_type']}", styles["Normal"]))
          elements.append(Paragraph(f"<b>Label:</b> {r['label']}", styles["Normal"]))
          elements.append(Paragraph(f"<b>Confidence:</b> {r['confidence']}%", styles["Normal"]))
          elements.append(Paragraph(f"<b>Timestamp:</b> {r['timestamp']}", styles["Normal"]))

          if r["scan_type"] == "text":
              try:
                  text = r["scanned_content"].decode("utf-8", errors="replace")
              except Exception:
                  text = "[unreadable text bytes]"
              elements.append(Paragraph(f"<b>Content:</b> {text}", styles["Normal"]))

          elif r["scan_type"] == "image":
              try:
                  tmp_img = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
                  tmp_img.write(r["scanned_content"])
                  tmp_img.close()
                  elements.append(RLImage(tmp_img.name, width=180, height=180))
              except Exception:
                  elements.append(Paragraph("[Image decode error]", styles["Normal"]))

          elif r["scan_type"] == "audio":
              elements.append(Paragraph("[Audio stored – not playable in PDF]", styles["Italic"]))
              # 👇 ADD THIS LOGIC TO INCLUDE THE FILENAME 👇
              if r.get("filename"): 
                  elements.append(Paragraph(f"<b>Filename:</b> {r['filename']}", styles["Normal"]))

          elif r["scan_type"] == "video": # 👇 ADD THIS LOGIC FOR VIDEO
                elements.append(Paragraph("[Video stored – not playable in PDF]", styles["Italic"]))
                if r.get("filename"):
                    elements.append(Paragraph(f"<b>Filename:</b> {r['filename']}", styles["Normal"]))

          elements.append(Spacer(1, 12))

        doc.build(elements)
        return FileResponse(pdf_path, media_type="application/pdf", filename="deepdefend_scan_history.pdf")

    except Exception as e:
        print("❌ PDF export error:", e)
        return JSONResponse({"error": str(e)}, 500)

# ─────────────────────────────────────────────
# AUDIO MODEL
# ─────────────────────────────────────────────
try:
    # ⚠️ Make sure your audio model is in a 'model' subfolder
    audio_model = tf.keras.models.load_model("model/deepfake_audio_detector_v4.h5")
    print("✅ Audio model loaded successfully.")
except Exception as e:
    print(f"❌ Audio model load failed: {e}")
    audio_model = None

# This function must be identical to the one you used for training
def preprocess_audio(audio_bytes: bytes, max_pad_len=174):
    import librosa
    try:
        # Load audio from bytes
        audio, sample_rate = librosa.load(BytesIO(audio_bytes), res_type='kaiser_fast')

        # Create Mel-spectrogram
        spectrogram = librosa.feature.melspectrogram(y=audio, sr=sample_rate, n_mels=128)
        log_spectrogram = librosa.power_to_db(spectrogram, ref=np.max)

        # Pad or truncate for fixed input size
        if log_spectrogram.shape[1] > max_pad_len:
            log_spectrogram = log_spectrogram[:, :max_pad_len]
        else:
            padding = max_pad_len - log_spectrogram.shape[1]
            log_spectrogram = np.pad(log_spectrogram, pad_width=((0, 0), (0, padding)), mode='constant')

        # Add channel and batch dimensions for the model
        log_spectrogram = log_spectrogram.reshape(1, *log_spectrogram.shape, 1)
        return log_spectrogram
    except Exception as e:
        print(f"Audio preprocessing error: {e}")
        return None

@app.post("/predict-audio")
async def predict_audio(
    file: UploadFile = File(...),
    email: str = Form(...),
):
    if audio_model is None:
        return JSONResponse({"error": "Audio model not loaded"}, 500)
    try:
        data = await file.read()
        x = preprocess_audio(data)
        if x is None:
             return JSONResponse({"error": "Failed to process audio file."}, 400)

        # Predict and determine label/confidence
        y = audio_model.predict(x)[0][0]
        p = float(y)
        label = "Fake" if p > 0.5 else "Real"
        print(f"RAW PREDICTION VALUE (p): {p}")
        conf = round((p if label == "Fake" else 1 - p) * 100, 2)

        # Save to database
        conn = get_db()
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO scan_history
                   (email, scan_type, label, confidence, timestamp, scanned_content, mime_type, filename)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", # Add filename to columns
                (email, "audio", label, conf, datetime.now(), data, file.content_type or "audio/wav", file.filename), # Add file.filename to values
            )
            conn.commit()
        conn.close()
        return {"label": label, "confidence": conf}

    except Exception as e:
        print(f"❌ Audio predict error: {e}")
        return JSONResponse({"error": f"Prediction failed: {e}"}, 500)
    
from flask import Flask, request, jsonify

@app.get("/history-summary/{email}")
def get_history_summary(email: str):
    conn = get_db()
    if not conn:
        return JSONResponse({"error": "Database connection failed"}, 500)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """SELECT scan_type, COUNT(*) as count 
                   FROM scan_history 
                   WHERE email=%s 
                   GROUP BY scan_type""",
                (email,)
            )
            summary = cur.fetchall()
        return {"summary": summary}
    except Exception as e:
        return JSONResponse({"error": str(e)}, 500)
    finally:
        conn.close()

@app.delete("/internal/delete-history/{email}")
def delete_internal_history(email: str):
    conn = get_db()
    if not conn:
        return JSONResponse({"error": "Database connection failed"}, 500)
    try:
        with conn.cursor() as cur:
            # Step 1: Get all file paths for the user
            cur.execute("SELECT filename FROM scan_history WHERE email = %s", (email,))
            results = cur.fetchall()
            
            # Step 2: Loop through and delete each file
            for row in results:
                if row and row.get("filename"):
                    file_path = row["filename"]
                    if os.path.exists(file_path) and file_path.startswith('uploads/'):
                        os.remove(file_path)

            # Step 3: Delete the user's scan history from the database
            cur.execute("DELETE FROM scan_history WHERE email = %s", (email,))
            conn.commit()

        return {"message": f"History and files for {email} deleted successfully."}
    except Exception as e:
        conn.rollback()
        return JSONResponse({"error": str(e)}, 500)
    finally:
        conn.close()