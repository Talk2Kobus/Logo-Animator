
# Logo Animator Studio

**Bring your brand to life. From concept to animation.**

Logo Animator Studio is a powerful web application that leverages Google's state-of-the-art generative AI to help you design and animate logos. Whether you're a startup looking for a new brand identity or an artist wanting to add motion to your creations, this tool provides a seamless workflow from a simple idea to a finished video.

![Logo Animator Studio Screenshot](https://storage.googleapis.com/project-screenshots/logo-animator-studio.png)
*(A placeholder screenshot of the application UI)*

---

## ✨ Key Features

-   **AI-Powered Logo Generation**: Describe your ideal logo in plain English, and the `Imagen` model will generate a high-quality, unique image for you.
-   **Image Upload**: Already have a logo? Upload your own image to use it as a source for animation.
-   **Cinematic Video Animation**: Bring your static image to life. Describe the animation you want, and the `Veo` model will generate a stunning, high-definition video.
-   **Customizable Aspect Ratios**: Generate images and videos in various aspect ratios, perfect for social media, presentations, or websites (e.g., `1:1`, `16:9`, `9:16`).
-   **Seamless API Key Integration**: A guided flow helps you select your billed Google Cloud API key, a requirement for using the powerful Veo video model.
-   **Responsive Design**: A clean, modern, and fully responsive user interface that works beautifully on any device.

---

## 🚀 Technology Stack

-   **Frontend**: [React](https://react.dev/) (with Hooks) & [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI Models**:
    -   **Image Generation**: Google `imagen-4.0-generate-001`
    -   **Video Generation**: Google `veo-3.1-fast-generate-preview`
-   **API Client**: [`@google/genai`](https://www.npmjs.com/package/@google/genai)
-   **Build/Module System**: ES Modules via Import Maps (no build step required)

---

## 🛠️ Setup and Installation

This project is designed to run in a browser-based environment with ES Modules and does not require a traditional build step (like Vite or Webpack).

**Prerequisites:**
-   A modern web browser (e.g., Chrome, Firefox, Edge).
-   A Google Cloud project with billing enabled to use the Veo video generation model.

**Running the Application:**
1.  **Clone the repository (or download the files):**
    ```bash
    git clone https://github.com/your-username/logo-animator-studio.git
    cd logo-animator-studio
    ```
2.  **Set up the API Key:**
    The application is designed to work with an injected `process.env.API_KEY`. In development environments where this is not available, you can simulate it or use a tool that provides this, like the AI Studio environment. For local development outside of such an environment, you may need to use a simple local server and manually manage your key.

3.  **Serve the files:**
    You can use a simple local web server to run the project. The `live-server` VS Code extension or a simple Python server works well.
    ```bash
    # Using Python 3
    python -m http.server
    ```
4.  **Open in browser:**
    Navigate to `http://localhost:8000` (or the port provided by your server).

---

## 📖 Usage

1.  **API Key Selection**: If you have not already selected an API key for video generation, the application will prompt you to do so first. Click "Select API Key" and follow the dialog.
2.  **Choose Image Source**:
    -   Select **"Generate Logo"** to create a new image from a text description.
    -   Select **"Upload Image"** to use an existing image file from your device.
3.  **Generate or Upload**:
    -   **If generating**: Enter a detailed description of your desired logo, select an aspect ratio, and click "Generate Logo".
    -   **If uploading**: Click the upload area and select an image file.
4.  **Animate**: Once you have an image, the "Animate Your Image" section will appear.
    -   Enter a description of how you want the image to animate (e.g., "The sun slowly rises behind the mountains").
    -   Choose a video aspect ratio (Landscape or Portrait).
    -   Click "Create Animation".
5.  **View Result**: The video generation process may take a few minutes. The application will display status messages. Once complete, the final video will appear in the result panel, where you can play it.
