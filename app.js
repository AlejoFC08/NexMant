// 1. Configuración e Inicialización de Supabase
const supabaseUrl = 'https://vngeqappllasvobqolie.supabase.co';
const supabaseKey = 'TU_PUBLISHABLE_KEY_AQUÍ'; // <-- REEMPLAZÁ ESTO CON TU LLAVE LARGA (Publishable Key)
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Capturamos el contenedor del HTML usando su ID exacto
const contenedorServicios = document.getElementById('contenedor-servicios');

// 2. Función asíncrona para consultar y renderizar los servicios
async function cargarServicios() {
    try {
        // Hacemos la consulta a la tabla 'servicios' ordenando por fecha de creación (los primeros cargados primero)
        const { data: servicios, error } = await supabase
            .from('servicios')
            .select('*')
            .order('creado_en', { ascending: true });

        // Si Supabase devuelve un error en la consulta, lo lanzamos para que lo capture el catch
        if (error) throw error;

        // Si la tabla está vacía, mostramos un mensaje amigable
        if (!servicios || servicios.length === 0) {
            contenedorServicios.innerHTML = '<p style="text-align: center; color: #666; width: 100%;">No hay servicios disponibles en este momento.</p>';
            return;
        }

        // Limpiamos el texto de "Cargando servicios..." antes de dibujar las tarjetas reales
        contenedorServicios.innerHTML = '';
        
        // Número de WhatsApp configurado para las consultas
        const numeroWa = '5491165778502';

        // Recorremos el array de filas que llegó desde la base de datos
        servicios.forEach(servicio => {
            // Creamos un elemento div para la tarjeta
            const tarjeta = document.createElement('div');
            tarjeta.className = 'service-card';

            // Armamos el mensaje predefinido para WhatsApp codificando los espacios y caracteres especiales
            const mensaje = `Hola NexMant, necesito cotizar un trabajo de ${servicio.titulo}.`;
            const urlWa = `https://wa.me/${numeroWa}?text=${encodeURIComponent(mensaje)}`;

            // Validamos si el registro tiene asociada una URL de imagen en el Storage
            const imagenHtml = servicio.imagen_url 
                ? `<img src="${servicio.imagen_url}" alt="${servicio.titulo}" class="service-img">` 
                : '<div style="width:100%; height:200px; background:#eee; display:flex; align-items:center; justify-content:center; color:#999;">Sin foto</div>';

            // Inyectamos la estructura interna de la tarjeta
            tarjeta.innerHTML = `
                ${imagenHtml}
                <div class="service-card-content">
                    <h3>${servicio.titulo}</h3>
                    <p>${servicio.descripcion}</p>
                    <a href="${urlWa}" target="_blank" class="btn-cotizar">Consultar</a>
                </div>
            `;
            
            // Agregamos la tarjeta terminada al contenedor de la grilla
            contenedorServicios.appendChild(tarjeta);
        });

    } catch (error) {
        console.error('Error crítico al cargar los servicios de Supabase:', error);
        contenedorServicios.innerHTML = '<p style="text-align: center; color: red; width: 100%;">Error al conectar con el servidor de contenidos. Por favor, reintentá más tarde.</p>';
    }
}

// 3. Ejecutamos la función de carga inmediatamente al procesar el archivo
cargarServicios();