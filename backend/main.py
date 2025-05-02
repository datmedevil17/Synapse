from flask import Flask, render_template, request, jsonify
import requests
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_llama_text(prompt, url="http://provider.gpu.gpufarm.xyz:30190/api/generate"):
    try:
        r = requests.post(url, json={
            "prompt": prompt, 
            "stream": False, 
            "n_predict": 500, 
            "model": "llama3.2"
        }, timeout=10)
        r.raise_for_status()
        return r.json()["response"]
    except Exception as e:
        return f"Error: {e}"

def create_chat_prompt(personality, history, latest_message):
    # Extract personality details
    name = personality.get('name', 'AI Assistant')
    description = personality.get('description', '')
    memories = personality.get('memories', [])
    languages = personality.get('languages', [])

    # Build context from memories and previous chat history
    context = f"You are {name}. {description}\n\n"
    if memories:
        context += "Your memories and knowledge include:\n"
        for memory in memories:
            context += f"- {memory}\n"
    
    if languages:
        context += f"\nYou can communicate in: {', '.join(languages)}\n"

    # Add chat history
    if history:
        context += "\nPrevious conversation:\n"
        for msg in history:
            role = "User" if msg['role'] == 'user' else name
            context += f"{role}: {msg['message']}\n"

    # Add latest message
    context += f"\nUser: {latest_message}\n{name}:"

    return context

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        personality = data.get('personality', {})
        history = data.get('history', [])
        latest_message = data.get('latestMessage', '')

        if not latest_message:
            return jsonify({'error': 'No message provided'}), 400

        # Create prompt with personality and context
        prompt = create_chat_prompt(personality, history, latest_message)
        
        # Get response from LLaMA
        response = get_llama_text(prompt)
        
        # Clean up response
        cleaned_response = re.sub(r'\n+', '\n', response).strip()
        cleaned_response = cleaned_response.replace('"', '')
        
        # Remove potential name prefixes from response
        if personality.get('name'):
            cleaned_response = cleaned_response.replace(f"{personality['name']}:", '')
        cleaned_response = cleaned_response.strip()

        return jsonify({'response': cleaned_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)