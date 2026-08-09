---
marp: true
size: 4:3
---
# Diagrama de Clases (Dominio)

Representación de la estructura de las clases principales dentro del Clean Architecture (.NET) y los modelos de TypeScript en el Frontend.

```mermaid
classDiagram
    class ContenedorExportacion {
        +int Id
        +string NumeroContenedor
        +string Destino
        +DateTime FechaSalida
    }

    class Operario {
        +int Id
        +string CodigoInterno
        +string Procedencia
        +string Codigo
        +string Nombre
        +string Productor
    }

    class TransaccionPesaje {
        +int Id
        +int OperarioId
        +DateTime Fecha
        +string TipoProceso
        +int ConteoBolsas
        +decimal PesoBruto
        +decimal TotalGanado
    }

    class TsProductor {
        <<interface>>
        +number Id
        +string Nombre
        +string Codigo
    }

    class TsOperario {
        <<interface>>
        +number Id
        +string CodigoInterno
        +string Nombre
        +string Procedencia
    }

    class TsConfiguracionGlobal {
        <<interface>>
        +number Id
        +string Clave
        +string Valor
    }

    class TsTransaccionPesaje {
        <<interface>>
        +number Id
        +number OperarioId
        +number ProductorId
        +string Fecha
        +string TipoProceso
        +number PesoBruto
        +number TotalGanado
        +string Estado
    }

    Operario --> TransaccionPesaje : Realiza
    ContenedorExportacion *-- TransaccionPesaje : Incluye
    TsProductor --> TsTransaccionPesaje : Pertenece
    TsOperario --> TsTransaccionPesaje : Registra
```
