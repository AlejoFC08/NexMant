// 1. Configuración e Inicialización de Supabase
const supabaseUrl = 'https://vngeqappllasvobqolie.supabase.co';
const supabaseKey = 'sb_publishable_AaIfYPmLCIDYnUXutFBEkg_8nIKe-Lv'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Capturamos el contenedor del HTML usando su ID exacto
const contenedorServicios = document.getElementById('contenedor-servicios');

// 2. Función asíncrona para consultar y renderizar los servicios
async function cargarServicios() {
    try {
        // Hacemos la consulta a la tabla 'servicios' ordenando por fecha de creación
        const { data: servicios, error } = await supabase
            .from('servicios')
            .select('*')
            .order('creado_en', { ascending: true });

        if (error) throw error;

        // Si la tabla está vacía
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

            // Validamos la foto del Storage
            const imagenHtml = servicio.imagen_url 
                ? `<img src="${servicio.imagen_url}" alt="${servicio.titulo}" class="service-img">` 
                : '<div style="width:100%; height:200px; background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">Sin foto</div>';

            // Inyectamos la estructura respetando los nuevos estilos unificados
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
        console.error('Error crítico al cargar los servicios de Supabase:', error);
        contenedorServicios.innerHTML = '<p style="text-align: center; color: red; width: 100%;">Error al conectar con el servidor de contenidos. Por favor, reintentá más tarde.</p>';
    }
}

// Ejecutamos al cargar
cargarServicios();