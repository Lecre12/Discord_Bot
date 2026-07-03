import { SpeechOptions } from 'discord-speech-recognition';
import { SPANISH_LOCALE } from '../constant/language';
import { resolveSpanishSpeech } from './speech-recognition';

export const DEFAULT_SPEECH_OPTIONS: SpeechOptions = {
  lang: SPANISH_LOCALE,
  profanityFilter: false,
  ignoreBots: true,
  minimalVoiceMessageDuration: 0.8,
  speechRecognition: resolveSpanishSpeech,
};
