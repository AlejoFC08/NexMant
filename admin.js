// 1. Inicialización con nombre único para evitar colisiones
const supabaseUrl = 'https://vngeqappllasvobqolie.supabase.co';
const supabaseKey = 'sb_publishable_AaIfYPmLCIDYnUXutFBEkg_8nIKe-Lv';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const formulario = document.getElementById('form-servicio');
const btnGuardar = document.getElementById('btn-guardar');
const divMensaje = document.getElementById('mensaje');
const listaAdmin = document.getElementById('lista-servicios-admin');

// --- 1. FUNCIÓN PARA MOSTRAR LOS SERVICIOS EXISTENTES ---
async function listarServiciosAdmin() {
    try {
        const { data: servicios, error } = await supabaseClient
            .from('servicios')
            .select('*')
            .order('creado_en', { ascending: false });

        if (error) throw error;

        if (!servicios || servicios.length === 0) {
            listaAdmin.innerHTML = '<p style="color: #999; text-align: center;">No hay servicios cargados todavía.</p>';
            return;
        }

        listaAdmin.innerHTML = ''; 

        servicios.forEach(serv => {
            const item = document.createElement('div');
            item.className = 'admin-item';

            const imgTag = serv.imagen_url ? `<img src="${serv.imagen_url}">` : '<div style="width:60px;height:60px;background:#eee;border-radius:4px;"></div>';

            item.innerHTML = `
                ${imgTag}
                <div class="admin-item-info">
                    <h4>${serv.titulo}</h4>
                    <p>${serv.descripcion ? serv.descripcion.substring(0, 60) : ''}...</p>
                </div>
                <button class="btn-danger" onclick="eliminarServicio(${serv.id}, '${serv.imagen_url || ''}')">Eliminar</button>
            `;
            listaAdmin.appendChild(item);
        });

    } catch (error) {
        console.error("Error al listar:", error);
        listaAdmin.innerHTML = '<p style="color: red; text-align: center;">Error al cargar la lista.</p>';
    }
}

// --- 2. FUNCIÓN PARA ELIMINAR UN SERVICIO ---
window.eliminarServicio = async function(id, imagenUrl) {
    if (!confirm("¿Estás seguro de que querés eliminar este servicio?")) return;

    try {
        const { error: dbError } = await supabaseClient
            .from('servicios')
            .delete()
            .eq('id', id);

        if (dbError) throw dbError;

        if (imagenUrl) {
            const nombreArchivo = imagenUrl.split('/').pop();
            await supabaseClient.storage.from('imagenes-servicios').remove([nombreArchivo]);
        }

        listarServiciosAdmin();
        alert("Servicio eliminado con éxito.");

    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el servicio: " + error.message);
    }
};

// --- 3. LÓGICA PARA CREAR / SUBIR NUEVO SERVICIO ---
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnGuardar.disabled = true;
    btnGuardar.innerText = "Guardando...";
    divMensaje.innerHTML = "";

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const archivoImagen = document.getElementById('imagen').files[0];

    try {
        const nombreUnico = `${Date.now()}_${archivoImagen.name}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('imagenes-servicios')
            .upload(nombreUnico, archivoImagen);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseClient.storage
            .from('imagenes-servicios')
            .getPublicUrl(nombreUnico);
        
        const linkImagen = urlData.publicUrl;

        const { error: insertError } = await supabaseClient
            .from('servicios')
            .insert([{ titulo: titulo, descripcion: descripcion, imagen_url: linkImagen }]);

        if (insertError) throw insertError;

        divMensaje.innerHTML = `<span class="exito">¡Guardado con éxito!</span>`;
        formulario.reset();
        listarServiciosAdmin();

    } catch (error) {
        console.error("Error:", error);
        divMensaje.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerText = "Guardar Servicio";
    }
});

// Arrancar la lista al cargar
listarServiciosAdmin();