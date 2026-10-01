import React, { useEffect, useState, useRef } from 'react';
import { UserProfile } from '../data/schemes';
import {
  voiceService,
  createSpeechRecognizer,
  requestMicrophonePermission,
  getMicrophonePermissionState,
  isSpeechRecognitionSupported,
  MicPermissionState,
} from '../services/voice';
import { askGeminiAssistant } from '../services/gemini';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  AlertCircle,
  Globe,
  Sparkles,
  Send,
  HelpCircle,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  language: 'ta' | 'en';
  userProfile: UserProfile;
  onClose: () => void;
  onLanguageChange: (lang: 'ta' | 'en') => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  language,
  userProfile,
  onClose,
  onLanguageChange,
}) => {
  const isTamil = language === 'ta';

  // State
  const [permissionState, setPermissionState] = useState<MicPermissionState>('prompt');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastUserSpeech, setLastUserSpeech] = useState<string>('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [textFallbackInput, setTextFallbackInput] = useState<string>('');

  const recognizerRef = useRef<any>(null);

  const handleStopAll = React.useCallback(() => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
      recognizerRef.current = null;
    }
    voiceService.stop();
    setIsListening(false);
    setIsProcessing(false);
  }, []);

  // When modal opens, inspect permission status without prompting prematurely
  useEffect(() => {
    if (!isOpen) {
      handleStopAll();
      return;
    }

    // Check if permission was already granted previously
    getMicrophonePermissionState().then((state) => {
      setPermissionState(state);
      setPermissionError(null);
    });

    const unsubscribe = voiceService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });

    return () => {
      unsubscribe();
      handleStopAll();
    };
  }, [isOpen, handleStopAll]);

  // Explicitly prompt user for microphone permission
  const handleRequestPermission = async () => {
    setPermissionError(null);
    const result = await requestMicrophonePermission();

    if (result.granted) {
      setPermissionState('granted');
      setPermissionError(null);
      // Auto-start listening once permission is granted
      startListening();
    } else {
      setPermissionState(result.status);
      setPermissionError(
        isTamil
          ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. முகவரிப் பட்டியில் உள்ள பூட்டு (🔒) ஐகானைத் தொட்டு மைக் அனுமதியை இயக்கிவிட்டு மீண்டும் முயற்சிக்கவும்.'
          : 'Microphone permission was denied. Please click the lock (🔒) icon in your browser address bar, allow microphone access, and click retry.'
      );
    }
  };

  // Start native speech recognition (ta-IN or en-IN)
  const startListening = async () => {
    handleStopAll();
    setPermissionError(null);

    // If permission state is prompt or unknown, request it explicitly first
    if (permissionState !== 'granted') {
      const result = await requestMicrophonePermission();
      if (!result.granted) {
        setPermissionState(result.status);
        setPermissionError(
          isTamil
            ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. தயவுசெய்து கீழே உள்ள வழிகளைப் பின்பற்றி மைக் அனுமதியை இயக்கவும் அல்லது தட்டச்சு செய்யவும்.'
            : 'Microphone permission was denied. Please allow microphone access or use text input.'
        );
        return;
      }
      setPermissionState('granted');
    }

    if (!isSpeechRecognitionSupported()) {
      setPermissionError(
        isTamil
          ? 'இந்த உலாவியில் பேச்சு அறிதல் வசதி இல்லை. தயவுசெய்து கீழே தட்டச்சு செய்து பேசவும்.'
          : 'Speech recognition is not supported in this browser. Please type below.'
      );
      return;
    }

    const recognizer = createSpeechRecognizer(
      language, // ta-IN or en-IN
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          setIsListening(false);
          setLastUserSpeech(text.trim());
          handleSendQuery(text.trim());
        }
      },
      (error) => {
        console.warn('Live modal speech recognition error:', error);
        setIsListening(false);
        if (error === 'not-allowed') {
          setPermissionState('denied');
          setPermissionError(
            isTamil
              ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி முகவரிப் பட்டியில் உள்ள பூட்டு (🔒) ஐகானில் மைக் அனுமதியை அனுமதிக்கவும்.'
              : 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
          );
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognizerRef.current = recognizer;
        setIsListening(true);
      } catch (e) {
        console.warn('Failed to start recognizer:', e);
        setIsListening(false);
      }
    }
  };

  // Send query to Gemini and read response aloud
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || isProcessing) return;

    setIsProcessing(true);
    setTranscript(
      isTamil
        ? 'நண்பி யோசித்து எளிய பதிலைத் தயார் செய்கிறார்...'
        : 'NANBI is preparing your explanation...'
    );

    try {
      const result = await askGeminiAssistant(
        queryText,
        language,
        userProfile,
        null,
        []
      );

      setTranscript(result.text);
      setIsProcessing(false);

      // Speak response using browser native speech synthesis
      voiceService.speak(result.text, language);
    } catch (e) {
      setIsProcessing(false);
      const fallback = isTamil
        ? 'மன்னிக்கவும், தற்போது பதிலளிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
        : 'Sorry, could not process query right now. Please try again.';
      setTranscript(fallback);
      voiceService.speak(fallback, language);
    }
  };

  // Toggle listening button
  const handleToggleListening = () => {
    if (isListening) {
      handleStopAll();
    } else {
      startListening();
    }
  };

  const handleEndCall = () => {
    handleStopAll();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in text-white">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 flex flex-col items-center justify-between min-h-[530px] shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar */}
        <div className="w-full flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold tracking-wider uppercase text-emerald-400">
              {isTamil ? 'நேரலை குரல் உரையாடல்' : 'Live Voice Conversation'}
            </span>
          </div>

          {/* Language Toggle in Call */}
          <button
            onClick={() => {
              handleStopAll();
              onLanguageChange(isTamil ? 'en' : 'ta');
            }}
            className="px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            <span>{isTamil ? 'English (en-IN)' : 'தமிழ் (ta-IN)'}</span>
          </button>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 my-4 z-10 w-full">
          {/* Animated Central Orb Button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-4xl sm:text-5xl transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer relative ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-pink-500 ring-8 ring-rose-500/40 animate-voice-ripple'
                : isSpeaking
                ? 'bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 ring-6 ring-amber-400/40 scale-105 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-750 ring-4 ring-rose-500/20'
            }`}
            title={isListening ? 'Click to stop' : 'Click to speak'}
          >
            <span>🌸</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white mt-1">
              {isListening
                ? isTamil
                  ? 'நிறுத்து'
                  : 'Stop'
                : isTamil
                  ? 'பேசுக'
                  : 'Speak'}
            </span>

            {/* Speaking waveform overlay */}
            {isSpeaking && (
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-stone-950 border border-rose-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <span className="w-1 bg-rose-400 rounded-full animate-bar-1 h-3" />
                <span className="w-1 bg-rose-300 rounded-full animate-bar-2 h-4" />
                <span className="w-1 bg-rose-400 rounded-full animate-bar-3 h-3" />
                <span className="text-[9px] font-bold text-rose-300 ml-1">
                  {isTamil ? 'நண்பி பேசுகிறார்' : 'Speaking'}
                </span>
              </div>
            )}
          </button>

          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {isTamil ? 'நண்பியுடன் பேசலாம்' : 'Voice Companion'}
            </h3>
            <p className="text-xs text-stone-400 font-medium mt-1">
              {isListening
                ? isTamil
                  ? '🎙️ கேட்கிறேன்... உங்கள் கேள்வியைக் கூறுங்கள்...'
                  : '🎙️ Listening... please speak your question...'
                : isProcessing
                ? isTamil
                  ? 'நண்பி பதிலைத் தயார் செய்கிறார்...'
                  : 'Preparing verified explanation...'
                : isSpeaking
                ? isTamil
                  ? 'நண்பி பதில் கூறுகிறார்... கவனியுங்கள்'
                  : 'NANBI is speaking...'
                : isTamil
                  ? 'மலர் பொத்தானைத் தொட்டு உங்கள் குரலில் பேசவும்'
                  : 'Tap the flower button to speak naturally'}
            </p>
          </div>

          {/* Transcript / Spoken Output Box */}
          <div className="w-full bg-stone-800/80 rounded-2xl p-4 border border-stone-700 text-xs text-stone-300 max-h-32 overflow-y-auto leading-relaxed text-left">
            {transcript ? (
              <p className="whitespace-pre-line text-stone-200">{transcript}</p>
            ) : (
              <p className="text-stone-500 italic text-center">
                {isTamil
                  ? 'எ.கா: "எனக்கு என்ன பெண்கள் திட்டம் கிடைக்கும்?", "எப்படி விண்ணப்பிப்பது?"'
                  : 'e.g. "What schemes are for me?", "What documents are required?"'}
              </p>
            )}
          </div>

          {/* Permission Denied Instruction Banner */}
          {permissionState === 'denied' && (
            <div className="w-full bg-rose-950/90 border border-rose-800 p-4 rounded-2xl text-left space-y-2 text-xs text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-100">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>
                  {isTamil
                    ? 'மைக் அனுமதி மறுக்கப்பட்டுள்ளது (Permission Denied)'
                    : 'Microphone Permission Denied'}
                </span>
              </div>
              <p className="leading-relaxed text-[11px] text-rose-200">
                {isTamil ? (
                  <>
                    1. உலாவி முகவரிப் பட்டியில் (URL bar) உள்ள பூட்டு (🔒) அல்லது மைக் ஐகானைத் தொடவும்.
                    <br />
                    2. Microphone என்பதற்கு <strong>'Allow'</strong> என்பதைத் தேர்வு செய்யவும்.
                    <br />
                    3. கீழே உள்ள 'மைக் அனுமதியை இயக்கு' பொத்தானை அழுத்தவும்.
                  </>
                ) : (
                  <>
                    1. Click the lock (🔒) or camera/mic icon in your browser URL bar.
                    <br />
                    2. Set Microphone permission to <strong>'Allow'</strong>.
                    <br />
                    3. Click 'Enable Microphone' below to retry.
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {isTamil ? 'மைக் அனுமதியை இயக்கு' : 'Enable Microphone'}
                </span>
              </button>
            </div>
          )}

          {/* Generic Permission / Audio Error Notice */}
          {permissionError && permissionState !== 'denied' && (
            <div className="w-full bg-amber-950/80 border border-amber-800 p-3 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{permissionError}</span>
            </div>
          )}

          {/* Text Input Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textFallbackInput.trim()) {
                const text = textFallbackInput.trim();
                setTextFallbackInput('');
                handleSendQuery(text);
              }
            }}
            className="w-full flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={textFallbackInput}
              onChange={(e) => setTextFallbackInput(e.target.value)}
              placeholder={
                isTamil
                  ? 'அல்லது தட்டச்சு செய்து கேட்கவும்...'
                  : 'Or type your question here...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
            />
            <button
              type="submit"
              disabled={!textFallbackInput.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Bottom Call Controls */}
        <div className="w-full flex items-center justify-center gap-6 z-10 pt-2 border-t border-stone-800/80">
          {/* Start / Stop Mic Button */}
          <button
            onClick={handleToggleListening}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 ring-2 ring-rose-400'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Listening'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-stone-200" />
            )}
            <span className="text-[9px] mt-0.5">
              {isListening
                ? isTamil
                  ? 'நிறுத்து'
                  : 'Stop'
                : isTamil
                  ? 'மைக்'
                  : 'Mic'}
            </span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center font-bold shadow-lg shadow-rose-900/50 active:scale-95 transition-all"
            title={isTamil ? 'உரையாடலை முடிக்க' : 'End Call'}
          >
            <PhoneOff className="w-6 h-6" />
            <span className="text-[9px] mt-0.5">
              {isTamil ? 'முடிக்க' : 'End'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
