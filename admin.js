// URL oficial de Google Apps Script (Personal)
const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbz8jOwMXlHLB27ozeCOLJbj6q9uhox9hR_B1KyK5eNoyQnDpZ65i941LL1YYyakPcOO9g/exec';

const formulario = document.getElementById('form-servicio');
const btnGuardar = document.getElementById('btn-guardar');
const divMensaje = document.getElementById('mensaje');
const listaAdmin = document.getElementById('lista-servicios-admin');

// --- 1. FUNCIÓN PARA LISTAR SERVICIOS EXISTENTES ---
async function listarServiciosAdmin() {
    try {
        const response = await fetch(URL_GOOGLE_SCRIPT);
        const servicios = await response.json();

        if (!servicios || servicios.length === 0) {
            listaAdmin.innerHTML = '<p style="color: #999; text-align: center;">No hay servicios cargados todavía.</p>';
            return;
        }

        listaAdmin.innerHTML = ''; 

        servicios.reverse().forEach(serv => {
            const item = document.createElement('div');
            item.className = 'admin-item';

            const imgTag = serv.imagen_url ? `<img src="${serv.imagen_url}">` : '<div style="width:60px;height:60px;background:#eee;border-radius:4px;"></div>';

            item.innerHTML = `
                ${imgTag}
                <div class="admin-item-info">
                    <h4>${serv.titulo}</h4>
                    <p>${serv.descripcion ? serv.descripcion.substring(0, 60) : ''}...</p>
                </div>
                <button class="btn-danger" onclick="eliminarServicio(${serv.id})">Eliminar</button>
            `;
            listaAdmin.appendChild(item);
        });

    } catch (error) {
        console.error("Error al listar:", error);
        listaAdmin.innerHTML = '<p style="color: red; text-align: center;">Error al cargar la lista desde Google Sheets.</p>';
    }
}

// --- 2. FUNCIÓN PARA ELIMINAR UN SERVICIO ---
window.eliminarServicio = async function(id) {
    if (!confirm("¿Estás seguro de que querés eliminar este servicio? Se borrará de la web inmediatamente.")) return;

    try {
        const response = await fetch(URL_GOOGLE_SCRIPT, {
            method: 'POST',
            redirect: 'follow', 
            headers: {
                "Content-Type": "text/plain;charset=utf-8", 
            },
            body: JSON.stringify({ action: 'delete', id: id })
        });
        
        const res = await response.json();
        if (res.status === 'success') {
            listarServiciosAdmin();
            alert("Servicio eliminado con éxito.");
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        alert("No se pudo eliminar: " + error.message);
    }
};

// --- 3. LÓGICA PARA ENVIAR NUEVO SERVICIO ---
formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    btnGuardar.disabled = true;
    btnGuardar.innerText = "Guardando en Google Sheets...";
    divMensaje.innerHTML = "";

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const archivoImagen = document.getElementById('imagen').files[0];

    const reader = new FileReader();
    reader.readAsDataURL(archivoImagen);
    reader.onload = async function() {
        const base64Img = reader.result;

        try {
            const response = await fetch(URL_GOOGLE_SCRIPT, {
                method: 'POST',
                redirect: 'follow',
                headers: {
                    "Content-Type": "text/plain;charset=utf-8", 
                },
                body: JSON.stringify({
                    action: 'create',
                    titulo: titulo,
                    descripcion: descripcion,
                    imagenBase64: base64Img,
                    imagenNombre: archivoImagen.name
                })
            });

            const res = await response.json();

            if (res.status === 'success') {
                divMensaje.innerHTML = `<span class="exito">¡Guardado con éxito en Google Sheets!</span>`;
                formulario.reset();
                listarServiciosAdmin();
            } else {
                throw new Error(res.message);
            }

        } catch (error) {
            console.error(error);
            divMensaje.innerHTML = `<span class="error">Error: No se pudo conectar con el servidor.</span>`;
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar Servicio";
        }
    };
});

listarServiciosAdmin();