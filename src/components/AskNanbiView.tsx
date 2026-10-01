import React, { useState, useEffect, useRef } from 'react';
import { Scheme, UserProfile } from '../data/schemes';
import { askGeminiAssistant, ChatMessage } from '../services/gemini';
import {
  voiceService,
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  requestMicrophonePermission,
  getMicrophonePermissionState,
  MicPermissionState,
} from '../services/voice';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  User,
  AlertCircle,
  HelpCircle,
  VolumeX,
} from 'lucide-react';

interface AskNanbiViewProps {
  userProfile: UserProfile;
  language: 'ta' | 'en';
  schemes: Scheme[];
  initialQuery?: string;
  onSelectScheme: (scheme: Scheme) => void;
}

export const AskNanbiView: React.FC<AskNanbiViewProps> = ({
  userProfile,
  language,
  schemes,
  initialQuery,
  onSelectScheme,
}) => {
  const isTamil = language === 'ta';
  const [inputText, setInputText] = useState(initialQuery || '');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check speech recognition capability on mount
  useEffect(() => {
    setHasSpeechSupport(isSpeechRecognitionSupported());
  }, []);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initialText = isTamil
        ? `வணக்கம் ${userProfile.name || 'தோழி'}! 🌸\n\nநான் உங்கள் அரசு தோழி "நண்பி".\nஉங்கள் வயது (${userProfile.ageGroup}) மற்றும் மாவட்டம் (${userProfile.district || 'தமிழ்நாடு'}) அடிப்படையில் உங்களுக்குப் பயன்படும் திட்டங்களை எளிய தமிழில் விளக்குகிறேன்.\n\nபெரிய மைக் பொத்தானை அழுத்திப் பேசுங்கள் அல்லது கீழே உள்ள கேள்விகளைத் தொடுங்கள்.`
        : `Hello ${userProfile.name || 'Friend'}! 🌸\n\nI am your government companion "NANBI".\nBased on your age group (${userProfile.ageGroup}) and district (${userProfile.district || 'Tamil Nadu'}), I explain schemes in simple language without complicated jargon.\n\nTap the large microphone to speak, or pick a question below.`;

      setMessages([
        {
          id: 'welcome-1',
          role: 'model',
          text: initialText,
          timestamp: new Date(),
        },
      ]);
    }
  }, [language, userProfile]);

  // If initialQuery passed from Home screen, execute it
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Quick suggestion prompts
  const quickQuestions = isTamil
    ? [
        'எனக்கு என்ன திட்டம் கிடைக்கும்?',
        'பெண்களுக்கான திட்டங்கள் என்ன?',
        'எப்படி விண்ணப்பிப்பது?',
        'என்ன documents வேண்டும்?',
        'கலைஞர் மகளிர் உரிமைத் திட்டம் விவரம் என்ன?',
      ]
    : [
        'What schemes are available for me?',
        'What are women-focused schemes?',
        'How do I apply?',
        'What documents are required?',
        'Tell me about Pudhumai Penn scheme',
      ];

  // Send message to Gemini and automatically read response using native speech synthesis
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isProcessing) return;

    // Stop ongoing recognition if any
    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    setSpeechError(null);

    // Call server-side Gemini
    const result = await askGeminiAssistant(
      textToSend.trim(),
      language,
      userProfile,
      null,
      messages
    );

    const modelMsg: ChatMessage = {
      id: `model-${Date.now()}`,
      role: 'model',
      text: result.text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, modelMsg]);
    setIsProcessing(false);

    // 6. Automatically offer/read the response using browser speech synthesis
    voiceService.speak(result.text, language);
  };

  // Toggle Native Browser Speech Recognition
  const toggleListening = async () => {
    if (isListening) {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);

    // Stop any ongoing speech playback
    voiceService.stop();

    // Check permission state before starting
    const currentPerm = await getMicrophonePermissionState();
    if (currentPerm !== 'granted') {
      const result = await requestMicrophonePermission();
      if (!result.granted) {
        setSpeechError(
          isTamil
            ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி முகவரிப் பட்டியில் உள்ள பூட்டு (🔒) ஐகானைத் தொட்டு மைக் அனுமதியை இயக்கவும் அல்லது கீழே தட்டச்சு செய்யவும்.'
            : 'Microphone permission was denied. Please allow microphone access in your browser or type below.'
        );
        return;
      }
    }

    const recognizer = createSpeechRecognizer(
      language, // ta-IN when Tamil, en-IN when English
      (transcript, isFinal) => {
        // Put text into the input field in real time
        setInputText(transcript);

        if (isFinal && transcript.trim()) {
          setIsListening(false);
          // Automatically send to Gemini
          handleSendMessage(transcript.trim());
        }
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
        if (error === 'not-allowed') {
          setSpeechError(
            isTamil
              ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி முகவரிப் பட்டியில் உள்ள பூட்டு (🔒) ஐகானைத் தொட்டு மைக் அனுமதியை அனுமதிக்கவும்.'
              : 'Microphone permission was denied. Please click the lock icon (🔒) in your address bar and allow microphone.'
          );
        } else {
          setSpeechError(
            isTamil
              ? 'குரல் பதிவு முடிவடைந்தது. கீழே தட்டச்சு செய்யவும் அல்லது மீண்டும் முயற்சிக்கவும்.'
              : 'Voice listening ended. Please type your query or try speaking again.'
          );
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognizer) {
      setHasSpeechSupport(false);
      setSpeechError(
        isTamil
          ? 'இந்த உலாவியில் மைக் ஆதரவு இல்லை. தயவுசெய்து கீழே தட்டச்சு செய்யவும்.'
          : 'Browser speech recognition is unavailable. Please type your question.'
      );
      inputRef.current?.focus();
      return;
    }

    try {
      recognizer.start();
      recognizerRef.current = recognizer;
      setIsListening(true);
    } catch (e) {
      console.warn('Failed to start recognizer:', e);
      setIsListening(false);
    }
  };

  const handlePlayVoice = (text: string) => {
    voiceService.speak(text, language);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto p-4 sm:p-6 pb-28">
      {/* Top Banner with Large Microphone Call-to-Action */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl p-5 sm:p-6 border-2 border-rose-200 shadow-sm mb-4 text-center space-y-4">
        <div>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-rose-600 text-white items-center justify-center text-2xl shadow-xs ring-2 ring-rose-200 mb-2">
            🌸
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            {isTamil ? 'நண்பியிடம் பேசுங்கள்' : 'Talk with NANBI'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-md mx-auto">
            {isTamil
              ? 'எந்தவொரு அரசு திட்டம் அல்லது ஆவணம் பற்றியும் உங்கள் சொந்த குரலில் கேட்கலாம்'
              : 'Ask any question in your voice — speech is recognized and answered in spoken voice'}
          </p>
        </div>

        {/* ================= LARGE MICROPHONE BUTTON ================= */}
        <div className="flex flex-col items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-bold transition-all shadow-lg active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-voice-ripple'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
            }`}
            title={isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
            aria-label="Activate voice microphone"
          >
            {isListening ? (
              <MicOff className="w-9 h-9 animate-pulse" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
            <span className="text-[10px] uppercase tracking-wider font-extrabold mt-1">
              {isListening
                ? isTamil
                  ? 'கேட்கிறது'
                  : 'Listening'
                : isTamil
                  ? 'பேசுக'
                  : 'Speak'}
            </span>
          </button>

          <p className="text-xs font-bold text-rose-700 mt-1">
            {isListening
              ? isTamil
                ? '🎙️ கேட்கிறேன்... தமிழில் பேசுங்கள்...'
                : '🎙️ Listening... speak now...'
              : isTamil
                ? '👆 மைக் பொத்தானை அழுத்திப் பேசவும்'
                : '👆 Tap the microphone to ask your question'}
          </p>

          <span className="text-[11px] text-stone-500 font-medium">
            {isTamil
              ? 'மொழி: தமிழ் (ta-IN) • குரல் பதில் இயங்கும்'
              : 'Language: English (en-IN) • Spoken response enabled'}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 text-sm mt-1">
                🌸
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-rose-600 text-white rounded-br-xs'
                  : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.role === 'model' && (
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    {isTamil ? 'உறுதிப்படுத்தப்பட்ட தகவல்' : 'Verified Advice'}
                  </span>
                  <button
                    onClick={() => handlePlayVoice(msg.text)}
                    className="p-1 rounded-md hover:bg-stone-100 text-stone-600 hover:text-rose-600 transition-colors flex items-center gap-1 font-bold text-[11px]"
                    title="Replay voice audio"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isTamil ? 'மீண்டும் கேட்க' : 'Listen'}</span>
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 text-sm mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 justify-start items-center text-xs text-stone-600 bg-white p-3.5 rounded-2xl border border-stone-200 w-fit animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              {isTamil
                ? 'நண்பி யோசித்து எளிய பதிலைத் தயார் செய்கிறார்...'
                : 'NANBI is preparing your explanation...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech Error Banner if any */}
      {speechError && (
        <div className="my-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="py-2.5 overflow-x-auto flex gap-2 no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-stone-200 hover:border-rose-400 hover:bg-rose-50 text-stone-700 whitespace-nowrap transition-colors shadow-2xs shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Text Input Fallback Area with Microphone shortcut */}
      <div className="bg-white rounded-3xl p-3 border-2 border-stone-200 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone in input bar */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl font-bold flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
            title={isListening ? 'Listening...' : 'Tap to speak'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? isTamil
                  ? 'கேட்கிறேன்... பேசுங்கள்...'
                  : 'Listening... please speak...'
                : isTamil
                  ? 'அல்லது கேள்வியை இங்கே தட்டச்சு செய்யவும்...'
                  : 'Or type your question here...'
            }
            className="flex-1 px-4 py-3 bg-stone-50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-stone-900 border border-stone-200"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs"
            title={isTamil ? 'அனுப்புக' : 'Send'}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
