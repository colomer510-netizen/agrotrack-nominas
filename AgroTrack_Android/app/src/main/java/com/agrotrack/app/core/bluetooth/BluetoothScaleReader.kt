package com.agrotrack.app.core.bluetooth

import android.bluetooth.BluetoothSocket
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.isActive
import java.io.InputStream

class BluetoothScaleReader(private val socket: BluetoothSocket) {

    /**
     * Lee continuamente del InputStream del socket Bluetooth.
     * Procesa el protocolo MT-SICS buscando lecturas estables indicadas por "S S".
     */
    fun readWeightStream(): Flow<Double> = flow {
        val inputStream: InputStream = socket.inputStream
        val buffer = ByteArray(1024)
        var dataAccumulator = ""

        while (socket.isConnected && currentCoroutineContext().isActive) {
            val bytes = inputStream.read(buffer)
            if (bytes > 0) {
                val incomingMessage = String(buffer, 0, bytes)
                dataAccumulator += incomingMessage

                // En MT-SICS las tramas suelen terminar en CR LF (\r\n)
                if (dataAccumulator.contains("\r\n")) {
                    val lines = dataAccumulator.split("\r\n")
                    // Procesar todas las líneas completas
                    for (i in 0 until lines.size - 1) {
                        val line = lines[i]
                        // "S S" indica "Status: Stable" en el protocolo MT-SICS
                        if (line.startsWith("S S")) {
                            val weightPart = line.substring(3).trim()
                            // Asumiendo un formato ej: "S S    12.34 kg"
                            val weightString = weightPart.split(" ")[0]
                            val weight = weightString.toDoubleOrNull()
                            if (weight != null) {
                                emit(weight)
                            }
                        }
                    }
                    // Mantener la última parte incompleta en el acumulador para la siguiente lectura
                    dataAccumulator = lines.last()
                }
            }
        }
    }.flowOn(Dispatchers.IO)
}
