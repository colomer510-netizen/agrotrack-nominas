// src/features/pesaje/services/BalanzaMTService.ts

export class BalanzaMTService {
    private interval: any;
    private currentWeight: number = 0;
  
    /**
     * Simula la conexión a una balanza Bluetooth usando el protocolo MT-SICS
     */
    public connect(onWeightUpdate: (weight: number) => void): void {
      console.log('Conectando a Balanza Bluetooth (MT-SICS)...');
      
      // Simulamos la balanza subiendo de peso paulatinamente hasta aprox 23kg
      this.currentWeight = 0;
      this.interval = setInterval(() => {
        // Incremento aleatorio entre 0.5 y 2.5 kg
        const step = Math.random() * 2 + 0.5;
        this.currentWeight += step;
        
        // Estabilizamos cerca de 23-25kg para el ejemplo
        if (this.currentWeight > 24.5) {
            this.currentWeight = 24.5 + (Math.random() * 0.2); // Fluctación menor
        }
        
        onWeightUpdate(Number(this.currentWeight.toFixed(2)));
      }, 800); // Emite cada 800ms
    }
  
    public disconnect(): void {
      console.log('Desconectando Balanza...');
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  }
