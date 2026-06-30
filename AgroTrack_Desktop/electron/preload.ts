import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Scale / Hardware
  onScaleReading: (callback: (reading: any) => void) => {
    const listener = (_event: any, value: any) => callback(value)
    ipcRenderer.on('scale:reading', listener)
    return () => ipcRenderer.removeListener('scale:reading', listener)
  },
  onScaleStatus: (callback: (status: any) => void) => {
    const listener = (_event: any, value: any) => callback(value)
    ipcRenderer.on('scale:status', listener)
    return () => ipcRenderer.removeListener('scale:status', listener)
  },
  requestImmediateWeight: () => ipcRenderer.send('scale:request-weight'),
  connectScale: (port: string) => ipcRenderer.send('scale:connect', port),

  // Application Menu Events
  onWeighingModeChange: (callback: (mode: string) => void) => {
    const listener = (_event: any, mode: string) => callback(mode)
    ipcRenderer.on('set-weighing-mode', listener)
    return () => ipcRenderer.removeListener('set-weighing-mode', listener)
  },

  // Database / Transactions
  saveWeighingTransaction: (payload: any) => ipcRenderer.invoke('db:save-weighing', payload),
  getProducers: () => ipcRenderer.invoke('db:get-producers'),
  addProducer: (producer: any) => ipcRenderer.invoke('db:add-producer', producer),
  getQuotas: () => ipcRenderer.invoke('db:get-quotas'),
  reassignQuota: (payload: any) => ipcRenderer.invoke('db:reassign-quota', payload),
  getLedger: () => ipcRenderer.invoke('db:get-ledger'),
  
  // Printing ZPL
  printZplLabel: (zpl: string, ip: string) => ipcRenderer.invoke('printer:print-zpl', { zpl, ip }),

  // Dashboard & Export
  getDashboardStats: () => ipcRenderer.invoke('db:get-dashboard-stats'),
  exportPayroll: () => ipcRenderer.invoke('db:export-payroll')
})
