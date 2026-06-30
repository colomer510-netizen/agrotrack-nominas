package com.agrotrack.app.core.printer

object ZplLabelGenerator {

    /**
     * Genera una etiqueta ZPL cruda con código de barras GS1-128.
     * Utiliza los Application Identifiers (AI):
     * (01) - GTIN (14 dígitos)
     * (10) - Lote (Traceability Lot Code)
     * (310x) - Peso Neto en Kilogramos (donde x son los decimales, usaremos 3102 para 2 decimales).
     *
     * @param gtin GTIN de la empresa (14 dígitos).
     * @param lotCode Código de lote (TLC).
     * @param netWeightKilos Peso neto en kilogramos.
     * @return Cadena con los comandos ZPL.
     */
    fun generateGs1128Label(gtin: String, lotCode: String, netWeightKilos: Double): String {
        // Asegurar que el GTIN tenga 14 caracteres (rellenando con ceros si es necesario)
        val formattedGtin = gtin.padStart(14, '0')
        
        // Formatear el peso a 6 dígitos (ej. 15.25 kg -> 001525) para el AI (3102)
        // 3102 significa "Peso neto en kg con 2 decimales"
        val weightInt = (netWeightKilos * 100).toInt()
        val formattedWeight = weightInt.toString().padStart(6, '0')

        // GS1-128 Payload (El comando ^BC con modo GS1 insertará automáticamente el FNC1 al inicio)
        // Usamos la notación estándar >8 para llamar subconjuntos, pero en Zebra ^BC con parámetro N de validación 
        // GS1 se encarga de parsear los paréntesis.
        val barcodePayload = "01$formattedGtin" + "3102$formattedWeight" + "10$lotCode"

        // Formato para humanos (texto que acompaña al código)
        val humanReadableText = "(01) $formattedGtin (3102) $formattedWeight (10) $lotCode"

        return """
            ^XA
            ^PW800
            ^FO50,50^A0N,40,40^FDAgroTrack - Lote: $lotCode^FS
            ^FO50,110^A0N,30,30^FDPeso Neto: $netWeightKilos Kg^FS
            ^FO50,160^BY3
            ^BCN,100,N,N,N,D
            ^FD$barcodePayload^FS
            ^FO50,280^A0N,25,25^FD$humanReadableText^FS
            ^XZ
        """.trimIndent()
    }
}
