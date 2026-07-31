import React, { useState, useEffect, useMemo } from 'react';
import { IonPage, IonContent, IonSelect, IonSelectOption, IonIcon } from '@ionic/react';
import { documentText, download, cashOutline } from 'ionicons/icons';
import * as XLSX from 'xlsx';
import { useSQLiteDB } from '../../../core/database/useSQLiteDB';
import { DatabaseService, Productor, ReporteNominaRow } from '../../../core/database/DatabaseService';

export const AdminExportacionScreen: React.FC = () => {
  const { db, initialized } = useSQLiteDB();
  const dbService = useMemo(() => new DatabaseService(db), [db]);

  const [productores, setProductores] = useState<Productor[]>([]);
  const [productorSeleccionado, setProductorSeleccionado] = useState<number | null>(null);
  const [reporteData, setReporteData] = useState<ReporteNominaRow[]>([]);

  useEffect(() => {
    if (initialized) {
      cargarFincas();
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized && productorSeleccionado) {
      cargarReporte(productorSeleccionado);
    } else {
      setReporteData([]);
    }
  }, [productorSeleccionado]);

  const cargarFincas = async () => {
    const list = await dbService.getProductores();
    setProductores(list);
  };

  const cargarReporte = async (prodId: number) => {
    const data = await dbService.getReporteNomina(prodId);
    setReporteData(data);
  };

  const getTotalPago = () => reporteData.reduce((acc, curr) => acc + curr.TotalPago, 0);
  const getTotalBolsas = () => reporteData.reduce((acc, curr) => acc + curr.TotalBolsasBase + curr.TotalBolsasExtra, 0);

  const generarExcelNomina = () => {
    if (!productorSeleccionado) return;
    const productorInfo = productores.find(p => p.Id === productorSeleccionado);
    if (!productorInfo) return;

    // 1. Crear Worksheet
    const wsData = [];

    // Cabecera del Documento
    wsData.push([`Nómina de Productor:`, productorInfo.Nombre]);
    wsData.push([`Código Productor:`, productorInfo.Codigo]);
    wsData.push([`Total Bolsas Procesadas:`, getTotalBolsas()]);
    wsData.push([`Total a Pagar (C$):`, getTotalPago()]);
    wsData.push([]); // Fila vacía

    // Encabezados de la Tabla
    wsData.push([
      'Código Trabajador', 
      'Nombre Trabajador', 
      'Lugar de Procedencia', 
      'Bolsas Base', 
      'Bolsas Extra', 
      'Kilos Excedentes', 
      'Total a Pagar (C$)'
    ]);

    // Filas de Datos
    reporteData.forEach(row => {
      wsData.push([
        row.CodigoInterno,
        row.Nombre,
        row.LugarProcedencia,
        row.TotalBolsasBase,
        row.TotalBolsasExtra,
        row.TotalKilosExcedentes,
        row.TotalPago
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Ajustar anchos de columna
    ws['!cols'] = [
      { wch: 20 }, // Código
      { wch: 35 }, // Nombre
      { wch: 25 }, // Procedencia
      { wch: 15 }, // Bolsas Base
      { wch: 15 }, // Bolsas Extra
      { wch: 18 }, // Kilos Excedentes
      { wch: 20 }, // Total Pagar
    ];

    // 2. Crear Workbook y añadir el Worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nómina');

    // 3. Generar y Descargar Archivo Excel
    const fileName = `Nomina_${productorInfo.Nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="bg-[#0f172a] text-white font-sans h-full flex flex-col">
      {/* HEADER */}
      <div className="bg-[#1e293b]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
              <IonIcon icon={documentText} className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Nóminas y Reportes</h1>
              <p className="text-slate-400 text-sm">Generación de archivos Excel por Productor</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 flex items-center">
              <IonSelect 
                value={productorSeleccionado} 
                onIonChange={e => setProductorSeleccionado(parseInt(e.detail.value, 10))}
                placeholder="Seleccione un Productor / Finca..."
                className="w-full bg-transparent text-white font-bold outline-none"
              >
                {productores.map(p => (
                  <IonSelectOption key={p.Id} value={p.Id}>{p.Codigo} - {p.Nombre}</IonSelectOption>
                ))}
              </IonSelect>
            </div>

            <button 
              onClick={generarExcelNomina}
              disabled={!productorSeleccionado || reporteData.length === 0}
              className="bg-green-600 disabled:opacity-50 hover:bg-green-500 transition-colors text-white font-bold rounded-xl px-6 py-3 flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
            >
              <IonIcon icon={download} className="text-xl" />
              Descargar Excel
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto bg-[#0f172a] p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          
          {!productorSeleccionado ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/50 border-dashed mt-4">
              <IonIcon icon={documentText} className="text-6xl text-slate-600 mb-4" />
              <h2 className="text-xl font-bold text-slate-400">Seleccione un productor para generar su nómina</h2>
            </div>
          ) : reporteData.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/50 border-dashed mt-4">
              <h2 className="text-xl font-bold text-slate-400">No hay registros de pesaje para este productor.</h2>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-fade-in mt-4">
              
              {/* Resumen Global */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <span className="text-2xl font-black text-blue-400">{getTotalBolsas()}</span>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Bolsas</p>
                    <p className="text-xl font-bold text-white">Procesadas</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <IonIcon icon={cashOutline} className="text-2xl text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Monto Total a Pagar</p>
                    <p className="text-2xl font-black text-emerald-400">C$ {getTotalPago().toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* DataGrid */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="p-4 font-bold tracking-wider">CÓDIGO</th>
                        <th className="p-4 font-bold tracking-wider">TRABAJADOR</th>
                        <th className="p-4 font-bold tracking-wider text-center">BOLSAS BASE</th>
                        <th className="p-4 font-bold tracking-wider text-center">BOLSAS EXTRA</th>
                        <th className="p-4 font-bold tracking-wider text-right">TOTAL PAGO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {reporteData.map(row => (
                        <tr key={row.OperarioId} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 font-mono font-bold text-indigo-300">{row.CodigoInterno}</td>
                          <td className="p-4">
                            <p className="font-bold text-white text-base">{row.Nombre}</p>
                            <p className="text-xs text-slate-400">{row.LugarProcedencia}</p>
                          </td>
                          <td className="p-4 text-center font-bold text-slate-300">{row.TotalBolsasBase}</td>
                          <td className="p-4 text-center font-bold text-amber-400">{row.TotalBolsasExtra > 0 ? row.TotalBolsasExtra : '-'}</td>
                          <td className="p-4 text-right font-black text-emerald-400 text-lg">C$ {row.TotalPago.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
