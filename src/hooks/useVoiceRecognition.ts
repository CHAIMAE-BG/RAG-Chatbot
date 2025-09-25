
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceRecognitionProps {
  onTranscription: (text: string) => void;
}

export function useVoiceRecognition({ onTranscription }: UseVoiceRecognitionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);

  const handleTranscription = useCallback((text: string) => {
    // Seulement envoyer la transcription si on est encore en train d'enregistrer
    if (isRecordingRef.current && text.trim()) {
      onTranscription(text.trim());
    }
  }, [onTranscription]);

  useEffect(() => {
    // Vérifier si le navigateur supporte la reconnaissance vocale
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event: any) => {
        // Vérifier si on est encore en train d'enregistrer avant de traiter les résultats
        if (!isRecordingRef.current) {
          return;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Envoyer la transcription complète (finale + intermédiaire)
        const fullTranscript = finalTranscript + interimTranscript;
        handleTranscription(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognition.onend = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Reconnaissance vocale non supportée par ce navigateur');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [handleTranscription]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        isRecordingRef.current = true;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Erreur lors du démarrage de la reconnaissance:', error);
        isRecordingRef.current = false;
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      isRecordingRef.current = false;
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Forcer l'arrêt immédiatement
      isRecordingRef.current = false;
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    toggleRecording,
    isSupported
  };
}
