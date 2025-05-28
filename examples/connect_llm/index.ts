import { Daytona } from '@daytonaio/sdk'
import * as dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const daytona = new Daytona()

async function getGeminiResponse(apiKey: string, prompt: string): Promise<string> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID; // Assuming project ID is in env
  const location = "us-central1"; // Using a common location
  const modelId = "gemini-1.5-flash"; // Using gemini-1.5-flash

  if (!projectId) {
    return "Error: GOOGLE_CLOUD_PROJECT_ID environment variable not set."
  }

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/generativeModels/${modelId}:generateContent`;
  const headers = {
    "Authorization": `Bearer ${apiKey}`, // Gemini API typically uses Bearer token
    "Content-Type": "application/json"
  }
  const data = {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          }
        ]
      }
    ],
     "generationConfig": {
        "maxOutputTokens": 256
    }
  }

  try {
    const response = await axios.post(url, data, { headers })
    if (response.status === 200) {
      // Extract text from Gemini API response
      const candidates = response.data.candidates || [];
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts.length > 0) {
        return candidates[0].content.parts[0].text;
      } else {
        return "Error: Unexpected response format from Gemini API."
      }
    } else {
      return `Error ${response.status}: ${response.statusText}`
    }
  } catch (error: any) {
    return `Error: ${error.message}`
  }
}

async function main() {
  const sandbox = await daytona.create()

  const prompt = "Python code that returns the factorial of 25. Output only the code. No explanation. No intro. No comments. Just raw code in a single code block."

  const result = await getGeminiResponse(process.env.GEMINI_API_KEY || "", prompt)

  // Extract code from the response using regex
  const codeMatch = result.match(/```python\n(.*?)```/s)
  let code = codeMatch ? codeMatch[1] : result
  code = code.replace(/\\\\/g, '\\\\\\\\')

  // Run the extracted code in the sandbox
  const response = await sandbox.process.codeRun(code)
  console.log("The factorial of 25 is", response.result)
}

main().catch(console.error)