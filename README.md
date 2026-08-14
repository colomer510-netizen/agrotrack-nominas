// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

<div align="center">
  <br>
  <h1>🌿 AgroTrack Nóminas</h1>
  <p>
    <b>Sistema ERP / MES Offline-First para Plantas Procesadoras Agrícolas</b>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/.NET-8.0-purple?style=flat-square&logo=dotnet" alt=".NET">
    <img src="https://img.shields.io/badge/Vite-8.0-yellow?style=flat-square&logo=vite" alt="Vite">
    <img src="https://img.shields.io/badge/TailwindCSS-4.0-cyan?style=flat-square&logo=tailwind-css" alt="Tailwind">
    <img src="https://img.shields.io/badge/IndexedDB-Dexie-orange?style=flat-square&logo=database" alt="IndexedDB">
    <img src="https://img.shields.io/badge/SQLite-EF_Core-blue?style=flat-square&logo=sqlite" alt="SQLite">
    <img src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square" alt="License">
  </p>
</div>

---

## 📖 Acerca del Proyecto

**AgroTrack Nóminas** es un sistema integral de Planificación de Recursos Empresariales (ERP) y Sistema de Ejecución de Manufactura (MES) diseñado específicamente para plantas procesadoras de plátano pelado al vacío en Nicaragua. 

El sistema digitaliza, automatiza y asegura la **trazabilidad de producción**, el **pesaje por destajo**, y el **cálculo automático de nóminas**, garantizando que la planta pueda seguir operando sin interrupciones gracias a su robusta arquitectura **Offline-First**.

## Licencia

Este proyecto está licenciado bajo la GNU Affero General Public License v3.0 (AGPL-3.0).

Copyright (C) 2026 colomer510-netizen

Para más detalles, consulte el archivo LICENSE en la raíz del repositorio.

## ✨ Características Principales

- 📡 **Arquitectura Offline-First:** Los operarios pueden registrar pesajes en la planta de procesamiento incluso sin conexión a internet. Los datos se almacenan localmente en IndexedDB y se sincronizan automáticamente con el servidor central al detectar conexión.
- ⚖️ **Módulo de Pesaje por Destajo:** Cálculo automatizado en tiempo real de salarios basado en bolsas base y kilos excedentes.
- 📋 **Trazabilidad FSMA 204:** Registro inmutable (Ledger) de todos los eventos del proceso, asegurando trazabilidad desde el campo hasta la exportación (Lote a Contenedor).
- 🚢 **Aduanas y Exportación:** Módulo dedicado para gestionar contenedores, destinos y generar documentos como Packing List y Certificados IPSA.
- 📊 **Reportería y Contabilidad:** Generación automática de planillas en Excel agrupadas por Operario y Productor, listas para el pago.
- ⚙️ **Configuración Dinámica:** Tarifa de pago, peso base de bolsas y tipo de moneda (C$ / USD) configurables globalmente.

## 🏗️ Arquitectura del Sistema

El proyecto sigue un patrón de diseño **Clean Architecture** en el backend y una arquitectura basada en componentes en el frontend.

```
