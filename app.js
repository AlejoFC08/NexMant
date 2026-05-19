const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbz8jOwMXlHLB27ozeCOLJbj6q9uhox9hR_B1KyK5eNoyQnDpZ65i941LL1YYyakPcOO9g/exec';

const contenedorServicios = document.getElementById('contenedor-servicios');
const contenedorTrabajos = document.getElementById('contenedor-trabajos');

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

            let urlSegura = servicio.imagen_url;
            if (urlSegura && urlSegura.includes("drive.google.com")) {
                const fileId = urlSegura.split("id=")[1];
                urlSegura = `https://drive.google.com/thumbnail?id=${fileId}&sz=1000`;
            }

            const imagenHtml = urlSegura 
                ? `<img src="${urlSegura}" alt="${servicio.titulo}" class="service-img">` 
                : '<div style="width:100%; height:200px; background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">Sin foto</div>';

            const mensaje = `Hola NexMant, necesito cotizar un trabajo de ${servicio.titulo}.`;
            const urlWa = `https://wa.me/${numeroWa}?text=${encodeURIComponent(mensaje)}`;

            tarjeta.innerHTML = `
                ${imagenHtml}
                <div class="service-card-content">
                    <h3>${servicio.titulo}</h3>
                    <p>${servicio.descripcion}</p>
                    <a href="${urlWa}" target="_blank" class="btn-cotizar">Consultar</a>
                </div>
            `;
            
            tarjeta.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-cotizar')) return;
                tarjeta.classList.toggle('active');
            });

            contenedorServicios.appendChild(tarjeta);
        });
    } catch (error) {
        console.error('Error al cargar servicios:', error);
    }
}

async function cargarTrabajos() {
    if (!contenedorTrabajos) return;
    try {
        const response = await fetch(`${URL_GOOGLE_SCRIPT}?type=trabajos`);
        const trabajos = await response.json();

        if (!trabajos || trabajos.length === 0) {
            contenedorTrabajos.innerHTML = '<p style="text-align: center; color: var(--color-secundario); width: 100%;">Próximamente fotos de nuestros proyectos.</p>';
            return;
        }

        contenedorTrabajos.innerHTML = '';

        trabajos.reverse().forEach(trabajo => {
            const item = document.createElement('div');
            item.className = 'carousel-item';

            let urlSegura = trabajo.imagen_url;
            if (urlSegura && urlSegura.includes("drive.google.com")) {
                const fileId = urlSegura.split("id=")[1];
                urlSegura = `https://drive.google.com/thumbnail?id=${fileId}&sz=1000`;
            }

            item.innerHTML = `<img src="${urlSegura}" alt="Trabajo Realizado NexMant">`;
            contenedorTrabajos.appendChild(item);
        });

        const btnPrev = document.getElementById('prev-trabajo');
        const btnNext = document.getElementById('next-trabajo');

        if (btnPrev && btnNext) {
            btnPrev.onclick = () => {
                contenedorTrabajos.scrollBy({ left: -contenedorTrabajos.offsetWidth / 2, behavior: 'smooth' });
            };
            btnNext.onclick = () => {
                contenedorTrabajos.scrollBy({ left: contenedorTrabajos.offsetWidth / 2, behavior: 'smooth' });
            };
        }
    } catch (error) {
        console.error('Error al cargar trabajos:', error);
        contenedorTrabajos.innerHTML = '<p style="text-align: center; color: red; width: 100%;">Error al cargar la galería.</p>';
    }
}

cargarServicios();
cargarTrabajos();