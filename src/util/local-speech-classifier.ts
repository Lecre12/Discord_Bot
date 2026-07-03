export type SpeechClassification = { option: string; confidence: number };

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

export function classifySpeechLocally(text: string): SpeechClassification | null {
  if (!text) return null;
  return null;

  if (includesAny(text, ['hola', 'saluda', 'buenas'])) {
    return { option: 'saludar', confidence: 0.95 };
  }

  if (includesAny(text, ['dispara', 'ataca', 'lucha', 'pelea'])) {
    return { option: 'atacar', confidence: 0.9 };
  }

  if (includesAny(text, ['para', 'calla', 'parate', 'detente', 'silencio'])) {
    return { option: 'parar', confidence: 0.9 };
  }

  if (text.startsWith('pon ') || text.startsWith('ponme ') || text.startsWith('reproduce ')) {
    return { option: 'poner_cancion', confidence: 0.9 };
  }

  if (includesAny(text, ['siguiente cancion', 'siguiente tema', 'siguiente'])) {
    return { option: 'siguiente_cancion', confidence: 0.9 };
  }

  if (includesAny(text, ['borra cola', 'limpia cola', 'limpiar cola'])) {
    return { option: 'limpiar_lista_canciones', confidence: 0.9 };
  }

  if (includesAny(text, ['numero aleatorio', 'número aleatorio'])) {
    return { option: 'numero_aleatorio', confidence: 0.9 };
  }

  if (includesAny(text, ['quien esta conectado', 'quien esta en linea', 'quien hay conectado'])) {
    return { option: 'quien_esta_conectado', confidence: 0.85 };
  }

  if (text.startsWith('piensa ') || text.startsWith('opina ') || text.startsWith('aconseja ')) {
    return { option: 'pensar', confidence: 0.85 };
  }

  return null;
}
