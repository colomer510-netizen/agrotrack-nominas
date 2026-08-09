---
marp: true
size: 4:3
---
# Diagrama de Entidad-Relación (ERD)

Este diagrama muestra cómo se relacionan las tablas principales en la base de datos local SQLite para asegurar la trazabilidad.

```mermaid
erDiagram
    Operario {
        int Id PK
        string Codigo
        string Nombre
        string Productor
    }
    
    TransaccionPesaje {
        int Id PK
        int OperarioId FK
        datetime Fecha
        decimal PesoBruto
        decimal BolsasBase
        decimal KilosExcedentes
        decimal BolsasExtra
        decimal TarifaAplicada
        decimal TotalGanado
    }
    
    ContenedorExportacion {
        int Id PK
        string NumeroContenedor
        string Destino
        datetime FechaSalida
    }
    
    Lote {
        int Id PK
        int ContenedorExportacionId FK
        string NumeroLote
        decimal TotalCajas
        datetime FechaCierre
    }
    
    Operario ||--o{ TransaccionPesaje : "registra"
    ContenedorExportacion ||--o{ Lote : "contiene"
    Lote ||--o{ TransaccionPesaje : "incluye"
```
