// Carga inicial rápida (Dashboard + Mapa básico)
Promise.all([
  fetch('aforadores.json').then(res => res.json()),
  fetch('ultimos_30_dias.json').then(res => res.json())
])
.then(([aforadores, mediciones30d]) => {
  console.log("Aforadores cargados:", aforadores);
  console.log("Mediciones recientes cargadas:", mediciones30d);
  
  // Dibujar mapa con 'aforadores'
  // Cargar las cajitas del dashboard con las mediciones más recientes de 'mediciones30d'
})
.catch(err => console.error("Error al cargar datos iniciales:", err));

// Función para cuando el usuario hace clic en "Ver Historial Completo"
function cargarHistorialCompleto() {
  mostrarSpinner(); // Indicador visual de carga
  fetch('historial_completo.json')
    .then(res => res.json())
    .then(historial => {
      console.log("Historial completo cargado:", historial);
      // Actualizar gráficos de tendencias largas o tablas históricas
      ocultarSpinner();
    })
    .catch(err => console.error("Error al cargar historial:", err));
}
