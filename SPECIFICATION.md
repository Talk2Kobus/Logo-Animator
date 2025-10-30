
# Logo Animator Studio - Software Specification

## 1. Introduction

This document provides a detailed specification for the **Logo Animator Studio** application. It outlines the functional and non-functional requirements, user stories, UI/UX design principles, and technical details regarding API integrations. The purpose of this document is to serve as a single source of truth for developers, designers, and stakeholders.

---

## 2. User Stories

-   **As a startup founder**, I want to generate a logo from a text description so that I can quickly create a unique brand identity without needing a designer.
-   **As a graphic designer**, I want to upload my own static logo design and animate it so that I can create engaging video content for marketing materials.
-   **As a content creator**, I want to specify the aspect ratio for my generated images and videos so that they are perfectly formatted for different social media platforms (e.g., 16:9 for YouTube, 9:16 for Reels/Shorts).
-   **As a new user**, I want to be clearly prompted to select a billed API key for video generation so that I understand the requirements and can proceed without errors.
-   **As any user**, I want to see clear loading indicators and status messages during the generation processes so that I know the application is working and I don't get frustrated by long waits.
-   **As any user**, I want to see clear and actionable error messages if something goes wrong so that I can understand the problem and how to fix it (e.g., an invalid API key).

---

## 3. Functional Requirements

### FR-1: API Key Management (Veo)
-   **FR-1.1**: The application MUST check for a pre-selected API key on load using `window.aistudio.hasSelectedApiKey()`.
-   **FR-1.2**: If no key is selected, the application MUST display a modal or view that blocks the main UI.
-   **FR-1.3**: This view MUST explain that a billed API key is required for video generation and include a link to the billing documentation.
-   **FR-1.4**: A "Select API Key" button MUST be present, which, when clicked, calls `window.aistudio.openSelectKey()`.
-   **FR-1.5**: The application MUST handle potential errors during the key selection process.
-   **FR-1.6**: The application MUST re-check for the key's validity if an API call fails with a "not found" error, prompting the user to select a new key if necessary.

### FR-2: Image Source Selection
-   **FR-2.1**: The user MUST be able to choose between two modes: "Generate Logo" and "Upload Image".
-   **FR-2.2**: Switching modes MUST clear the state of the other mode (e.g., switching to "Upload" clears the previously generated logo).

### FR-3: Logo Generation
-   **FR-3.1**: The UI MUST provide a textarea for the user to input a text prompt for the logo.
-   **FR-3.2**: The user MUST be able to select an image aspect ratio from a predefined list (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`).
-   **FR-3.3**: A "Generate Logo" button MUST trigger the image generation process. This button MUST be disabled during generation.
-   **FR-3.4**: The application MUST display a loading state in the result panel while the image is being generated.
-   **FR-3.5**: The generated image MUST be displayed in the result panel upon success.

### FR-4: Image Upload
-   **FR-4.1**: The UI MUST provide a file input or drag-and-drop area for image uploads.
-   **FR-4.2**: The component MUST validate that the uploaded file is an image (`image/*`).
-   **FR-4.3**: A preview of the uploaded image MUST be shown.
-   **FR-4.4**: The uploaded image data MUST be converted to a Base64 data URL and stored in the application's state.

### FR-5: Video Animation
-   **FR-5.1**: The animation controls section MUST only be visible after an image has been generated or uploaded.
-   **FR-5.2**: The UI MUST provide a textarea for the user to input a text prompt for the animation.
-   **FR-5.3**: The user MUST be able to select a video aspect ratio (`16:9` or `9:16`).
-   **FR-5.4**: A "Create Animation" button MUST trigger the video generation process. This button MUST be disabled during generation.
-   **FR-5.5**: The application MUST display a prominent loading state with cycling status messages while the video is being generated.
-   **FR-5.6**: Upon successful generation, the video MUST be displayed in an HTML5 `<video>` player with standard controls (`controls`, `autoplay`, `loop`).

### FR-6: Error Handling
-   **FR-6.1**: All API call errors MUST be caught and displayed to the user in a designated error area.
-   **FR-6.2**: User input errors (e.g., empty prompts) MUST be handled client-side and display an appropriate message.

---

## 4. Non-Functional Requirements

-   **NFR-1 (Performance)**: The UI must remain responsive during API calls. Loading states must be used to provide immediate feedback.
-   **NFR-2 (Usability)**: The application must have a clean, intuitive, and single-page interface. The design must be responsive and adapt to screen sizes from mobile to desktop.
-   **NFR-3 (Security)**: The API key is managed by the environment (`process.env.API_KEY`) and should not be stored or exposed in the client-side code directly, other than its use in the API client instantiation.
-   **NFR-4 (Compatibility)**: The application must function correctly on the latest versions of major web browsers (Chrome, Firefox, Safari, Edge).

---

## 5. UI/UX Design

-   **Layout**: A two-column layout on larger screens. The left column contains all user controls (source selection, prompts, buttons), and the right column is dedicated to displaying the output (image or video). On smaller screens, the columns stack vertically.
-   **Color Scheme**: A dark theme (`bg-gray-900`) with accent colors (indigo, purple) to create a modern, professional feel.
-   **State Management**:
    -   **Initial State**: The user is presented with Step 1 (Choose Source). The result panel shows a placeholder.
    -   **Loading State**: Buttons are disabled, and spinners are displayed. The result panel shows a larger spinner and a status message.
    -   **Success State**: The generated image or video is displayed in the result panel. Step 2 (Animate) becomes visible after the image is ready.
    -   **Error State**: An error message is displayed prominently above the result panel.

---

## 6. API Integration Details

### 6.1 Image Generation (`generateLogo`)
-   **Service**: `@google/genai`
-   **Model**: `imagen-4.0-generate-001`
-   **Method**: `ai.models.generateImages`
-   **Key Parameters**:
    -   `prompt`: User-provided text.
    -   `config.numberOfImages`: `1`
    -   `config.outputMimeType`: `image/jpeg`
    -   `config.aspectRatio`: User-selected aspect ratio.

### 6.2 Video Generation (`animateImage`)
-   **Service**: `@google/genai`
-   **Model**: `veo-3.1-fast-generate-preview`
-   **Method**: `ai.models.generateVideos` followed by polling with `ai.operations.getVideosOperation`.
-   **Key Parameters**:
    -   `prompt`: User-provided animation description.
    -   `image.imageBytes`: Base64 string of the source image.
    -   `image.mimeType`: Mime type of the source image (e.g., `image/jpeg`).
    -   `config.numberOfVideos`: `1`
    -   `config.resolution`: `720p`
    -   `config.aspectRatio`: User-selected video aspect ratio.
