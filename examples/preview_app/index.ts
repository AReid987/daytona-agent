import { Daytona } from '@daytonaio/sdk';
const daytona = new Daytona(({
  apiKey: "YOUR_API_KEY"
}));

async function main() {
  const sandbox = await daytona.create();

  const appCode = `from flask import Flask\napp = Flask(__name__)\n@app.route('/')\ndef hello():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Hello World</title>
        <link rel="icon" href="https://www.daytona.io/favicon.ico">
    </head>
    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #0a0a0a; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 2rem; border-radius: 10px; background-color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <img src="https://raw.githubusercontent.com/daytonaio/daytona/main/assets/images/Daytona-logotype-black.png" alt="Daytona Logo" style="width: 180px; margin: 10px 0px;">
            <p>This web app is running in a Daytona sandbox!</p>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)  `;

  const fileContent = new File([appCode], "app.py")
  let rootDir = await sandbox.getUserRootDir();

  // Save the Flask app to a file
  await sandbox.fs.uploadFile(rootDir + "/app.py", fileContent);

  // Create a new session and execute a command
  const execSessionId = "python-app-session";
  await sandbox.process.createSession(execSessionId);

  await sandbox.process.executeSessionCommand(execSessionId, ({
    command: `python ${rootDir}/app.py`,
    async: true,
  }));

  // Get the preview link for the Flask app
  const previewInfo = sandbox.getPreviewLink(3000);
  console.log(`Flask app is available at: ${previewInfo.url}`);
}

main().catch(error => console.error("Error:", error));