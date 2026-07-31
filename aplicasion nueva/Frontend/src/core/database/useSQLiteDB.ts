import { useEffect, useRef, useState } from 'react';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export const useSQLiteDB = () => {
  const [db, setDb] = useState<SQLiteDBConnection | undefined>(undefined);
  const sqlite = useRef<SQLiteConnection>();
  const [initialized, setInitialized] = useState<boolean>(false);

  const saveWebStore = async () => {
    if (sqlite.current && Capacitor.getPlatform() === 'web') {
      try {
        await sqlite.current.saveToStore('agrotrack_db');
      } catch (err) {
        console.error('Error saving to web store:', err);
      }
    }
  };

  useEffect(() => {
    const initializeDB = async () => {
      if (sqlite.current) return;

      sqlite.current = new SQLiteConnection(CapacitorSQLite);
      const isMobile = Capacitor.getPlatform() !== 'web';
      let dbConnection: SQLiteDBConnection;

      try {
        if (isMobile) {
          const ret = await sqlite.current.checkConnectionsConsistency();
          const isConn = (await sqlite.current.isConnection('agrotrack_db', false)).result;

          if (ret.result && isConn) {
            dbConnection = await sqlite.current.retrieveConnection('agrotrack_db', false);
          } else {
            dbConnection = await sqlite.current.createConnection('agrotrack_db', false, 'no-encryption', 1, false);
          }
        } else {
          // Fallback para desarrollo web
          await customElements.whenDefined('jeep-sqlite');
          const jeepSqliteEl = document.querySelector('jeep-sqlite');
          if (jeepSqliteEl != null) {
            await sqlite.current.initWebStore();
            dbConnection = await sqlite.current.createConnection('agrotrack_db', false, 'no-encryption', 1, false);
          } else {
            throw new Error('jeep-sqlite element not found');
          }
        }

        await dbConnection.open();
        setDb(dbConnection);

        // Ledger Inmutable para FSMA 204
        const query = `
          CREATE TABLE IF NOT EXISTS Productores (
            Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            Nombre TEXT NOT NULL,
            Codigo TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS ConfiguracionGlobal (
            Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            Clave TEXT UNIQUE NOT NULL,
            Valor TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS Operarios (
            Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            CodigoInterno TEXT NOT NULL,
            Nombre TEXT NOT NULL,
            Procedencia TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS TransaccionesPesaje (
            Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            OperarioId INTEGER NOT NULL,
            ProductorId INTEGER NOT NULL,
            Fecha TEXT NOT NULL,
            TipoProceso TEXT NOT NULL,
            ConteoBolsas INTEGER NOT NULL DEFAULT 0,
            PesoBruto REAL NOT NULL,
            BolsasBase REAL NOT NULL,
            KilosExcedentes REAL NOT NULL,
            BolsasExtra REAL NOT NULL,
            TarifaAplicada REAL NOT NULL,
            TotalGanado REAL NOT NULL,
            Synced INTEGER DEFAULT 0,
            FOREIGN KEY (OperarioId) REFERENCES Operarios (Id),
            FOREIGN KEY (ProductorId) REFERENCES Productores (Id)
          );
        `;
        
        await dbConnection.execute(query);
        
        try {
          // Seed initial config if empty
          const configCount = await dbConnection.query('SELECT COUNT(*) as count FROM ConfiguracionGlobal');
          if (configCount?.values && configCount.values[0].count === 0) {
            await dbConnection.run("INSERT INTO ConfiguracionGlobal (Clave, Valor) VALUES ('PESO_BOLSA', '23.0')");
            await dbConnection.run("INSERT INTO ConfiguracionGlobal (Clave, Valor) VALUES ('TARIFA_BASE', '15.0')");
          }
          
          // Seed initial data for demo (Productores)
          const prodCount = await dbConnection.query('SELECT COUNT(*) as count FROM Productores');
          if (prodCount?.values && prodCount.values[0].count === 0) {
            await dbConnection.run("INSERT INTO Productores (Nombre, Codigo) VALUES ('Productor Demo 1', 'PROD-1')");
          }

          // Seed initial data for demo (Operarios)
          const opCount = await dbConnection.query('SELECT COUNT(*) as count FROM Operarios');
          if (opCount?.values && opCount.values[0].count < 30) {
            await dbConnection.run('DELETE FROM Operarios'); // Limpiamos si habían menos de 30
            
            const operariosIniciales = [
              { c: 'S 1', n: 'ROSMERI ESPINOZA', p: 'SANCHEZ 2' },
              { c: 'S 2', n: 'RITA E. RODRIGUEZ', p: 'SANCHEZ 2' },
              { c: 'S 3', n: 'MARIA MAG RODRIGUEZ', p: 'SANCHEZ 2' },
              { c: 'S 4', n: 'YINIA ESPINOZA', p: 'SANCHEZ 2' },
              { c: 'S 5', n: 'YINIA MARBELLY CALDERON', p: 'SANCHEZ 2' },
              { c: 'S 6', n: 'YESLING CALDERON', p: 'SANCHEZ 2' },
              { c: 'S 7', n: 'IDELBA CALDERON GARCIA', p: 'SANCHEZ 2' },
              { c: 'S 8', n: 'CINDY RODRIGUEZ BALTODANO', p: 'SANCHEZ 2' },
              { c: 'S 9', n: 'OCDALY RODRIGUEZ B.', p: 'SANCHEZ 2' },
              { c: 'S 10', n: 'ENEIDA RODRIGUEZ', p: 'SANCHEZ 2' },
              { c: 'S 11', n: 'KENETH ORTIZ RODRIGUEZ', p: 'SANCHEZ 2' },
              { c: 'S 12', n: 'DAMARCIA CALDERON', p: 'SANCHEZ 2' },
              { c: 'S 13', n: 'YASELI GALAN CORTEZ', p: 'SANCHEZ 2' },
              { c: 'S 14', n: 'MIRLEY BALTODANO', p: 'SANCHEZ 2' },
              { c: 'S 15', n: 'ARACELY OBREGON B.', p: 'SANCHEZ 2' },
              { c: 'S 16', n: 'NETANIA RODRIGUEZ CORTEZ', p: 'SANCHEZ 2' },
              { c: 'S 17', n: 'BRAYAN RAMOS SILVA', p: 'SANCHEZ 2' },
              { c: 'S 18', n: 'ANA MARTINEZ', p: 'SANCHEZ 2' },
              { c: 'S 19', n: 'ROXANA ESPINOZA', p: 'SANCHEZ 2' },
              { c: 'S 20', n: 'ZENEYDA AMADOR', p: 'SANCHEZ 2' },
              { c: 'S 21', n: 'EVELING RUEDA MARTINEZ', p: 'SANCHEZ 2' },
              { c: 'S 22', n: 'JUSTA MARTINEZ', p: 'SANCHEZ 2' },
              { c: 'S 23', n: 'ISCANDER ARIAS REYES', p: 'SANCHEZ 2' },
              { c: 'S 24', n: 'MAYRA INES ARIAS REYES', p: 'SANCHEZ 2' },
              { c: 'S 25', n: 'JOSE ESPINOZA OBANDO', p: 'SANCHEZ 2' },
              
              { c: 'SL 1', n: 'IDANIA ARIAS', p: 'SANCHEZ 1' },
              { c: 'SL 2', n: 'NEREYDA RIVERA', p: 'SANCHEZ 1' },
              { c: 'SL 3', n: 'ERIKA RIVERA AGUIRRE', p: 'SANCHEZ 1' },
              { c: 'SL 4', n: 'VINIA ISABEL MARIN MEMB.', p: 'SANCHEZ 1' },
              { c: 'SL 5', n: 'PAULA PEREZ ESPINOZA', p: 'SANCHEZ 1' },
              { c: 'SL 6', n: 'MARIA FERNANDA PEREZ', p: 'SANCHEZ 1' },
              { c: 'SL 7', n: 'MARIA ALEJANDRA PEREZ', p: 'SANCHEZ 1' },
              { c: 'SL 8', n: 'RAFAELA CALDERON', p: 'SANCHEZ 1' },
              { c: 'SL 9', n: 'CRUZ MARIA SANCHEZ', p: 'SANCHEZ 1' },
              { c: 'SL 10', n: 'DENIA SANCHEZ', p: 'SANCHEZ 1' },
              { c: 'SL 11', n: 'ANA CECILIA MARIN', p: 'SANCHEZ 1' },
              { c: 'SL 12', n: 'ANGELA CORTEZ', p: 'SANCHEZ 1' }
            ];
            
            for (const op of operariosIniciales) {
              await dbConnection.run(
                "INSERT INTO Operarios (CodigoInterno, Nombre, Procedencia) VALUES (?, ?, ?)",
                [op.c, op.n, op.p]
              );
            }
          }
        } catch (seedError) {
          console.error("Error injectando datos de demo:", seedError);
        }
        
        await saveWebStore();
        setInitialized(true);
      } catch (err) {
        console.error('Error al inicializar SQLite:', err);
      }
    };

    initializeDB();
  }, []);

  return { db, initialized, saveWebStore };
};
