// 1. Inicializar Supabase
const supabaseUrl = 'https://vngeqappllasvobqolie.supabase.co';
const supabaseKey = 'sb_publishable_AaIfYPmLCIDYnUXutFBEkg_8nIKe-Lv'; // Pegá tu llave acá
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const contenedorServicios = document.getElementById('contenedor-servicios');

// 2. Función para traer los servicios desde la base de datos
async function cargarServicios() {
    try {
        // Hacemos la consulta SQL a la tabla "servicios"
        const { data: servicios, error } = await supabase
            .from('servicios')
            .select('*')
            .order('creado_en', { ascending: true }); // Ordena por fecha

        if (error) throw error;

        // Limpiamos el contenedor
        contenedorServicios.innerHTML = '';
        const numeroWa = '5491165778502';

        // Recorremos los datos que llegaron
        servicios.forEach(servicio => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'service-card';

            const mensaje = `Hola NexMant, necesito cotizar un trabajo de ${servicio.titulo}.`;
            const urlWa = `https://wa.me/${numeroWa}?text=${encodeURIComponent(mensaje)}`;

            // Verificamos si el servicio tiene foto
            const imagenHtml = servicio.imagen_url 
                ? `<img src="${servicio.imagen_url}" alt="${servicio.titulo}" class="service-img">` 
                : '';

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
        console.error('Error al cargar los servicios:', error);
        contenedorServicios.innerHTML = '<p>Error al cargar los servicios. Por favor, revisa la conexión.</p>';
    }
}

// Ejecutamos la función al cargar la página
cargarServicios();