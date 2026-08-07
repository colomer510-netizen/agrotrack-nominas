import { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Search, Filter, Download, Briefcase } from 'lucide-react';

export default function HistorialScreen() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [productorSeleccionadoId, setProductorSeleccionadoId] = useState<number | ''>('');

  // Data
  const productores = useLiveQuery(() => db.productores.toArray(), []);
  const operarios = useLiveQuery(() => db.operarios.toArray(), []);
  const configuracion = useLiveQuery(() => db.configuracionGlobal.toArray(), []);

  const moneda = useMemo(() => configuracion?.find(c => c.Clave === 'MONEDA')?.Valor || 'C$', [configuracion]);
  const pagoProductorBolsa = useMemo(() => parseFloat(configuracion?.find(c => c.Clave === 'PAGO_PRODUCTOR_BOLSA')?.Valor || '0'), [configuracion]);
  const pesoBolsa = useMemo(() => parseFloat(configuracion?.find(c => c.Clave === 'PESO_BOLSA')?.Valor || '23.0'), [configuracion]);

  // Transacciones Cerradas
  const transacciones = useLiveQuery(
    () => {
      if (!productorSeleccionadoId || !fechaSeleccionada) return Promise.resolve([]);
      return db.transaccionesPesaje
        .where('ProductorId')
        .equals(Number(productorSeleccionadoId))
        .filter(t => t.Estado === 'Cerrado' && t.Fecha.startsWith(fechaSeleccionada))
        .toArray();
    },
    [productorSeleccionadoId, fechaSeleccionada]
  );

  const operarioMap = useMemo(() => {
    const map = new Map();
    operarios?.forEach(op => map.set(op.Id, op));
    return map;
  }, [operarios]);

  const productorSeleccionado = useMemo(() => 
    productores?.find(p => p.Id === Number(productorSeleccionadoId)), 
  [productores, productorSeleccionadoId]);

  // Contabilidad del Productor
  const totalesProductor = useMemo(() => {
    if (!transacciones) return { bolsas: 0, kilos: 0, pagoTotal: 0 };
    let totalBolsas = 0;
    let totalKilos = 0;
    
    transacciones.forEach(t => {
      totalBolsas += t.ConteoBolsas;
      totalKilos += t.KilosExcedentes;
    });

    const kilosConvertidosABolsas = totalKilos / pesoBolsa;
    const pagoTotal = (totalBolsas + kilosConvertidosABolsas) * pagoProductorBolsa;

    return {
      bolsas: totalBolsas,
      kilos: totalKilos,
      pagoTotal: pagoTotal
    };
  }, [transacciones, pagoProductorBolsa, pesoBolsa]);

  const descargarExcel = async () => {
    if (!transacciones || transacciones.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial');

    // Configurar Columnas
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Trabajador', key: 'trabajador', width: 35 },
      { header: 'Procedencia', key: 'procedencia', width: 20 },
      { header: 'Bolsas Completas', key: 'bolsas', width: 20 },
      { header: 'Kilos Extras', key: 'kilos', width: 15 },
      { header: `Pago a Trabajador (${moneda})`, key: 'monto', width: 25 },
    ];

    // Estilo de la Cabecera
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }
      };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    worksheet.getRow(1).height = 25;

    // Agregar Datos
    transacciones.forEach((t) => {
      const op = operarios?.find(o => o.Id === t.OperarioId);
      
      const row = worksheet.addRow({
        codigo: op?.CodigoInterno || 'N/A',
        trabajador: op?.Nombre || 'Desconocido',
        procedencia: op?.Procedencia || '',
        bolsas: t.ConteoBolsas,
        kilos: t.KilosExcedentes,
        monto: Number(t.TotalGanado.toFixed(2))
      });

      row.getCell('bolsas').alignment = { horizontal: 'center' };
      row.getCell('kilos').alignment = { horizontal: 'center' };
      
      const symbol = moneda === 'C$' ? 'C$' : '$';
      row.getCell('monto').numFmt = `"${symbol}"#,##0.00`; 
      row.getCell('monto').alignment = { horizontal: 'right' };

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // Añadir Fila de Totales del Productor al final
    worksheet.addRow([]);
    const totalRow = worksheet.addRow({
      codigo: 'TOTALES',
      trabajador: `Pago a Productor:`,
      procedencia: '',
      bolsas: totalesProductor.bolsas,
      kilos: totalesProductor.kilos,
      monto: Number(totalesProductor.pagoTotal.toFixed(2))
    });
    totalRow.font = { bold: true };
    const symbol = moneda === 'C$' ? 'C$' : '$';
    totalRow.getCell('monto').numFmt = `"${symbol}"#,##0.00`;

    // Generar Archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const nombreProd = productorSeleccionado?.Nombre || 'Productor';
    saveAs(blob, `Contabilidad - ${nombreProd} - ${fechaSeleccionada}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col gap-6">
      
      {/* HEADER DE BÚSQUEDA */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-400 mb-2">Seleccione Finca / Productor</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium appearance-none"
              value={productorSeleccionadoId}
              onChange={(e) => setProductorSeleccionadoId(Number(e.target.value) || '')}
            >
              <option value="">-- Seleccionar Productor --</option>
              {productores?.map(prod => (
                <option key={prod.Id} value={prod.Id}>{prod.Codigo} - {prod.Nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-400 mb-2">Fecha de Jornada</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="date"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </div>

        {productorSeleccionadoId && transacciones && transacciones.length > 0 && (
          <button
            onClick={descargarExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Download size={20} />
            Descargar Reporte
          </button>
        )}
      </div>

      {/* CONTABILIDAD PRODUCTOR */}
      {productorSeleccionadoId && transacciones && transacciones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
            <p className="text-sm font-medium text-slate-400">Total Bolsas</p>
            <p className="text-3xl font-bold text-white mt-1">{totalesProductor.bolsas}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
            <p className="text-sm font-medium text-slate-400">Total Kilos Sueltos</p>
            <p className="text-3xl font-bold text-white mt-1">{totalesProductor.kilos}</p>
          </div>
          <div className="bg-indigo-900/30 rounded-xl p-6 border border-indigo-500/30 shadow-xl">
            <p className="text-sm font-medium text-indigo-300">Pago a Productor</p>
            <p className="text-3xl font-bold text-indigo-400 mt-1">
              {moneda} {totalesProductor.pagoTotal.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* TABLA DE DETALLES */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Detalle por Trabajadores
          </h2>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-semibold">Código</th>
                <th className="p-4 font-semibold">Trabajador</th>
                <th className="p-4 font-semibold text-center">Bolsas</th>
                <th className="p-4 font-semibold text-center">Kilos Extras</th>
                <th className="p-4 font-semibold text-right">Pago ({moneda})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {!productorSeleccionadoId && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <Filter className="mx-auto mb-4 text-slate-600" size={48} />
                    Seleccione un Productor para ver su contabilidad.
                  </td>
                </tr>
              )}
              {productorSeleccionadoId && transacciones?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    No hay registros históricos (Cerrados) para este productor en esta fecha.
                  </td>
                </tr>
              )}
              {transacciones?.map((t) => {
                const op = operarioMap.get(t.OperarioId);
                return (
                  <tr key={t.Id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 text-slate-300">
                      <span className="bg-slate-900 px-3 py-1 rounded-full text-xs font-mono border border-slate-700">
                        {op?.CodigoInterno || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white">{op?.Nombre || 'Desconocido'}</td>
                    <td className="p-4 text-center font-bold text-slate-300">{t.ConteoBolsas}</td>
                    <td className="p-4 text-center font-bold text-slate-300">{t.KilosExcedentes}</td>
                    <td className="p-4 text-right font-bold text-emerald-400">
                      {moneda} {t.TotalGanado.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
