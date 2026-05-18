const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbz8jOwMXlHLB27ozeCOLJbj6q9uhox9hR_B1KyK5eNoyQnDpZ65i941LL1YYyakPcOO9g/exec';

const formulario = document.getElementById('form-servicio');
const btnGuardar = document.getElementById('btn-guardar');
const divMensaje = document.getElementById('mensaje');
const listaAdmin = document.getElementById('lista-servicios-admin');

// Variables globales para controlar el estado de edición
let todosLosServicios = [];
let idEditando = null;

// Creamos dinámicamente un botón para poder cancelar la edición si el usuario se arrepiente
const btnCancelar = document.createElement('button');
btnCancelar.type = 'button';
btnCancelar.className = 'btn-danger';
btnCancelar.style.marginTop = '10px';
btnCancelar.style.width = '100%';
btnCancelar.style.display = 'none';
btnCancelar.innerText = 'Cancelar Edición';
formulario.appendChild(btnCancelar);

async function listarServiciosAdmin() {
    try {
        const response = await fetch(URL_GOOGLE_SCRIPT);
        todosLosServicios = await response.json();

        if (!todosLosServicios || todosLosServicios.length === 0) {
            listaAdmin.innerHTML = '<p style="color: #999; text-align: center;">No hay servicios cargados todavía.</p>';
            return;
        }

        listaAdmin.innerHTML = ''; 

        // Clonamos y damos vuelta el array para mostrar los más nuevos primero sin alterar el original
        [...todosLosServicios].reverse().forEach(serv => {
            const item = document.createElement('div');
            item.className = 'admin-item';

            let urlSegura = serv.imagen_url;
            if (urlSegura && urlSegura.includes("drive.google.com")) {
                const fileId = urlSegura.split("id=")[1];
                urlSegura = `https://drive.google.com/thumbnail?id=${fileId}&sz=400`;
            }

            const imgTag = urlSegura ? `<img src="${urlSegura}">` : '<div style="width:60px;height:60px;background:#eee;border-radius:4px;"></div>';

            item.innerHTML = `
                ${imgTag}
                <div class="admin-item-info">
                    <h4>${serv.titulo}</h4>
                    <p>${serv.descripcion ? serv.descripcion.substring(0, 50) : ''}...</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-submit" style="padding: 5px 10px; font-size:0.85rem;" onclick="activarModoEdicion(${serv.id})">Editar</button>
                    <button class="btn-danger" style="padding: 5px 10px; font-size:0.85rem;" onclick="eliminarServicio(${serv.id})">Eliminar</button>
                </div>
            `;
            listaAdmin.appendChild(item);
        });

    } catch (error) {
        console.error("Error al listar:", error);
        listaAdmin.innerHTML = '<p style="color: red; text-align: center;">Error al cargar la lista desde Google Sheets.</p>';
    }
}

// Pasar los datos del servicio seleccionado al formulario de la izquierda
window.activarModoEdicion = function(id) {
    const servicio = todosLosServicios.find(s => s.id == id);
    if (!servicio) return;

    idEditando = id;
    document.getElementById('titulo').value = servicio.titulo;
    document.getElementById('descripcion').value = servicio.descripcion;
    
    // Al editar la foto es opcional, removemos el 'required' por si quiere conservar la anterior
    document.getElementById('imagen').required = false; 
    
    btnGuardar.innerText = "Actualizar Servicio";
    btnGuardar.style.backgroundColor = "#25D366"; // Cambia a verde para indicar edición
    btnCancelar.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancelar el estado de edición y limpiar el formulario
btnCancelar.addEventListener('click', () => {
    idEditando = null;
    formulario.reset();
    document.getElementById('imagen').required = true;
    btnGuardar.innerText = "Guardar Servicio";
    btnGuardar.style.backgroundColor = "var(--color-primario)";
    btnCancelar.style.display = 'none';
});

window.eliminarServicio = async function(id) {
    if (!confirm("¿Estás seguro de que querés eliminar este servicio? Se borrará de la web inmediatamente.")) return;

    try {
        const response = await fetch(URL_GOOGLE_SCRIPT, {
            method: 'POST',
            redirect: 'follow', 
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: 'delete', id: id })
        });
        
        const res = await response.json();
        if (res.status === 'success') {
            if(idEditando === id) btnCancelar.click();
            listarServiciosAdmin();
            alert("Servicio eliminado con éxito.");
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        alert("No se pudo eliminar: " + error.message);
    }
};

formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    btnGuardar.disabled = true;
    btnGuardar.innerText = idEditando ? "Actualizando en Google Sheets..." : "Guardando en Google Sheets...";
    divMensaje.innerHTML = "";

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const archivoImagen = document.getElementById('imagen').files[0];

    const ejecutarEnvio = async (base64Img = null, nombreImg = null) => {
        try {
            const payload = {
                action: idEditando ? 'update' : 'create',
                titulo: titulo,
                descripcion: descripcion
            };

            if(idEditando) payload.id = idEditando;
            if(base64Img) {
                payload.imagenBase64 = base64Img;
                payload.imagenNombre = nombreImg;
            }

            const response = await fetch(URL_GOOGLE_SCRIPT, {
                method: 'POST',
                redirect: 'follow',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });

            const res = await response.json();

            if (res.status === 'success') {
                divMensaje.innerHTML = `<span class="exito">¡Procesado con éxito en Google Sheets!</span>`;
                btnCancelar.click(); // Resetea el formulario por defecto
                listarServiciosAdmin();
            } else {
                throw new Error(res.message);
            }

        } catch (error) {
            console.error(error);
            divMensaje.innerHTML = `<span class="error">Error al procesar la solicitud.</span>`;
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerText = idEditando ? "Actualizar Servicio" : "Guardar Servicio";
        }
    };

    if (archivoImagen) {
        const reader = new FileReader();
        reader.readAsDataURL(archivoImagen);
        reader.onload = function() {
            ejecutarEnvio(reader.result, archivoImagen.name);
        };
    } else {
        // Si estamos editando y no se eligió una foto nueva, procesa solo los textos
        ejecutarEnvio();
    }
});

listarServiciosAdmin();