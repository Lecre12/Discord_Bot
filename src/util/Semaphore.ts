export class Semaphore {
  private maxCount: number; // Máximo número de tareas concurrentes permitido
  private currentCount: number; // Número de slots disponibles
  private waiting: Array<() => void> = []; // Cola de tareas esperando

  constructor(maxCount: number) {
      if (maxCount <= 0) {
          throw new Error("El máximo número de tareas concurrentes debe ser mayor a 0.");
      }
      this.maxCount = maxCount;
      this.currentCount = maxCount; // Inicialmente, todos los slots están disponibles
  }

  /**
   * Adquiere un slot en el semáforo. Si no hay slots disponibles, espera hasta que se libere uno.
   */
  async acquire(): Promise<void> {
      if (this.currentCount > 0) {
          this.currentCount--; // Decrementa el contador, slot adquirido
          return;
      }

      // Si no hay slots disponibles, espera a que se libere uno
      await new Promise<void>((resolve) => this.waiting.push(resolve));
  }

  /**
   * Libera un slot en el semáforo. Si hay tareas esperando, despierta a la primera en la cola.
   */
  release(): void {
      if (this.waiting.length > 0) {
          // Despierta la siguiente tarea en la cola
          const next = this.waiting.shift();
          if (next) next(); // Permite que la tarea continúe
      } else if (this.currentCount < this.maxCount) {
          // Incrementa el contador solo si no está lleno
          this.currentCount++;
      } else {
          // Si se intenta liberar más de lo permitido, lanza un error
          throw new Error("Liberación de semáforo inválida: el semáforo ya está en su capacidad máxima.");
      }
  }
}
