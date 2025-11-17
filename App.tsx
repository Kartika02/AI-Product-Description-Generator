import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ChatWindow } from './components/ChatWindow';
import { LanguageSelector } from './components/LanguageSelector';
import { analyzeImageAndGenerateCopy, continueChat } from './services/geminiService';
import { SparklesIcon } from './components/Icons';
import type { Message, GroundingChunk } from './types';
import { translations, Language } from './i18n';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [language, setLanguage] = useState<Language>('id');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = useCallback(async (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessages([]);
    setSources([]);
    setError(null);
    setIsLoading(true);

    try {
      const base64Image = await fileToBase64(file);
      const initialCopy = await analyzeImageAndGenerateCopy(base64Image, file.type, language);
      setMessages([{ role: 'model', parts: [{ text: initialCopy }] }]);
    } catch (err) {
      console.error(err);
      setError(translations.errorAnalyze[language]);
    } finally {
      setIsLoading(false);
    }
  }, [language]);
  
  const handleSendMessage = useCallback(async (message: string, searchEnabled: boolean) => {
    const newUserMessage: Message = { role: 'user', parts: [{ text: message }] };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    setError(null);
    setSources([]);

    try {
      const { text, sources: newSources } = await continueChat(messages, message, searchEnabled, language);
      setMessages([...currentMessages, { role: 'model', parts: [{ text }] }]);
      setSources(newSources);
    } catch (err) {
      console.error(err);
      setError(translations.errorResponse[language]);
      // Revert optimistic update on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, language]);


  return (
    <div className="h-screen w-screen p-4 sm:p-6 lg:p-8 flex flex-col font-sans">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 text-indigo-400 mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{translations.headerTitle[language]}</h1>
        </div>
        <LanguageSelector language={language} setLanguage={setLanguage} />
      </header>
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <section className="flex flex-col">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">{translations.uploadHeader[language]}</h2>
          <div className="flex-1 min-h-[200px] lg:min-h-0">
             <ImageUploader 
                onImageUpload={handleImageUpload} 
                imagePreviewUrl={imagePreview}
                texts={{
                    uploadPlaceholderTitle: translations.uploadPlaceholderTitle[language],
                    uploadPlaceholderSubtitle: translations.uploadPlaceholderSubtitle[language],
                    orSeparator: translations.orSeparator[language],
                    useCameraButton: translations.useCameraButton[language],
                    changeImageButton: translations.changeImageButton[language],
                    retakeWithCameraButton: translations.retakeWithCameraButton[language],
                }}
             />
          </div>
        </section>
        
        <section className="flex flex-col">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">{translations.chatHeader[language]}</h2>
          <div className="flex-1 min-h-[300px] lg:min-h-0">
            {imagePreview ? (
              <ChatWindow 
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                useSearch={useSearch}
                setUseSearch={setUseSearch}
                sources={sources}
                texts={{
                    chatInputPlaceholder: translations.chatInputPlaceholder[language],
                    toggleSearchTooltip: translations.toggleSearchTooltip[language],
                    sourcesTitle: translations.sourcesTitle[language],
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-500 text-center p-4">
                 <SparklesIcon className="w-16 h-16 mb-4"/>
                 <h3 className="text-xl font-semibold">{translations.chatPlaceholderTitle[language]}</h3>
                 <p>{translations.chatPlaceholderSubtitle[language]}</p>
              </div>
            )}
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
