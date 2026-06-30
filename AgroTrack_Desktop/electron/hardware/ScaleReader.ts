import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { WebContents } from 'electron'

export class ScaleReader {
  private port: SerialPort | null = null
  private parser: ReadlineParser | null = null
  private webContents: WebContents
  private currentWeight: number = 0.0
  private isStable: boolean = false

  constructor(webContents: WebContents) {
    this.webContents = webContents
  }

  public connect(portPath: string, baudRate: number = 9600): void {
    try {
      if (this.port && this.port.isOpen) {
        this.port.close()
      }

      this.port = new SerialPort({ path: portPath, baudRate })
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      this.port.on('open', () => {
        console.log(`[Hardware] Puerto serial ${portPath} abierto con éxito.`)
        this.webContents.send('scale:status', { connected: true, port: portPath })
      })

      this.port.on('error', (err) => {
        console.error(`[Hardware Error] ${err.message}`)
        this.webContents.send('scale:status', { connected: false, error: err.message })
      })

      this.parser.on('data', (line: string) => {
        this.parseMtSicsCommand(line.trim())
      })

    } catch (error: any) {
      console.error(`[Hardware Exception] ${error.message}`)
      this.webContents.send('scale:status', { connected: false, error: error.message })
    }
  }

  private parseMtSicsCommand(data: string): void {
    if (data.startsWith('S S') || data.startsWith('S D')) {
      const stable = data.startsWith('S S')
      const matches = data.match(/S\s+[SD]\s+([-\d.]+)\s+([a-zA-Z]+)/)
      
      if (matches && matches.length >= 3) {
        const weight = parseFloat(matches[1])
        const unit = matches[2]

        if (!isNaN(weight)) {
          this.currentWeight = weight
          this.isStable = stable

          this.webContents.send('scale:reading', {
            weight: this.currentWeight,
            unit: unit,
            isStable: this.isStable,
            timestamp: Date.now()
          })
        }
      }
    }
  }

  public requestImmediateWeight(): void {
    if (this.port && this.port.isOpen) {
      this.port.write('SI\r\n')
    }
  }

  public disconnect(): void {
    if (this.port && this.port.isOpen) {
      this.port.close()
      this.webContents.send('scale:status', { connected: false })
    }
  }
}
