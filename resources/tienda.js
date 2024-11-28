let listadoProductos = []

document.addEventListener('DOMContentLoaded', function () {
    fetch('data/productos.json')
        .then(respuesta => respuesta.json())
        .then(resultado => {
            listadoProductos = resultado;
            mostrarProductos(resultado);
        })
        .catch(error => console.log(error + "hubo un error"));

    cargarCarritoDeLocalStorage();
});


const productosContainer = document.getElementById('productos')
const cartelCarrito = document.querySelector('#lista-carrito')
let articulosCarrito = [];

function mostrarProductos(productos = []) {

    productos.forEach(producto => {
        const { id, nombre, precio, descripcion, imagen } = producto;
        let cardHtml = `
         <div class="col-md-4 text-center">
              <div class="card mb-4">
                <img
                  src="${imagen}"
                  alt="${nombre}"
                  class="card-img-top"
                />
                <div class="card-body">
                  <h3 class="card-title mb-3">${nombre}</h3>
                  <h4 class="card-subtitle mb-2 text-body-secondary">
                    $${precio}
                  </h4>
                  <p class="card-text">
                    ${descripcion}
                  </p>
                  <button
                    onclick="agregarProducto(${id})"         
                    class="btn btn-primary w-100 input agregar-torta"
                    >Agregar</button
                  >
                </div>
              </div>
            </div>
        `
        productosContainer.innerHTML += cardHtml;

    });
}


function agregarProducto(idTorta) {
    Toastify({
        text: "¡Torta agregada al carrito!",
        duration: 3000,
        gravity: "bottom",
        style: {
            background: "rgb(63, 112, 63)"
        }
    }).showToast();

    const producto = listadoProductos.find(prod => prod.id === idTorta);

    if (producto) {
        armarCarrito(producto)
    }
}


function eliminarProducto(idTorta) {
    const productoId = articulosCarrito.find(prod => prod.id === idTorta);

    if (productoId) {
        if (productoId.cantidad > 1) {
            productoId.cantidad--;
        } else {
            articulosCarrito = articulosCarrito.filter(producto => producto.id !== idTorta);
        }

        guardarCarritoEnLocalStorage();
        actualizarCartCount()
        carritoHTML();
    }
}


function armarCarrito(producto) {
    const { id, nombre, precio, imagen } = producto;
    const datosProducto = {
        imagen,
        nombre,
        precio,
        id,
        cantidad: 1
    }

    if (articulosCarrito.some(producto => producto.id === datosProducto.id)) {
        const productos = articulosCarrito.map(producto => {
            if (producto.id === datosProducto.id) {
                let cantidad = parseInt(producto.cantidad);
                cantidad++
                producto.cantidad = cantidad;
                return producto;
            } else {
                return producto;
            }
        })
        articulosCarrito = [...productos];
    } else {
        articulosCarrito = [...articulosCarrito, datosProducto]
    }
    guardarCarritoEnLocalStorage();
    actualizarCartCount()
    carritoHTML();
}



function carritoHTML() {
    limpiarCarrito();
    const p = document.createElement('p');
    p.innerHTML = "El carrito está vacío."
    if (articulosCarrito.length > 0) {

        articulosCarrito.forEach(producto => {
            const div = document.createElement('div');
            div.classList.add('mb-5')
            div.innerHTML = `
            
            <div>
                <img src="${producto.imagen}" class="w-100 mb-2">
            </div>
            <div>
                <h3>${producto.nombre}</h3>
                <h4>$${producto.precio}</h4>
                <span >Cantidad: ${producto.cantidad}</span>
            </div>
            <a href="#" class="btn btn-primary mt-2" onclick="eliminarProducto(${producto.id})">-</a>
            <a href="#" class="btn btn-primary mt-2" onclick="agregarProducto(${producto.id})">+</a>
            
            `;

            cartelCarrito.appendChild(div);
        })

        const total = document.createElement('p');
        total.classList.add('mt-5', 'fs-4');
        total.innerHTML = `Total por ${calcularTotalProductos() > 1 ? calcularTotalProductos() + ' productos' : calcularTotalProductos() + ' producto'}:<br> $${calcularTotalPrecio()}`
        cartelCarrito.appendChild(total)
        const finalizarCompra = document.createElement('button');
        finalizarCompra.classList.add('btn', 'btn-primary', 'fs-3', 'w-100');
        finalizarCompra.textContent = 'Finalizar compra'
        cartelCarrito.appendChild(finalizarCompra);

        finalizarCompra.onclick = function () {
            Swal.fire({
                title: "¿Desea confirmar la compra?",
                showDenyButton: true,
                confirmButtonText: "Confirmar",
                denyButtonText: `Cancelar`,
                confirmButtonColor: 'rgb(63, 112, 63)'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "¡Compra realizada con éxito!",
                        confirmButtonText: "Volver",
                        confirmButtonColor: "#bc7a7a"
                    })
                    vaciarCarrito();

                }
            });
        }

        const vaciarCarritoBtn = document.createElement('button');
        vaciarCarritoBtn.classList.add('btn', 'btn-danger', 'fs-5', 'w-90', 'mt-4');
        vaciarCarritoBtn.textContent = 'Vaciar carrito'
        cartelCarrito.appendChild(vaciarCarritoBtn);

        vaciarCarritoBtn.onclick = function () {
            Swal.fire({
                title: "¿Seguro que desea vaciar el carrito?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#b14b4b",
                cancelButtonColor: "#817878",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    vaciarCarrito();
                }
            });
        }

    } else {

        cartelCarrito.appendChild(p);
    }
}


function guardarCarritoEnLocalStorage() {
    localStorage.setItem('articulosCarrito', JSON.stringify(articulosCarrito));
}


function cargarCarritoDeLocalStorage() {
    const carritoGuardado = localStorage.getItem('articulosCarrito');
    if (carritoGuardado) {
        articulosCarrito = JSON.parse(carritoGuardado);
        carritoHTML();
        actualizarCartCount();
    }
}


function calcularTotalProductos() {
    return articulosCarrito.reduce((total, producto) => total + producto.cantidad, 0);
}


function actualizarCartCount() {
    const totalProductos = calcularTotalProductos();
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
        cartCount.textContent = totalProductos;
    }
}


function calcularTotalPrecio() {
    return articulosCarrito.reduce((total, producto) => (total + producto.precio * producto.cantidad), 0)
}


function limpiarCarrito() {
    while (cartelCarrito.firstChild) {
        cartelCarrito.removeChild(cartelCarrito.firstChild);
    }
}


function vaciarCarrito() {
    localStorage.removeItem('articulosCarrito');
    articulosCarrito = []
    carritoHTML();
    actualizarCartCount();
}