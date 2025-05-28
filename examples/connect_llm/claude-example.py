import os
import re
import requests
import google.generativeai as genai
from daytona_sdk import Daytona, DaytonaConfig
from dotenv import load_dotenv

load_dotenv()

daytona = Daytona(DaytonaConfig())
sandbox = daytona.create()

def get_gemini_response(api_key, prompt):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash') # Using gemini-1.5-flash as it's a fast and cost-effective model

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"

prompt = "Python code that returns the factorial of 25. Output only the code. No explanation. No intro. No comments. Just raw code in a single code block."

result = get_gemini_response(os.environ["GEMINI_API_KEY"], prompt)

# Gemini might not always return in a code block, so handle raw text as well
code_match = re.search(r"```python\n(.*?)```", result, re.DOTALL)
code = code_match.group(1) if code_match else result.strip()
code = code.replace('\\', '\\\\')

# Run Python code inside the Sandbox and get the output
response = sandbox.process.code_run(code)
print("The factorial of 25 is", response.result)