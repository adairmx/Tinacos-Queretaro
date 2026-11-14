/** Tope de intentos por visitante en una ventana de tiempo, en memoria: suficiente para un solo servidor. */
export function crearFreno(maximo: number, ventanaMs: number) {
  const intentos = new Map<string, number[]>();

  return (quien: string, ahora = Date.now()) => {
    const recientes = (intentos.get(quien) ?? []).filter((momento) => momento > ahora - ventanaMs);
    if (recientes.length >= maximo) {
      intentos.set(quien, recientes);
      return false;
    }
    recientes.push(ahora);
    intentos.set(quien, recientes);
    if (intentos.size > 5000) intentos.clear();
    return true;
  };
}
