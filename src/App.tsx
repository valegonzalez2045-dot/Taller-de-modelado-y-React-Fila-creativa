import './App.css'
import { useState, useEffect } from "react";

type Turno = {
  id: string;
  numero: number;
  nombre: string;
  motivo: string;
};

const STORAGE_KEY = 'mi-pagina-react-turnos';
const CONTADOR_KEY = 'mi-pagina-react-contador';

function App() {
  const [turnos, setTurnos] = useState<Turno[]>(() => {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
  });

  const [contador, setContador] = useState<number>(() => {
    const datos = localStorage.getItem(CONTADOR_KEY);
    return datos ? parseInt(datos, 10) : 0;
  });

  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
  }, [turnos]);

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
    };

    setTurnos((filaActual) => [...filaActual, nuevoTurno]);
    setNombre("");
    setMotivo("");
  }

  function atenderSiguiente() {
    setTurnos((filaActual) => filaActual.slice(1));
  }

  const siguienteTurno = turnos[0];

  return (
    <main>
      <h1>Fila creativa</h1>

      <div className="formulario">
        <label>
          Nombre
          <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
        </label>

        <label>
          Motivo
          <input value={motivo} onChange={(evento) => setMotivo(evento.target.value)} />
        </label>

        <button onClick={agregarTurno}>Agregar turno</button>
      </div>

      {siguienteTurno ? (
        <section className="siguiente">
          <h2>Siguiente: {siguienteTurno.nombre}</h2>
          <p>Turno #{siguienteTurno.numero} - {siguienteTurno.motivo}</p>
          <button onClick={atenderSiguiente}>Atender siguiente</button>
        </section>
      ) : (
        <p className="vacio">No hay personas en espera.</p>
      )}

      <ol className="lista">
        {turnos.map((turno) => (
          <li key={turno.id}>
            <span className="numero">#{turno.numero}</span>
            <span className="nombre">{turno.nombre}</span>
            <span className="motivo">{turno.motivo}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}

export default App