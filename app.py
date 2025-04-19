from flask import Flask, request, jsonify
from flask_cors import CORS  # Added CORS support
from langchain_community.llms import LlamaCpp
from fuzzywuzzy import process
import json
import os
import gc
app = Flask(__name__)
CORS(app)  # Enable CORS

# Load FAQ dataset
dataset_path = "dataset.json"
if not os.path.exists(dataset_path):
    raise FileNotFoundError(f"Dataset file not found: {dataset_path}")

with open(dataset_path, "r", encoding="utf-8") as file:
    faq_data = json.load(file)

# Load Llama model
model_path = "C:/Users/DELL/OneDrive/Desktop/VITIQ/llama-2-7b.Q2_K.gguf"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Llama model file not found: {model_path}")

llm = LlamaCpp(model_path=model_path)

def get_answer(user_query):
    """Fetch answer from dataset using fuzzy matching, else use Llama model."""
    
    # Extract all questions from dataset
    questions = [faq["question"] for faq in faq_data["VIT_Bhopal_FAQ"]]
    
    # Find the best match for the user question
    best_match, score = process.extractOne(user_query, questions)
    

    if score > 80:                                          # If the match is good (above 70% similarity), return the answer
        for faq in faq_data["VIT_Bhopal_FAQ"]:
            if faq["question"] == best_match:
                return faq["answer"]                        # If no good match, fall back to Llama model
    response = llm.invoke(user_query, max_tokens=50)
    gc.collect()

    return response if response else "I'm sorry, but I don't have information on that. Please check the official VIT Bhopal website."


@app.route("/chat", methods=["POST"])  # Changed route from "/chatbot" to "/chat"
def chat():
    """Handle chatbot API requests."""
    data = request.get_json()
    print("Received data:", data)  # Debugging print

    user_query = data.get("question", "").strip()
    if not user_query:
        return jsonify({"error": "No question provided"}), 400

    response = get_answer(user_query)
    print("Response:", response)  # Debugging print
    return jsonify({"answer": response})

if __name__ == "__main__":
    app.run(debug=True)