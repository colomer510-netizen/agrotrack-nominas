/**
 * Calcula la estimación de materia prima requerida (cantidad de racimos a cortar)
 * basándose en un muestreo de rendimiento.
 * 
 * @param pesoMuestraBruto El peso de la muestra inicial con cáscara (ej. docena de plátanos).
 * @param pesoMuestraNeto El peso de la muestra una vez pelada (peso útil).
 * @param pesoPromedioRacimo El peso bruto promedio de un racimo entero (con cáscara).
 * @param cuotaRequeridaKilos La meta de kilos de plátano pelado que se necesita completar.
 * @returns El número entero de racimos que se deben cortar (redondeado hacia arriba).
 */
export function calcularRacimosRequeridos(
  pesoMuestraBruto: number,
  pesoMuestraNeto: number,
  pesoPromedioRacimo: number,
  cuotaRequeridaKilos: number
): number {
  // Validación de seguridad para evitar división por cero
  if (pesoMuestraBruto <= 0 || pesoPromedioRacimo <= 0) {
    throw new Error('El peso bruto de la muestra y el peso promedio del racimo deben ser mayores a 0.');
  }

  // 1. Porcentaje de Rendimiento (R)
  const porcentajeRendimiento = pesoMuestraNeto / pesoMuestraBruto;

  // 2. Peso útil por racimo (P_util)
  const pesoUtilPorRacimo = pesoPromedioRacimo * porcentajeRendimiento;

  // Validación de seguridad para el peso útil
  if (pesoUtilPorRacimo <= 0) {
    throw new Error('El rendimiento neto no puede ser 0.');
  }

  // 3. Racimos a cortar (N)
  const racimosACortar = cuotaRequeridaKilos / pesoUtilPorRacimo;

  // Retornar número entero redondeado hacia arriba
  return Math.ceil(racimosACortar);
}
