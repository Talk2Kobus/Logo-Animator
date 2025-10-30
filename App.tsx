
import React, { useState, useEffect, useCallback } from 'react';
import { generateLogo, animateImage } from './services/geminiService';
import { VIDEO_GENERATION_MESSAGES } from './constants';
import { ImageUploader } from './components/ImageUploader';
import { Header } from './components/Header';
import { Spinner } from './components/Spinner';

type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
type VideoAspectRatio = "16:9" | "9:16";
type GenerationMode = 'generate' | 'upload';

// FIX: Removed conflicting global declaration for `window.aistudio` to resolve type errors.
// The type is provided by the execution environment, so a local declaration is not needed.

const App: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
    const [mode, setMode] = useState<GenerationMode>('generate');
    
    // Image state
    const [logoPrompt, setLogoPrompt] = useState<string>('A minimalist logo for a tech startup called "Innovate", featuring a stylized brain and circuits, in blue and silver.');
    const [imageAspectRatio, setImageAspectRatio] = useState<ImageAspectRatio>('1:1');
    const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
    const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    // Video state
    const [animationPrompt, setAnimationPrompt] = useState<string>('The circuits in the logo light up sequentially, and the brain pulses with a soft blue glow.');
    const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [videoStatus, setVideoStatus] = useState<string>('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // Fallback for when not in AI Studio environment
            console.warn('AI Studio environment not detected. Using placeholder for API key check.');
            setApiKeySelected(!!process.env.API_KEY);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    useEffect(() => {
        let interval: number;
        if (isGeneratingVideo) {
            setVideoStatus(VIDEO_GENERATION_MESSAGES[0]);
            let index = 1;
            interval = window.setInterval(() => {
                setVideoStatus(VIDEO_GENERATION_MESSAGES[index % VIDEO_GENERATION_MESSAGES.length]);
                index++;
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isGeneratingVideo]);
    
    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Assume success after opening dialog to avoid race condition
            setApiKeySelected(true); 
        } catch (e) {
            console.error('Error opening API key selection:', e);
            setError('Could not open API key selection dialog.');
        }
    };

    const handleGenerateLogo = async () => {
        if (!logoPrompt) {
            setError('Please enter a description for your logo.');
            return;
        }
        setIsGeneratingImage(true);
        setError(null);
        setGeneratedLogo(null);
        setGeneratedVideoUrl(null);
        try {
            const imageB64 = await generateLogo(logoPrompt, imageAspectRatio);
            setGeneratedLogo(`data:image/jpeg;base64,${imageB64}`);
        } catch (e) {
            console.error(e);
            setError('Failed to generate logo. Please try again.');
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const handleAnimate = async () => {
        const sourceImage = mode === 'generate' ? generatedLogo : uploadedImage;
        if (!sourceImage) {
            setError('Please generate or upload an image first.');
            return;
        }
        if (!animationPrompt) {
            setError('Please enter a prompt to describe the animation.');
            return;
        }

        // Re-check API key right before the call
        await checkApiKey();
        if (!apiKeySelected) {
            setError("API key is required for video generation. Please select one.");
            return;
        }

        setIsGeneratingVideo(true);
        setError(null);
        setGeneratedVideoUrl(null);

        try {
            // FIX: Dynamically extract the image mime type from the data URL to support various formats.
            const imageParts = sourceImage.split(',');
            const mimeType = imageParts[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
            const base64Data = imageParts[1];
            const videoUri = await animateImage(animationPrompt, base64Data, mimeType, videoAspectRatio);
            
            const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            if (!response.ok) throw new Error('Failed to fetch the generated video.');
            
            const videoBlob = await response.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(videoUrl);

        } catch (e: any) {
            console.error(e);
            let errorMessage = 'Failed to generate video. Please try again.';
            if (e.message && e.message.includes('Requested entity was not found')) {
                errorMessage = "Your API key is invalid. Please select a valid key and try again.";
                setApiKeySelected(false);
            }
            setError(errorMessage);
        } finally {
            setIsGeneratingVideo(false);
            setVideoStatus('');
        }
    };
    
    const sourceImage = mode === 'generate' ? generatedLogo : uploadedImage;

    if (!apiKeySelected) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                 <div className="w-full max-w-2xl mx-auto text-center">
                    <Header />
                    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">API Key Required</h2>
                        <p className="text-gray-300 mb-6">Video generation with Veo requires a Google Cloud project with billing enabled. Please select your API key to continue.</p>
                        <button
                            onClick={handleSelectKey}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Select API Key
                        </button>
                        <p className="text-xs text-gray-500 mt-4">
                            For more information, visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">billing documentation</a>.
                        </p>
                        {error && <p className="text-red-400 mt-4">{error}</p>}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Header />

                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Controls */}
                    <div className="flex flex-col gap-8">
                        {/* Step 1: Choose Source */}
                         <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-indigo-400 border-b border-gray-600 pb-2">Step 1: Choose Image Source</h2>
                            <div className="flex rounded-lg bg-gray-700 p-1">
                                <button onClick={() => { setMode('generate'); setUploadedImage(null); }} className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Generate Logo</button>
                                <button onClick={() => { setMode('upload'); setGeneratedLogo(null); }} className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Upload Image</button>
                            </div>

                            {mode === 'generate' && (
                                <div className="mt-4">
                                    <label htmlFor="logo-prompt" className="block text-sm font-medium text-gray-300 mb-2">Logo Description</label>
                                    <textarea
                                        id="logo-prompt"
                                        rows={4}
                                        value={logoPrompt}
                                        onChange={(e) => setLogoPrompt(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="e.g., A shield with a lion rampant..."
                                    />
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['1:1', '16:9', '9:16'] as ImageAspectRatio[]).map(ratio => (
                                                <button key={ratio} onClick={() => setImageAspectRatio(ratio)} className={`py-2 text-sm rounded-md transition-colors ${imageAspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                                    {ratio}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={handleGenerateLogo} disabled={isGeneratingImage} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                                        {isGeneratingImage && <Spinner />} {isGeneratingImage ? 'Generating...' : 'Generate Logo'}
                                    </button>
                                </div>
                            )}

                             {mode === 'upload' && (
                                <div className="mt-4">
                                    <ImageUploader onImageUpload={setUploadedImage} />
                                </div>
                            )}
                         </div>

                         {/* Step 2: Animate */}
                        {(generatedLogo || uploadedImage) && (
                             <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                                <h2 className="text-xl font-bold mb-4 text-indigo-400 border-b border-gray-600 pb-2">Step 2: Animate Your Image</h2>
                                <label htmlFor="animation-prompt" className="block text-sm font-medium text-gray-300 mb-2">Animation Description</label>
                                <textarea
                                    id="animation-prompt"
                                    rows={3}
                                    value={animationPrompt}
                                    onChange={(e) => setAnimationPrompt(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder="e.g., The logo slowly zooms in with a subtle shimmer effect."
                                />
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Video Aspect Ratio</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['16:9', '9:16'] as VideoAspectRatio[]).map(ratio => (
                                            <button key={ratio} onClick={() => setVideoAspectRatio(ratio)} className={`py-2 text-sm rounded-md transition-colors ${videoAspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                                {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleAnimate} disabled={isGeneratingVideo} className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                                    {isGeneratingVideo && <Spinner />} {isGeneratingVideo ? 'Animating...' : 'Create Animation'}
                                </button>
                             </div>
                        )}
                    </div>

                    {/* Right Column: Display */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 sticky top-8">
                        <h2 className="text-xl font-bold mb-4 text-indigo-400 border-b border-gray-600 pb-2">Result</h2>
                        {error && <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        
                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center flex-col p-4">
                            {isGeneratingVideo && (
                                <div className="text-center">
                                    <Spinner large={true} />
                                    <p className="mt-4 text-gray-300">Generating your video...</p>
                                    <p className="text-sm text-gray-400 mt-2">{videoStatus}</p>
                                </div>
                            )}
                            {!isGeneratingVideo && generatedVideoUrl && (
                                <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full rounded-lg" />
                            )}
                             {!isGeneratingVideo && !generatedVideoUrl && (
                                <>
                                {isGeneratingImage && (
                                    <div className="text-center">
                                        <Spinner large={true} />
                                        <p className="mt-4 text-gray-300">Generating your logo...</p>
                                    </div>
                                )}
                                {!isGeneratingImage && sourceImage && (
                                     <img src={sourceImage} alt="Generated or Uploaded" className="max-w-full max-h-full object-contain rounded-lg" />
                                )}
                                {!isGeneratingImage && !sourceImage && (
                                    <div className="text-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="mt-2">Your generated content will appear here.</p>
                                    </div>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;