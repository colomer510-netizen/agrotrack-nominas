import React, { useState, useEffect } from 'react'

export const WeighingStationHybrid: React.FC = () => {
  const [isManualMode, setIsManualMode] = useState<boolean>(false)
  const [manualWeightInput, setManualWeightInput] = useState<string>('')
  const [weight, setWeight] = useState<number>(0.0)
  const [isStable, setIsStable] = useState<boolean>(false)
  const [scalePort, setScalePort] = useState<string>('COM3')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [printerIp, setPrinterIp] = useState<string>('192.168.1.100')
  
  const [operatorList] = useState([
    { id: 'OP-001', name: 'Wilger Ortiz (Destajo)' },
    { id: 'OP-002', name: 'Walkiria Castillo (Destajo)' },
    { id: 'OP-003', name: 'Kasandra Montiel (Destajo)' },
    { id: 'OP-004', name: 'Yolanda Centeno (Destajo)' }
  ])
  const [selectedOperator, setSelectedOperator] = useState<string>('OP-001')
  const [tare, setTare] = useState<number>(1.500)
  const [tarifa] = useState<number>(0.85) // USD por kilo neto
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  useEffect(() => {
    const removeReading = (window as any).api?.onScaleReading?.((data: any) => {
      if (!isManualMode) {
        setWeight(data.weight)
        setIsStable(data.isStable)
      }
    })

    const removeStatus = (window as any).api?.onScaleStatus?.((data: any) => {
      setIsConnected(data.connected)
      if (data.error) setLastMessage(`❌ Error de Báscula: ${data.error}`)
    })

    const removeModeListener = (window as any).api?.onWeighingModeChange?.((mode: string) => {
      setIsManualMode(mode === 'manual')
    })

    return () => {
      removeReading?.()
      removeStatus?.()
      removeModeListener?.()
    }
  }, [isManualMode])

  const handleManualWeightChange = (val: string) => {
    setManualWeightInput(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      setWeight(parsed)
      setIsStable(true)
    } else {
      setWeight(0.0)
      setIsStable(false)
    }
  }

  const connectToScale = () => {
    ;(window as any).api?.connectScale?.(scalePort)
  }

  const netWeight = Math.max(0, weight - tare)
  const montoGanado = netWeight * tarifa

  const handleRegister = async () => {
    if (weight <= 0) {
      alert('⚠️ Ingrese un peso mayor a 0 kg')
      return
    }
    
    const payload = {
      id_lote_materia_prima: 'TLC-2026-EXPORT-001',
      id_operario: selectedOperator,
      id_estacion_balanza: isManualMode ? 'PLATAFORMA_MANUAL_AZUCARERA' : `BASCULA_${scalePort}`,
      peso_bruto_capturado: weight,
      tara_recipiente: tare,
      tarifa_destajo_vigente: tarifa,
      modo_captura: isManualMode ? 'TECLADO_MANUAL' : 'SERIAL_AUTOMATICO'
    }

    const res = await (window as any).api?.saveWeighingTransaction?.(payload)
    if (res?.success) {
      // Intentar imprimir etiqueta
      const dateStr = new Date().toISOString().split('T')[0]
      const zpl = `
^XA
^PW800
^LL600
^CF0,40
^FO50,50^FDAGROTRACK - PLATANO EXPORTACION^FS
^CF0,25
^FO50,110^FDLote Trazabilidad (TLC): ${payload.id_lote_materia_prima}^FS
^FO50,150^FDOperario: ${operatorList.find(o => o.id === selectedOperator)?.name}^FS
^FO50,190^FDPeso Neto: ${netWeight.toFixed(3)} KG^FS
^FO50,230^FDFecha: ${dateStr}^FS
^BY3,2,100
^FO50,280^BCN,100,Y,N,N^FD>80100000000000000>810${payload.id_lote_materia_prima}>811${dateStr}^FS
^XZ`.trim()

      const printRes = await (window as any).api?.printZplLabel?.(zpl, printerIp)
      const printMsg = printRes?.success ? '🖨️ Etiqueta impresa' : `🖨️ Error Impresora: ${printRes?.error}`

      setLastMessage(`✅ ¡Pesaje sellado en Ledger FSMA 204! Neto: ${netWeight.toFixed(3)} kg | ${printMsg}`)
      if (isManualMode) {
        setManualWeightInput('')
        setWeight(0.0)
      }
    } else {
      setLastMessage(`❌ Error al registrar transaccion: ${res?.error || 'Sin conexión IPC'}`)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Cabecera y Conmutador de Modo Híbrido */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
            <span>⚖️ Estación de Pesaje a Destajo</span>
            <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Modo Híbrido</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Soporta Básculas Industriales MT-SICS o Pesas de Plataforma Manuales</p>
        </div>

        <div className="flex bg-slate-950 p-2 rounded-xl border border-slate-800 items-center gap-3">
          <span className="text-xs font-bold text-slate-400">🖨️ Zebra IP:</span>
          <input 
            type="text" 
            value={printerIp}
            onChange={e => setPrinterIp(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono w-28 text-center focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Controles de Conexión Serial (Solo si no es manual) */}
      {!isManualMode && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-300">Puerto COM de Báscula:</span>
            <input 
              type="text" 
              value={scalePort} 
              onChange={e => setScalePort(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono w-28 text-center"
            />
            <button 
              onClick={connectToScale}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-600 transition-colors"
            >
              Conectar Puerto
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isConnected ? 'Conectado (MT-SICS)' : 'Desconectado'}
            </span>
          </div>
        </div>
      )}

      {/* Selección de Operario y Tara */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            👤 Operario de Pelado (Gafete / PIN Manual)
          </label>
          <select
            value={selectedOperator}
            onChange={e => setSelectedOperator(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white font-semibold focus:outline-none focus:border-emerald-500"
          >
            {operatorList.map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-2">Tarifa vigente de pago: <strong className="text-emerald-400">$0.85 USD / kg neto</strong></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            🧺 Tara Estandarizada de Canasta (kg)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              step="0.01"
              value={tare}
              onChange={e => setTare(parseFloat(e.target.value) || 0)}
              className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xl font-bold text-white w-36 text-center"
            />
            <span className="text-sm text-slate-400">Se descuenta automáticamente del peso bruto leído de la báscula.</span>
          </div>
        </div>
      </div>

      {/* Pantalla Gigante de Lectura de Peso */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center relative shadow-inner">
        <div className="absolute top-6 left-8 flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            {isManualMode ? 'Teclado de Plataforma Manual' : 'Sensor Báscula en Tiempo Real'}
          </span>
        </div>

        {isManualMode ? (
          <div className="w-full max-w-sm my-6">
            <input
              type="number"
              step="0.001"
              placeholder="0.000"
              value={manualWeightInput}
              onChange={e => handleManualWeightChange(e.target.value)}
              className="w-full bg-slate-950 border-2 border-amber-500/60 rounded-2xl p-6 text-center text-6xl font-black text-amber-400 focus:outline-none focus:border-amber-400 shadow-lg shadow-amber-500/10"
            />
            <span className="block text-center text-xs text-amber-500/80 font-bold mt-2 uppercase tracking-wider">Digite los kilos leídos en la pesa</span>
          </div>
        ) : (
          <div className="my-6 flex items-baseline gap-4">
            <span className={`text-8xl font-black tracking-tight ${isStable ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
              {weight.toFixed(3)}
            </span>
            <span className="text-3xl font-bold text-slate-400">KG</span>
          </div>
        )}

        {/* Resumen de Cálculo Neto y Pago */}
        <div className="w-full grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6 mt-4 text-center">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 font-bold block uppercase">Peso Bruto</span>
            <span className="text-lg font-bold text-white">{weight.toFixed(3)} kg</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 font-bold block uppercase">Peso Neto Pulpa</span>
            <span className="text-xl font-black text-emerald-400">{netWeight.toFixed(3)} kg</span>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 font-bold block uppercase">Ganancia Operario</span>
            <span className="text-xl font-black text-teal-300">${montoGanado.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Botón de Sello e Inyección */}
      <button
        onClick={handleRegister}
        disabled={weight <= 0}
        className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-900/30 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <span>⚖️ Registrar Pesaje y Sellar en Ledger FSMA 204</span>
      </button>

      {lastMessage && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-center font-bold text-sm text-slate-200 animate-fade-in">
          {lastMessage}
        </div>
      )}
    </div>
  )
}
