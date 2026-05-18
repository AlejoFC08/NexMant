// 1. Inicializar Supabase (Reemplazá con tu llave)
const supabaseUrl = 'https://vngeqappllasvobqolie.supabase.co';
const supabaseKey = 'sb_publishable_AaIfYPmLCIDYnUXutFBEkg_8nIKe-Lv'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const formulario = document.getElementById('form-servicio');
const btnGuardar = document.getElementById('btn-guardar');
const divMensaje = document.getElementById('mensaje');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página recargue al enviar
    btnGuardar.disabled = true;
    btnGuardar.innerText = "Subiendo archivo y guardando...";
    divMensaje.innerHTML = "";

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const archivoImagen = document.getElementById('imagen').files[0];

    try {
        // Paso A: Generar un nombre único para la foto y subirla al Storage
        const nombreUnico = `${Date.now()}_${archivoImagen.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('imagenes-servicios')
            .upload(nombreUnico, archivoImagen);

        if (uploadError) throw uploadError;

        // Paso B: Obtener el link público de la foto recién subida
        const { data: urlData } = supabase.storage
            .from('imagenes-servicios')
            .getPublicUrl(nombreUnico);
        
        const linkImagen = urlData.publicUrl;

        // Paso C: Guardar el texto y el link de la foto en la tabla "servicios"
        const { error: insertError } = await supabase
            .from('servicios')
            .insert([
                { titulo: titulo, descripcion: descripcion, imagen_url: linkImagen }
            ]);

        if (insertError) throw insertError;

        // Si todo sale bien, mostramos mensaje de éxito y vaciamos el formulario
        divMensaje.innerHTML = `<span class="exito">¡Servicio guardado correctamente!</span>`;
        formulario.reset();

    } catch (error) {
        console.error("Error:", error);
        divMensaje.innerHTML = `<span class="error">Hubo un error al guardar: ${error.message}</span>`;
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerText = "Guardar Servicio";
    }
});