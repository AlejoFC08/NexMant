// URL oficial de Google Apps Script (Personal)
const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbz8jOwMXlHLB27ozeCOLJbj6q9uhox9hR_B1KyK5eNoyQnDpZ65i941LL1YYyakPcOO9g/exec';

const contenedorServicios = document.getElementById('contenedor-servicios');

async function cargarServicios() {
    try {
        const response = await fetch(URL_GOOGLE_SCRIPT);
        const servicios = await response.json();

        if (!servicios || servicios.length === 0) {
            contenedorServicios.innerHTML = '<p style="text-align: center; color: #666; width: 100%;">No hay servicios disponibles en este momento.</p>';
            return;
        }

        contenedorServicios.innerHTML = '';
        const numeroWa = '5491165778502';

        servicios.forEach(servicio => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'service-card';

            const mensaje = `Hola NexMant, necesito cotizar un trabajo de ${servicio.titulo}.`;
            const urlWa = `https://wa.me/${numeroWa}?text=${encodeURIComponent(mensaje)}`;

            const imagenHtml = servicio.imagen_url 
                ? `<img src="${servicio.imagen_url}" alt="${servicio.titulo}" class="service-img">` 
                : '<div style="width:100%; height:200px; background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">Sin foto</div>';

            tarjeta.innerHTML = `
                ${imagenHtml}
                <div class="service-card-content">
                    <h3>${servicio.titulo}</h3>
                    <p>${servicio.descripcion}</p>
                    <a href="${urlWa}" target="_blank" class="btn-cotizar">Consultar</a>
                </div>
            `;
            contenedorServicios.appendChild(tarjeta);
        });

    } catch (error) {
        console.error('Error al cargar servicios desde Google Sheets:', error);
        contenedorServicios.innerHTML = '<p style="text-align: center; color: red; width: 100%;">Error al conectar con el servidor de contenidos.</p>';
    }
}

cargarServicios();