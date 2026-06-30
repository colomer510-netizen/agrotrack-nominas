import net from 'net'

export class ZebraPrinter {
  public static async printZpl(ip: string, port: number = 9100, zplCommand: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const client = new net.Socket()
      
      client.connect(port, ip, () => {
        client.write(zplCommand, 'utf8', () => {
          client.end()
          resolve({ success: true })
        })
      })

      client.on('error', (err) => {
        console.error(`[Zebra Printer Error @ ${ip}:${port}]`, err.message)
        resolve({ success: false, error: err.message })
      })

      client.setTimeout(5000, () => {
        client.destroy()
        resolve({ success: false, error: 'Printer TCP Socket Timeout (5000ms)' })
      })
    })
  }

  /**
   * Generates a standard GS1-128 ZPL string with FNC1 escape character (>8 or ^BCN)
   */
  public static generateGs1Zpl(gtin: string, lotCode: string, dateStr: string): string {
    return `
^XA
^PW800
^LL600
^CF0,40
^FO50,50^FDAGROTRACK - PLATANO EXPORTACION^FS
^CF0,25
^FO50,110^FDLote Trazabilidad (TLC): ${lotCode}^FS
^FO50,150^FDFecha Empaque: ${dateStr}^FS
^BY3,2,150
^FO50,220^BCN,150,Y,N,N^FD>801${gtin}>810${lotCode}>811${dateStr}^FS
^XZ
    `.trim()
  }
}
