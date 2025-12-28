import { VoiceMessage } from "../type/voice-message";

/**
 * Cola thread-safe para almacenar mensajes de voz reconocidos
 * Los workers añaden mensajes y el hilo principal los procesa secuencialmente
 */
export class SpeechQueue {
  private queue: VoiceMessage[] = [];
  private processing = false;
  private processor?: (message: VoiceMessage) => Promise<void>;

  /**
   * Añade un mensaje a la cola
   */
  enqueue(message: VoiceMessage): void {
    this.queue.push(message);
    console.log(`[SpeechQueue] Mensaje añadido a la cola. Total en cola: ${this.queue.length}`);
    
    // Iniciar procesamiento automático si no está en curso
    if (!this.processing && this.processor) {
      this.processNext();
    }
  }

  /**
   * Establece la función que procesará cada mensaje
   */
  setProcessor(processor: (message: VoiceMessage) => Promise<void>): void {
    this.processor = processor;
  }

  /**
   * Procesa el siguiente mensaje de la cola
   */
  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift();
      if (message && this.processor) {
        try {
          console.log(`[SpeechQueue] Procesando mensaje de ${message.author?.username}: "${message.content}"`);
          await this.processor(message);
        } catch (error) {
          console.error('[SpeechQueue] Error al procesar mensaje:', error);
        }
      }
    }

    this.processing = false;
  }

  /**
   * Obtiene el tamaño actual de la cola
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Limpia toda la cola
   */
  clear(): void {
    this.queue = [];
    this.processing = false;
    console.log('[SpeechQueue] Cola limpiada');
  }
}

// Instancia singleton para usar en toda la aplicación
export const speechQueue = new SpeechQueue();
