# AI Agents in Logo Animator Studio

This document details the AI-powered agents that drive the core functionalities of the Logo Animator Studio application. These agents leverage Google's generative AI models to transform user ideas into visual media.

## 1. Logo Generation Agent

This agent is responsible for creating static logo images from textual descriptions. It acts as a digital artist, interpreting the user's creative vision and rendering it as a high-quality image.

-   **Purpose**: To generate a unique, custom logo based on a user's descriptive prompt.
-   **Model**: `imagen-4.0-generate-001`
-   **Triggers**: This agent is activated when the user is in "Generate Logo" mode and clicks the "Generate Logo" button.
-   **Inputs**:
    -   `prompt` (string): A detailed text description of the desired logo (e.g., "A minimalist logo for a tech startup called 'Innovate', featuring a stylized brain and circuits, in blue and silver.").
    -   `aspectRatio` ("1:1" | "16:9" | "9:16" | "4:3" | "3:4"): The desired aspect ratio for the output image.
-   **Outputs**:
    -   A Base64 encoded string representing the generated JPEG image. This string is then formatted into a data URL (`data:image/jpeg;base64,...`) for display in the browser.
-   **Workflow**:
    1.  The user provides a prompt and selects an aspect ratio in the UI.
    2.  The `handleGenerateLogo` function in `App.tsx` calls the `generateLogo` service.
    3.  The `generateLogo` service in `geminiService.ts` makes an API call to the `imagen-4.0-generate-001` model.
    4.  The model returns the image data as a Base64 string.
    5.  The service returns this string to the `App` component, which stores it in its state and renders the image.

---

## 2. Video Animation Agent

This agent takes a static source image and animates it based on a textual description, creating a short, dynamic video clip. It functions as a digital animator, adding motion and life to a still picture.

-   **Purpose**: To create an animated video from a source image (either generated or uploaded) and an animation prompt.
-   **Model**: `veo-3.1-fast-generate-preview`
-   **Triggers**: This agent is activated when a source image is present and the user clicks the "Create Animation" button.
-   **Prerequisites**: This agent requires the user to select a billed API key via the `window.aistudio.openSelectKey()` dialog, as Veo is a premium service. The application enforces this check before allowing the animation process to begin.
-   **Inputs**:
    -   `prompt` (string): A description of the desired animation (e.g., "The circuits in the logo light up sequentially, and the brain pulses with a soft blue glow.").
    -   `imageBase64` (string): The Base64 encoded data of the source image.
    -   `mimeType` (string): The MIME type of the source image (e.g., `image/jpeg`, `image/png`), which is dynamically extracted from the image's data URL.
    -   `aspectRatio` ("16:9" | "9:16"): The desired aspect ratio for the output video (landscape or portrait).
-   **Outputs**:
    -   A temporary, secure video URI pointing to the generated MP4 file.
    -   The application then fetches this URI, creates a client-side `Blob`, and generates a `blob URL` which is used as the `src` for the HTML `<video>` element for playback.
-   **Workflow**:
    1.  The user provides an animation prompt and selects a video aspect ratio.
    2.  The `handleAnimate` function in `App.tsx` is triggered. It first re-validates that an API key is selected.
    3.  The function extracts the Base64 data and MIME type from the source image data URL.
    4.  It calls the `animateImage` service, which initiates a video generation task with the `veo-3.1-fast-generate-preview` model.
    5.  Since video generation is a long-running operation, the `animateImage` service polls the operation's status every 10 seconds until it is complete. During this time, the UI displays a sequence of reassuring messages to the user.
    6.  Once complete, the service returns the video's download URI.
    7.  The `App` component fetches the video from the URI, creates a blob URL, and updates its state to display the video player.
