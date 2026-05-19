const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbz8jOwMXlHLB27ozeCOLJbj6q9uhox9hR_B1KyK5eNoyQnDpZ65i941LL1YYyakPcOO9g/exec';

// selectores de servicios
const formulario = document.getElementById('form-servicio');
const btnGuardar = document.getElementById('btn-guardar');
const divMensaje = document.getElementById('mensaje');
const listaAdmin = document.getElementById('lista-servicios-admin');

// selectores de trabajos
const formularioTrabajo = document.getElementById('form-trabajo');
const btnGuardarTrabajo = document.getElementById('btn-guardar-trabajo');
const divMensajeTrabajo = document.getElementById('mensaje-trabajo');
const listaTrabajosAdminCont = document.getElementById('lista-trabajos-admin');

let todosLosServicios = [];
let todosLosTrabajos = [];
let idEditando = null;

const btnCancelar = document.createElement('button');
btnCancelar.type = 'button';
btnCancelar.className = 'btn-danger';
btnCancelar.style.marginTop = '10px';
btnCancelar.style.width = '100%';
btnCancelar.style.display = 'none';
btnCancelar.innerText = 'Cancelar Edición';
formulario.appendChild(btnCancelar);

// --- INTERRUPTOR DE PESTAÑAS (TABS) ---
window.switchTab = function(tab) {
    if (tab === 'servicios') {
        document.getElementById('dashboard-servicios').style.display = 'grid';
        document.getElementById('dashboard-trabajos').style.display = 'none';
        document.getElementById('tab-servicios').classList.add('active');
        document.getElementById('tab-trabajos').classList.remove('active');
        listarServiciosAdmin();
    } else {
        document.getElementById('dashboard-servicios').style.display = 'none';
        document.getElementById('dashboard-trabajos').style.display = 'grid';
        document.getElementById('tab-servicios').classList.remove('active');
        document.getElementById('tab-trabajos').classList.add('active');
        listarTrabajosAdmin();
    }
};

// --- OPERACIONES DE SERVICIOS ---
async function listarServiciosAdmin() {
    try {
        const response = await fetch(URL_GOOGLE_SCRIPT);
        todosLosServicios = await response.json();
        if (!todosLosServicios || todosLosServicios.length === 0) {
            listaAdmin.innerHTML = '<p style="color: #999; text-align: center;">No hay servicios cargados.</p>';
            return;
        }
        listaAdmin.innerHTML = ''; 
        [...todosLosServicios].reverse().forEach(serv => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            let urlSegura = serv.imagen_url;
            if (urlSegura && urlSegura.includes("drive.google.com")) {
                const fileId = urlSegura.split("id=")[1];
                urlSegura = `https://drive.google.com/thumbnail?id=${fileId}&sz=400`;
            }
            const imgTag = urlSegura ? `<img src="${urlSegura}">` : '<div style="width:60px;height:60px;background:#eee;"></div>';
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
    } catch (e) { console.error(e); }
}

window.activarModoEdicion = function(id) {
    const servicio = todosLosServicios.find(s => s.id == id);
    if (!servicio) return;
    idEditando = id;
    document.getElementById('titulo').value = servicio.titulo;
    document.getElementById('descripcion').value = servicio.descripcion;
    document.getElementById('imagen').required = false; 
    btnGuardar.innerText = "Actualizar Servicio";
    btnCancelar.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

btnCancelar.addEventListener('click', () => {
    idEditando = null;
    formulario.reset();
    document.getElementById('imagen').required = true;
    btnGuardar.innerText = "Guardar Servicio";
    btnCancelar.style.display = 'none';
});

window.eliminarServicio = async function(id) {
    if (!confirm("¿Borrar este servicio de la web?")) return;
    try {
        const response = await fetch(URL_GOOGLE_SCRIPT, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({ action: 'delete', type: 'servicios', id: id })
        });
        const res = await response.json();
        if (res.status === 'success') {
            if(idEditando === id) btnCancelar.click();
            listarServiciosAdmin();
        }
    } catch (e) { alert("Error al borrar"); }
};

formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    btnGuardar.disabled = true;
    btnGuardar.innerText = "Guardando...";
    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const archivoImagen = document.getElementById('imagen').files[0];

    const enviar = async (base64Img = null, nombreImg = null) => {
        try {
            const payload = {
                action: idEditando ? 'update' : 'create',
                type: 'servicios',
                titulo: titulo,
                descripcion: descripcion
            };
            if(idEditando) payload.id = idEditando;
            if(base64Img) { payload.imagenBase64 = base64Img; payload.imagenNombre = nombreImg; }

            const response = await fetch(URL_GOOGLE_SCRIPT, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify(payload)
            });
            const res = await response.json();
            if (res.status === 'success') {
                btnCancelar.click();
                listarServiciosAdmin();
            }
        } catch (error) { console.error(error); }
        finally { btnGuardar.disabled = false; btnGuardar.innerText = "Guardar Servicio"; }
    };

    if (archivoImagen) {
        const reader = new FileReader();
        reader.readAsDataURL(archivoImagen);
        reader.onload = function() { enviar(reader.result, archivoImagen.name); };
    } else { enviar(); }
});

