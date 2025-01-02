export class Semaphore {
    private maxCount: number;   // Número máximo de tareas que pueden acceder al recurso
    private currentCount: number;  // Contador actual
    private waiting: Array<() => void> = [];  // Cola de tareas esperando
  
    constructor(maxCount: number) {
      this.maxCount = maxCount;
      this.currentCount = maxCount;
    }
  
    // Método para adquirir un "slot" en el semáforo
    async acquire(): Promise<void> {
      if (this.currentCount > 0) {
        this.currentCount--;  // Decrementa el contador, acceso permitido
        return;  // Ya tiene acceso
      } else {
        // Si no hay acceso, se agrega la tarea a la cola
        await new Promise<void>(resolve => this.waiting.push(resolve));
      }
    }
  
    // Método para liberar el "slot" y permitir que la siguiente tarea acceda
    release(): void {
      if (this.waiting.length > 0) {
        // Si hay tareas esperando, les da acceso
        const next = this.waiting.shift();
        if (next) next();  // Ejecuta la próxima tarea en la cola
      } else {
        this.currentCount++;  // Si no hay tareas esperando, incrementa el contador
      }
    }
  }