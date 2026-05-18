// 1. Configuración e Inicialización de Supabase con nombre único
const supabaseUrl = 'https://vngeqappllasvobqolie.supabase.co';
const supabaseKey = 'sb_publishable_AaIfYPmLCIDYnUXutFBEkg_8nIKe-Lv'; 
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Capturamos el contenedor del HTML usando su ID exacto
const contenedorServicios = document.getElementById('contenedor-servicios');

// 2. Función asíncrona para consultar y renderizar los servicios
async function cargarServicios() {
    try {
        // Usamos la nueva variable supabaseClient
        const { data: servicios, error } = await supabaseClient
            .from('servicios')
            .select('*')
            .order('creado_en', { ascending: true });

        if (error) throw error;

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
        console.error('Error crítico al cargar los servicios:', error);
        contenedorServicios.innerHTML = '<p style="text-align: center; color: red; width: 100%;">Error al conectar con el servidor.</p>';
    }
}

// Ejecutamos al cargar
cargarServicios();