// --- OPERACIONES DE NUESTROS TRABAJOS ---
async function listarTrabajosAdmin() {
    try {
        const response = await fetch(`${URL_GOOGLE_SCRIPT}?type=trabajos`);
        todosLosTrabajos = await response.json();
        if (!todosLosTrabajos || todosLosTrabajos.length === 0) {
            listaTrabajosAdminCont.innerHTML = '<p style="color: #999; text-align: center;">No hay fotos cargadas todavía.</p>';
            return;
        }
        listaTrabajosAdminCont.innerHTML = '';
        [...todosLosTrabajos].reverse().forEach(trab => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            let urlSegura = trab.imagen_url;
            if (urlSegura && urlSegura.includes("drive.google.com")) {
                const fileId = urlSegura.split("id=")[1];
                urlSegura = `https://drive.google.com/thumbnail?id=${fileId}&sz=400`;
            }
            item.innerHTML = `
                <img src="${urlSegura}" style="width:80px; height:60px;">
                <div class="admin-item-info">
                    <p style="font-size:0.8rem; color:#666;">ID: ${trab.id}</p>
                </div>
                <button class="btn-danger" onclick="eliminarTrabajo(${trab.id})">Eliminar Foto</button>
            `;
            listaTrabajosAdminCont.appendChild(item);
        });
    } catch (e) { console.error(e); }
}

window.eliminarTrabajo = async function(id) {
    if (!confirm("¿Estás seguro de que querés eliminar esta foto del carrusel?")) return;
    try {
        const response = await fetch(URL_GOOGLE_SCRIPT, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify({ action: 'delete', type: 'trabajos', id: id })
        });
        const res = await response.json();
        if (res.status === 'success') { listarTrabajosAdmin(); }
    } catch (e) { alert("Error al eliminar"); }
};

formularioTrabajo.addEventListener('submit', function(e) {
    e.preventDefault();
    btnGuardarTrabajo.disabled = true;
    btnGuardarTrabajo.innerText = "Subiendo imagen...";
    divMensajeTrabajo.innerHTML = "";
    
    const archivoImagen = document.getElementById('imagen-trabajo').files[0];
    const reader = new FileReader();
    reader.readAsDataURL(archivoImagen);
    reader.onload = async function() {
        try {
            const response = await fetch(URL_GOOGLE_SCRIPT, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({
                    action: 'create',
                    type: 'trabajos',
                    imagenBase64: reader.result,
                    imagenNombre: archivoImagen.name
                })
            });
            const res = await response.json();
            if (res.status === 'success') {
                divMensajeTrabajo.innerHTML = `<span class="exito">¡Foto subida con éxito!</span>`;
                formularioTrabajo.reset();
                listarTrabajosAdmin();
            }
        } catch (error) { divMensajeTrabajo.innerHTML = `<span class="error">Error de servidor.</span>`; }
        finally { btnGuardarTrabajo.disabled = false; btnGuardarTrabajo.innerText = "Guardar en Galería"; }
    };
});

listarServiciosAdmin();