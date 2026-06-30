package com.agrotrack.app.domain.usecase

import com.agrotrack.app.core.printer.ZplLabelGenerator
import com.agrotrack.app.data.local.entity.PesajeDestajoEntity

class GenerateTraceabilityLabelUseCase {

    /**
     * Genera la etiqueta ZPL correspondiente a un pesaje registrado.
     * 
     * @param pesaje La entidad de pesaje que contiene el Lote y el Peso Neto.
     * @param companyGtin El GTIN asignado a la empresa/producto (por defecto puede inyectarse o pasarse).
     * @return El string ZPL crudo listo para ser enviado a la impresora Bluetooth.
     */
    operator fun invoke(pesaje: PesajeDestajoEntity, companyGtin: String = "12345678901234"): String {
        return ZplLabelGenerator.generateGs1128Label(
            gtin = companyGtin,
            lotCode = pesaje.loteId,
            netWeightKilos = pesaje.kilosNetos
        )
    }
}
