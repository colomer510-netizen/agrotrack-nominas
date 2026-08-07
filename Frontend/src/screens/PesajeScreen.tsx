import { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Scale, Save, Trash2, Search, Filter, Download } from 'lucide-react';

export default function PesajeScreen() {
  const [productorSeleccionadoId, setProductorSeleccionadoId] = useState<number | ''>('');
  const [operarioSeleccionadoId, setOperarioSeleccionadoId] = useState<number | ''>('');
  
  const [bolsasCompletas, setBolsasCompletas] = useState<number | ''>('');
  const [kilosSueltos, setKilosSueltos] = useState<number | ''>('');

  // Buscadores
  const [buscarOperario, setBuscarOperario] = useState('');

  // Data
  const productores = useLiveQuery(() => db.productores.toArray(), []);
  const operarios = useLiveQuery(() => db.operarios.toArray(), []);
  const configuracion = useLiveQuery(() => db.configuracionGlobal.toArray(), []);
  
  const moneda = useMemo(() => {
    return configuracion?.find(c => c.Clave === 'MONEDA')?.Valor || 'C$';
  }, [configuracion]);

  const modoCierre = useMemo(() => {
    return configuracion?.find(c => c.Clave === 'MODO_CIERRE')?.Valor || 'Manual';
  }, [configuracion]);

  const transacciones = useLiveQuery(
    () => productorSeleccionadoId 
      ? db.transaccionesPesaje
          .where('ProductorId')
          .equals(Number(productorSeleccionadoId))
          .filter(t => !t.Estado || t.Estado === 'Activo')
          .toArray()
      : Promise.resolve([]),
    [productorSeleccionadoId]
  );

  // Configuraciones Globales
  const pesoBolsa = useMemo(() => {
    return parseFloat(configuracion?.find(c => c.Clave === 'PESO_BOLSA')?.Valor || '23.0');
  }, [configuracion]);

  const tarifaBase = useMemo(() => {
    return parseFloat(configuracion?.find(c => c.Clave === 'TARIFA_BASE')?.Valor || '15.0');
  }, [configuracion]);

  // Filtros
  const operariosFiltrados = useMemo(() => {
    if (!operarios) return [];
    if (!buscarOperario) return operarios;
    return operarios.filter(op => 
      op.Nombre.toLowerCase().includes(buscarOperario.toLowerCase()) || 
      op.CodigoInterno.toLowerCase().includes(buscarOperario.toLowerCase())
    );
  }, [operarios, buscarOperario]);

  // Acciones
  const guardarPesaje = async () => {
    if (!productorSeleccionadoId || !operarioSeleccionadoId) {
      alert('Debe seleccionar un productor y un operario.');
      return;
    }
    
    const qtyBolsas = Number(bolsasCompletas) || 0;
    const qtyKilosSueltos = Number(kilosSueltos) || 0;

    if (qtyBolsas === 0 && qtyKilosSueltos === 0) {
      alert('Ingrese una cantidad válida de bolsas o kilos.');
      return;
    }

    try {
      const hoy = new Date().toISOString().split('T')[0];
      const estadoNuevo = modoCierre === 'Automático' ? 'Cerrado' : 'Activo';
      
      // Buscar si el trabajador ya tiene un registro hoy para ESTE productor Y que esté ACTIVO
      const transaccionesProductor = await db.transaccionesPesaje
        .where('ProductorId')
        .equals(Number(productorSeleccionadoId))
        .toArray();
        
      const transaccionExistente = transaccionesProductor.find(
        (t) => t.OperarioId === Number(operarioSeleccionadoId) && 
               t.Fecha.startsWith(hoy) && 
               (!t.Estado || t.Estado === 'Activo')
      );

      if (transaccionExistente) {
        // SUMAR a lo existente
        const nuevasBolsas = transaccionExistente.ConteoBolsas + qtyBolsas;
        const nuevosKilosSueltos = transaccionExistente.KilosExcedentes + qtyKilosSueltos;
        
        const kilosTotales = (nuevasBolsas * pesoBolsa) + nuevosKilosSueltos;
        const totalGanado = (kilosTotales / pesoBolsa) * tarifaBase;

        await db.transaccionesPesaje.update(transaccionExistente.Id!, {
          ConteoBolsas: nuevasBolsas,
          BolsasBase: nuevasBolsas,
          KilosExcedentes: nuevosKilosSueltos,
          PesoBruto: kilosTotales,
          TotalGanado: totalGanado,
          Estado: estadoNuevo,
          Fecha: new Date().toISOString() // Actualiza la hora del último cambio
        });
      } else {
        // CREAR NUEVO
        const kilosTotales = (qtyBolsas * pesoBolsa) + qtyKilosSueltos;
        const totalGanado = (kilosTotales / pesoBolsa) * tarifaBase;

        await db.transaccionesPesaje.add({
          ProductorId: Number(productorSeleccionadoId),
          OperarioId: Number(operarioSeleccionadoId),
          Fecha: new Date().toISOString(),
          TipoProceso: 'Pelado',
          ConteoBolsas: qtyBolsas,
          PesoBruto: kilosTotales,
          BolsasBase: qtyBolsas,
          KilosExcedentes: qtyKilosSueltos,
          BolsasExtra: 0,
          TarifaAplicada: tarifaBase,
          TotalGanado: totalGanado,
          Estado: estadoNuevo,
          Synced: 0
        });
      }

      // Limpiar inputs
      setOperarioSeleccionadoId('');
      setBolsasCompletas('');
      setKilosSueltos('');
      setBuscarOperario('');

    } catch (error) {
      console.error("Error al guardar pesaje:", error);
      alert('Error al guardar el registro.');
    }
  };

  const cerrarJornada = async () => {
    if (!transacciones || transacciones.length === 0) return;
    if (confirm('¿Cerrar jornada? Estos datos pasarán a Contabilidad y ya no se podrán modificar aquí.')) {
      try {
        await Promise.all(
          transacciones.map(t => db.transaccionesPesaje.update(t.Id!, { Estado: 'Cerrado' }))
        );
        alert('Jornada cerrada exitosamente. Los datos se han movido a Historial / Contabilidad.');
      } catch(error) {
        console.error("Error al cerrar jornada:", error);
        alert('Hubo un error al cerrar la jornada.');
      }
    }
  };

  const eliminarTransaccion = async (id?: number) => {
    if (id && confirm('¿Estás seguro de eliminar este registro?')) {
      await db.transaccionesPesaje.delete(id);
    }
  };

  const descargarExcel = async () => {
    if (!transacciones || transacciones.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registros');

    // Configurar Columnas
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Trabajador', key: 'trabajador', width: 35 },
      { header: 'Procedencia', key: 'procedencia', width: 20 },
      { header: 'Bolsas Completas', key: 'bolsas', width: 20 },
      { header: 'Kilos Extras', key: 'kilos', width: 15 },
      { header: `Monto Ganado (${moneda})`, key: 'monto', width: 22 },
    ];

    // Estilo de la Cabecera
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' } // Gris oscuro
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
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
        monto: Number(t.TotalGanado.toFixed(2)) // Aquí limitamos los decimales
      });

      // Alineaciones y Formatos
      row.getCell('bolsas').alignment = { horizontal: 'center' };
      row.getCell('kilos').alignment = { horizontal: 'center' };
      
      // Si la moneda es C$, exceljs necesita un formato custom
      const symbol = moneda === 'C$' ? 'C$' : '$';
      row.getCell('monto').numFmt = `"${symbol}"#,##0.00`; 
      row.getCell('monto').alignment = { horizontal: 'right' };

      // Bordes para cada celda
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Generar Archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fecha = new Date().toISOString().split('T')[0];
    const nombreProd = productores?.find(p => p.Id === Number(productorSeleccionadoId))?.Nombre || 'Productor';
    
    saveAs(blob, `Reporte Profesional - ${nombreProd} - ${fecha}.xlsx`);
  };

  const operarioMap = useMemo(() => {
    const map = new Map();
    operarios?.forEach(op => map.set(op.Id, op));
    return map;
  }, [operarios]);

  const productorSeleccionado = productores?.find(p => p.Id === Number(productorSeleccionadoId));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Scale className="text-indigo-500" size={32} />
            Línea de Pesaje
          </h1>
          <p className="text-slate-400 mt-2">Registra la producción diaria separada por Productor.</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-auto shadow-lg flex items-center gap-4">
          <div className="text-sm">
            <p className="text-slate-400">Peso de Bolsa</p>
            <p className="font-bold text-white text-lg">{pesoBolsa} kg</p>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="text-sm">
            <p className="text-slate-400">Tarifa Base</p>
            <p className="font-bold text-white text-lg">${tarifaBase}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lado Izquierdo: Formularios */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 1. Seleccionar Productor */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Filter size={18} className="text-emerald-400" />
              1. Seleccionar Productor
            </h2>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white"
              value={productorSeleccionadoId}
              onChange={(e) => setProductorSeleccionadoId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">-- Elija un Productor --</option>
              {productores?.map(prod => (
                <option key={prod.Id} value={prod.Id}>
                  {prod.Codigo} - {prod.Nombre}
                </option>
              ))}
            </select>
            
            {productorSeleccionadoId && (
              <p className="text-sm text-emerald-400 mt-3 bg-emerald-900/20 p-2 rounded-lg border border-emerald-800/30">
                Todo lo que registre se guardará bajo los plátanos de: <strong>{productorSeleccionado?.Nombre}</strong>.
              </p>
            )}
          </div>

          {/* 2. Registro de Trabajo (Solo visible si hay un productor) */}
          {productorSeleccionadoId && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Scale size={18} className="text-indigo-400" />
                2. Registrar Trabajo
              </h2>

              <div className="space-y-4">
                {/* Buscar y Seleccionar Operario */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Trabajador (Operario)</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 text-sm text-white"
                      value={buscarOperario}
                      onChange={(e) => setBuscarOperario(e.target.value)}
                    />
                  </div>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white h-32"
                    multiple
                    value={operarioSeleccionadoId ? [String(operarioSeleccionadoId)] : []}
                    onChange={(e) => setOperarioSeleccionadoId(Number(e.target.value))}
                  >
                    {operariosFiltrados.map(op => (
                      <option key={op.Id} value={op.Id} className="p-2 border-b border-slate-800 last:border-0 hover:bg-slate-800">
                        {op.CodigoInterno} - {op.Nombre} ({op.Procedencia})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Bolsas Completas</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-center font-bold text-xl"
                      value={bolsasCompletas}
                      onChange={(e) => setBolsasCompletas(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Kilos Sueltos</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-center font-bold text-xl"
                      value={kilosSueltos}
                      onChange={(e) => setKilosSueltos(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={guardarPesaje}
                  disabled={!operarioSeleccionadoId}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg mt-4 ${
                    operarioSeleccionadoId 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Save size={24} />
                  Guardar Registro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lado Derecho: Tabla de Registros del Productor */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl h-full flex flex-col">
            <div className="p-6 border-b border-slate-700 bg-slate-800/80 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {productorSeleccionadoId ? `Registros Activos para ${productorSeleccionado?.Nombre}` : 'Seleccione un productor para ver la tabla'}
              </h2>
              {productorSeleccionadoId && transacciones && transacciones.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={descargarExcel}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                    <Download size={16} />
                    Descargar Excel
                  </button>
                  {modoCierre === 'Manual' && (
                    <button
                      onClick={cerrarJornada}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                    >
                      <Save size={16} />
                      Cerrar Jornada
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                  <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">Código</th>
                    <th className="p-4 font-semibold">Trabajador</th>
                    <th className="p-4 font-semibold text-center">Bolsas</th>
                    <th className="p-4 font-semibold text-center">Kilos Extras</th>
                    <th className="p-4 font-semibold text-right">Monto Ganado ({moneda})</th>
                    <th className="p-4 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {!productorSeleccionadoId && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500">
                        <Filter className="mx-auto mb-4 text-slate-600" size={48} />
                        El panel está vacío. Seleccione un Productor en el panel izquierdo.
                      </td>
                    </tr>
                  )}
                  {productorSeleccionadoId && transacciones?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500">
                        No hay pesajes registrados para este productor hoy.
                      </td>
                    </tr>
                  )}
                  {transacciones?.map((t) => {
                    const op = operarioMap.get(t.OperarioId);
                    return (
                      <tr key={t.Id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 text-slate-300">
                          <span className="bg-slate-900 px-2 py-1 rounded text-xs font-mono border border-slate-700">
                            {op?.CodigoInterno || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-white">
                          <div>{op?.Nombre || 'Desconocido'}</div>
                          <div className="text-xs text-slate-500 font-normal">{op?.Procedencia}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-emerald-400 text-lg">
                          {t.ConteoBolsas}
                        </td>
                        <td className="p-4 text-center text-slate-300">
                          {t.KilosExcedentes > 0 ? `+${t.KilosExcedentes} kg` : '-'}
                        </td>
                        <td className="p-4 text-right font-bold text-white text-lg">
                          <span className="text-slate-500 mr-1">$</span>
                          {t.TotalGanado.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => eliminarTransaccion(t.Id)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Eliminar Registro"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Resumen Total */}
            {productorSeleccionadoId && transacciones && transacciones.length > 0 && (
              <div className="bg-slate-900 border-t border-slate-700 p-6 flex justify-between items-center">
                <div className="text-slate-400">Total Bolsas: <span className="text-emerald-400 font-bold text-xl ml-2">{transacciones.reduce((acc, t) => acc + t.ConteoBolsas, 0)}</span></div>
                <div className="text-slate-400">Total a Pagar: <span className="text-white font-bold text-2xl ml-2">${transacciones.reduce((acc, t) => acc + t.TotalGanado, 0).toFixed(2)}</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
