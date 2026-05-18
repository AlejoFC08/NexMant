// URL de tu aplicación web de Google Apps Script
const apiURL = 'https://script.google.com/macros/s/AKfycbz-3Z-IqCqZja3vesxOgsyw63Z9pbr4qrNWMbVra5TjWmJUyFOnwKspnJQRwpjWzXnF/exec'; 
const contenedorServicios = document.getElementById('contenedor-servicios');

async function cargarServicios() {
    try {
        const respuesta = await fetch(apiURL);
        const servicios = await respuesta.json();

        // Limpiamos el contenedor (borra las tarjetas de ejemplo del HTML)
        contenedorServicios.innerHTML = '';

        // Número oficial de NexMant con código de país para que funcione el link
        const numeroWa = '5491165778502';

        servicios.forEach(servicio => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'service-card';

            // Armamos el link de WhatsApp dinámico para cada servicio
            const mensaje = `Hola NexMant, necesito cotizar un trabajo de ${servicio.titulo}.`;
            const urlWa = `https://wa.me/${numeroWa}?text=${encodeURIComponent(mensaje)}`;

            tarjeta.innerHTML = `
                <h3>${servicio.titulo}</h3>
                <p>${servicio.descripcion}</p>
                <a href="${urlWa}" target="_blank" class="btn-cotizar">Consultar</a>
            `;
            
            contenedorServicios.appendChild(tarjeta);
        });
    } catch (error) {
        console.error('Error al cargar los servicios:', error);
        contenedorServicios.innerHTML = '<p>Error al cargar los servicios. Por favor, revisa la conexión.</p>';
    }
}

// Ejecutamos la función al cargar la página
cargarServicios();