let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("api", {
	onScaleReading: (callback) => {
		const listener = (_event, value) => callback(value);
		electron.ipcRenderer.on("scale:reading", listener);
		return () => electron.ipcRenderer.removeListener("scale:reading", listener);
	},
	onScaleStatus: (callback) => {
		const listener = (_event, value) => callback(value);
		electron.ipcRenderer.on("scale:status", listener);
		return () => electron.ipcRenderer.removeListener("scale:status", listener);
	},
	requestImmediateWeight: () => electron.ipcRenderer.send("scale:request-weight"),
	connectScale: (port) => electron.ipcRenderer.send("scale:connect", port),
	onWeighingModeChange: (callback) => {
		const listener = (_event, mode) => callback(mode);
		electron.ipcRenderer.on("set-weighing-mode", listener);
		return () => electron.ipcRenderer.removeListener("set-weighing-mode", listener);
	},
	saveWeighingTransaction: (payload) => electron.ipcRenderer.invoke("db:save-weighing", payload),
	getProducers: () => electron.ipcRenderer.invoke("db:get-producers"),
	addProducer: (producer) => electron.ipcRenderer.invoke("db:add-producer", producer),
	getQuotas: () => electron.ipcRenderer.invoke("db:get-quotas"),
	reassignQuota: (payload) => electron.ipcRenderer.invoke("db:reassign-quota", payload),
	getLedger: () => electron.ipcRenderer.invoke("db:get-ledger"),
	printZplLabel: (zpl, ip) => electron.ipcRenderer.invoke("printer:print-zpl", {
		zpl,
		ip
	}),
	getDashboardStats: () => electron.ipcRenderer.invoke("db:get-dashboard-stats"),
	exportPayroll: () => electron.ipcRenderer.invoke("db:export-payroll")
});
//#endregion
