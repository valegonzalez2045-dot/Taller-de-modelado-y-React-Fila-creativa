import './App.css'
import { useState, useEffect } from "react";

type Prioridad = "normal" | "urgente";

type Turno = {
  id: string;
  numero: number;
  nombre: string;
  motivo: string;
  prioridad: Prioridad;
};

const STORAGE_KEY = 'mi-pagina-react-turnos';
const CONTADOR_KEY = 'mi-pagina-react-contador';
const HISTORIAL_KEY = 'mi-pagina-react-historial';

// Regla de la cola de prioridad: primero los urgentes;
// dentro de cada grupo, FIFO (orden de llegada).
function insertarConPrioridad(fila: Turno[], turno: Turno): Turno[] {
  if (turno.prioridad === "normal") {
    return [...fila, turno];
  }
  const indicePrimeroNormal = fila.findIndex((t) => t.prioridad === "normal");
  if (indicePrimeroNormal === -1) {
    return [...fila, turno];
  }
  const copia = [...fila];
  copia.splice(indicePrimeroNormal, 0, turno);
  return copia;
}

function App() {
  const [turnos, setTurnos] = useState<Turno[]>(() => {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
  });

  const [historial, setHistorial] = useState<Turno[]>(() => {
    const datos = localStorage.getItem(HISTORIAL_KEY);
    return datos ? JSON.parse(datos) : [];
  });

  const [contador, setContador] = useState<number>(() => {
    const datos = localStorage.getItem(CONTADOR_KEY);
    return datos ? parseInt(datos, 10) : 0;
  });

  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("normal");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
  }, [turnos]);

  useEffect(() => {
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    localStorage.setItem(CONTADOR_KEY, contador.toString());
  }, [contador]);

  function agregarTurno() {
    const nombreLimpio = nombre.trim();
    const motivoLimpio = motivo.trim();

    if (!nombreLimpio || !motivoLimpio) {
      return;
    }

    const nuevoContador = contador + 1;
    setContador(nuevoContador);

    const nuevoTurno: Turno = {
      id: crypto.randomUUID(),
      numero: nuevoContador,
      nombre: nombreLimpio,
      motivo: motivoLimpio,
      prioridad,
    };

    setTurnos((filaActual) => insertarConPrioridad(filaActual, nuevoTurno));
    setNombre("");
    setMotivo("");
    setPrioridad("normal");
  }

  function atenderSiguiente() {
    const [atendido, ...resto] = turnos;
    if (!atendido) {
      return;
    }
    setTurnos(resto);
    setHistorial((historialActual) => [...historialActual, atendido]);
  }

  // Pila LIFO: restaurar el último turno atendido (el tope de la pila).
  function restaurarUltimo() {
    const ultimo = historial[historial.length - 1];
    if (!ultimo) {
      return;
    }
    setHistorial(historial.slice(0, -1));
    setTurnos((filaActual) => insertarConPrioridad(filaActual, ultimo));
  }

  const siguienteTurno = turnos[0];
  const ultimoAtendido = historial.length > 0 ? historial[historial.length - 1] : undefined;

  return (
    <main>
      <h1>🕹️ Fila creativa: Modo Arcade</h1>

      <div className="formulario">
        <label>
          Nombre del jugador
          <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
        </label>

        <label>
          Motivo
          <input value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
        </label>

        <div className="prioridad">
          <span>Prioridad:</span>
          <button
            type="button"
            className={prioridad === "normal" ? "activo normal" : "normal"}
            onClick={() => setPrioridad("normal")}
          >
            🔵 Normal
          </button>
          <button
            type="button"
            className={prioridad === "urgente" ? "activo urgente" : "urgente"}
            onClick={() => setPrioridad("urgente")}
          >
            ⚡ Urgente
          </button>
        </div>

        <button onClick={agregarTurno}>➕ Agregar turno</button>
      </div>

      {siguienteTurno ? (
        <section className="siguiente">
          <h2>▶️ Siguiente: {siguienteTurno.nombre}</h2>
          <p>
            Turno #{siguienteTurno.numero} - {siguienteTurno.motivo}{" "}
            <span className={`badge ${siguienteTurno.prioridad}`}>
              {siguienteTurno.prioridad === "urgente" ? "⚡ URGENTE" : "🔵 Normal"}
            </span>
          </p>
          <button onClick={atenderSiguiente}>✅ Atender siguiente</button>
        </section>
      ) : (
        <p className="vacio">No hay personas en espera. ¡Inserta moneda!</p>
      )}

      <h2 className="titulo-seccion">🎮 Jugadores en espera</h2>
      <ol className="lista">
        {turnos.map((turno) => (
          <li key={turno.id} className={turno.prioridad === "urgente" ? "fila-urgente" : ""}>
            <span className="numero">#{turno.numero}</span>
            <span className="nombre">{turno.nombre}</span>
            <span className="motivo">{turno.motivo}</span>
            <span className={`badge ${turno.prioridad}`}>
              {turno.prioridad === "urgente" ? "⚡" : "🔵"}
            </span>
          </li>
        ))}
      </ol>

      <h2 className="titulo-seccion">📜 Historial (pila LIFO)</h2>
      <div className="historial">
        <button onClick={restaurarUltimo} disabled={historial.length === 0}>
          ↩ Restaurar último atendido
        </button>
        {ultimoAtendido && (
          <p className="tope">Tope de la pila: #{ultimoAtendido.numero} {ultimoAtendido.nombre}</p>
        )}
        <ol className="lista">
          {[...historial].reverse().map((turno) => (
            <li key={turno.id} className="atendido">
              <span className="numero">#{turno.numero}</span>
              <span className="nombre">{turno.nombre}</span>
              <span className="motivo">{turno.motivo}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

export default App
