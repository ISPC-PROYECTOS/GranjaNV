export function formatearFechaISO(fecha: Date): string{
    const anio =  fecha.getFullYear();
    const mes = String(fecha.getMonth() +1).padStart(2, '0' );
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

export function obtenerRangoMesActual(referencia: Date = new Date()): { fechaDesde: string; fechaHasta: string } {
    const anio = referencia.getFullYear();
    const mes = referencia.getMonth();

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    return {
    fechaDesde: formatearFechaISO(primerDia),
    fechaHasta: formatearFechaISO(ultimoDia),
  };
}

export function obtenerRangoSemanaActual(referencia: Date = new Date()): { fechaDesde: string; fechaHasta: string } {
  const fecha = new Date(referencia);
  const diaSemana = fecha.getDay();
  const distanciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() + distanciaLunes);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  return {
    fechaDesde: formatearFechaISO(lunes),
    fechaHasta: formatearFechaISO(domingo),
  };
}
