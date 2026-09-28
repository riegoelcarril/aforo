let mapa;
let marcadores = {};

document.addEventListener("DOMContentLoaded", () => {
  inicializarMapa();
  cargarDatosIniciales();
});

function inicializarMapa() {
  // Inicializa mapa centrado (coordenadas aproximadas)
  mapa = L.map('map').setView([-24.98, -65.55], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapa);
}

function cargarDatosIniciales() {
  Promise.all([
    fetch('aforadores.json').then(r => r.ok ? r.json() : []),
    fetch('ultimos_30_dias.json').then(r => r.ok ? r.json() : [])
  ])
  .then(([aforadores, mediciones]) => {
    dibujarAforadoresEnMapa(aforadores);
    procesarCajitasYTabla(mediciones);
    
    if (mediciones.length > 0) {
      const ultimaFecha = mediciones[0]._submission_time || "Desconocida";
      document.getElementById('ultima-actualizacion').innerText = `Última sincronización: ${ultimaFecha.replace('T', ' ').slice(0, 16)}`;
    }
  })
  .catch(err => {
    console.error("Error al cargar archivos JSON:", err);
  });
}

function dibujarAforadoresEnMapa(aforadores) {
  aforadores.forEach(afo => {
    // Intenta extraer coordenadas (adaptar nombres de campos según tu Kobo)
    const lat = afo._geolocation ? afo._geolocation[0] : afo.latitud || afo.lat;
    const lon = afo._geolocation ? afo._geolocation[1] : afo.longitud || afo.lon;
    const nombre = afo.nombre || afo.aforador || afo.id || "Aforador";

    if (lat && lon) {
      const marker = L.marker([lat, lon]).addTo(mapa);
      marker.bindPopup(`<b>${nombre}</b>`);
      marcadores[nombre] = marker;
    }
  });
}

function procesarCajitasYTabla(mediciones) {
  const kpiContainer = document.getElementById('kpi-container');
  const tablaBody = document.getElementById('tabla-body');

  kpiContainer.innerHTML = '';
  tablaBody.innerHTML = '';

  if (!mediciones || mediciones.length === 0) {
    kpiContainer.innerHTML = '<div class="kpi-card">Sin datos recientes</div>';
    tablaBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Sin mediciones disponibles</td></tr>';
    return;
  }

  // Agrupar la última medición de cada aforador para las tarjetas
  const ultimasMedicionesPorAforador = {};

  mediciones.forEach(m => {
    const aforador = m.aforador || m.nombre_aforador || m.id_aforador || "Aforador Generico";
    if (!ultimasMedicionesPorAforador[aforador]) {
      ultimasMedicionesPorAforador[aforador] = m;
    }

    // Llenar tabla
    const fecha = m._submission_time ? m._submission_time.replace('T', ' ').slice(0, 16) : (m.today || '-');
    const valor = m.caudal || m.nivel || m.medicion || '-';
    const obs = m.observaciones || m.notas || '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fecha}</td>
      <td><b>${aforador}</b></td>
      <td>${valor}</td>
      <td>${obs}</td>
    `;
    tablaBody.appendChild(tr);
  });

  // Generar cajitas
  Object.keys(ultimasMedicionesPorAforador).forEach(nombre => {
    const m = ultimasMedicionesPorAforador[nombre];
    const valor = m.caudal || m.nivel || m.medicion || '0';
    const fecha = m._submission_time ? m._submission_time.slice(0, 10) : '';

    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.innerHTML = `
      <div class="kpi-title">${nombre}</div>
      <div class="kpi-value">${valor}</div>
      <div class="kpi-date">Último dato: ${fecha}</div>
    `;
    kpiContainer.appendChild(card);
  });
}

function cargarHistorialCompleto() {
  const btn = document.getElementById('btn-historial');
  btn.innerText = "Cargando...";
  btn.disabled = true;

  fetch('historial_completo.json')
    .then(r => r.json())
    .then(historial => {
      procesarCajitasYTabla(historial);
      btn.innerText = "Historial Completo Cargado";
    })
    .catch(err => {
      console.error("Error al cargar historial completo:", err);
      btn.innerText = "Error al cargar";
      btn.disabled = false;
    });
}
