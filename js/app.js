let cliente = {
    mesa: '',
    hora: '',
    pedido: [] 
};

const categorias = {
    1: 'Comidas',
    2: 'Bebidas',
    3: 'Postres'
};

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //revisar si un campo está vacio
    const camposVacios = [mesa, hora].some(campo => campo === '');
    if(camposVacios){
        const existeAlerta = document.querySelector('.invalid-feedback');
        if(!existeAlerta){
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return;
    }
    //asignar datos del form al obj cliente
        cliente = {...cliente, mesa, hora};
    //ocultar modal
        const modalFormulario = document.querySelector('#formulario');
        const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
        modalBootstrap.hide();
    //mostrar secciones
        mostrarSecciones();
    //obtener platillos de la API de json server
        obtenerPlatilllos();
    };

    function mostrarSecciones(){
        const seccionesOcultas = document.querySelectorAll('.d-none');
        seccionesOcultas.forEach(section => section.classList.remove('d-none'));
    };

    function obtenerPlatilllos(){
        const url = 'http://localhost:4000/platillos';
        fetch(url).then(respuesta => respuesta.json()).then(resultado => mostrarPlatillos(resultado));
    };

    function mostrarPlatillos(platillos){
        const contenido = document.querySelector('#platillos .contenido');

        platillos.forEach(platillo => {
            const row = document.createElement('DIV');
            row.classList.add('row', 'py-3', 'border-top');

            const nombre = document.createElement('DIV');
            nombre.classList.add('col-md-4');
            nombre.textContent = platillo.nombre;

            const precio = document.createElement('DIV');
            precio.classList.add('col-md-3', 'fw-bold');
            precio.textContent = `$${platillo.precio}`;

            const categoria = document.createElement('DIV');
            categoria.classList.add('col-md-3');
            categoria.textContent = categorias[platillo.categoria];

            const inputCanitdad = document.createElement('INPUT');
            inputCanitdad.type = 'number';
            inputCanitdad.min = 0;
            inputCanitdad.value = 0;
            inputCanitdad.id = `producto-${platillo.id}`;

            //funcion que detecta cantidad y platillo agregados
            inputCanitdad.onchange = function (){
                const cantidad = parseInt(inputCanitdad.value);
                agregarPlatillo({...platillo, cantidad});
            };

            const agregar = document.createElement('DIV');
            agregar.classList.add('col-md-2');
            agregar.appendChild(inputCanitdad);
            
            row.appendChild(nombre);
            row.appendChild(precio);
            row.appendChild(categoria);
            contenido.appendChild(row);
            row.appendChild(agregar);
        });
    };

    function agregarPlatillo(producto){
        //extraer el pedido actual
        let {pedido} = cliente;
        //revisar que la cantidad sea mayor a 0
        if(producto.cantidad > 0){
            //comprueba si el elemento ya existe en el array
            if(pedido.some(articulo => articulo.id === producto.id)){
                //actualizar cantidad del producto existente
                const pedidoActualizado = pedido.map(articulo => {
                    if(articulo.id === producto.id){
                        articulo.cantidad = producto.cantidad;
                    }
                    return articulo;
                });
                //se asigna el nuevo array a cliente.pedido
                cliente.pedido = [...pedidoActualizado];
            }else{
                //no existe asi que se agrega
                cliente.pedido = [...pedido, producto];
            };
        }else {
            //eliminar elementos cunado sean = a 0
            const resultado = pedido.filter(articulo => articulo.id != producto.id);
            cliente.pedido = [...resultado];
            };
            //limpiar el HTML
            limpiarHTML();
            if(cliente.pedido.length){
                //mostrar el resumen
                actualziarResumen();
            } else {
                mensajePedidodVacio();
            };
        };

        function actualziarResumen(){
            const contenido = document.querySelector('#resumen .contenido');

            const resumen =  document.createElement('DIV');
            resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

            const mesa = document.createElement('P');
            mesa.textContent = 'Mesa ';
            mesa.classList.add('fw-bold');

            const mesaSpan = document.createElement('SPAN');
            mesaSpan.textContent = cliente.mesa;
            mesaSpan.classList.add('fw-normal');
            
            
            const hora = document.createElement('P');
            hora.textContent = 'Hora ';
            hora.classList.add('fw-bold');

            const horaSpan = document.createElement('SPAN');
            horaSpan.textContent = cliente.hora;
            horaSpan.classList.add('fw-normal');
            
            mesa.appendChild(mesaSpan);
            hora.appendChild(horaSpan);

            const heading = document.createElement('H3');
            heading.textContent = 'Platillos consumidos';
            heading.classList.add('my-4', 'text-center');

            //iterar sobre los platios consumidos (array)
            const grupo = document.createElement('UL');
            grupo.classList.add('list-group');

            const {pedido} = cliente;
            pedido.forEach(articulo => {
                const {nombre, cantidad, precio, id} = articulo;

                const lista = document.createElement('LI');
                lista.classList.add('list-group-item');

                const nombreEl = document.createElement('H4');
                nombreEl.classList.add('my-4');
                nombreEl.textContent = nombre;

                const cantidadEl =  document.createElement('P');
                cantidadEl.textContent = `Cantidad: ${cantidad}`;
                cantidadEl.classList.add('fw-bold');

                
                const precioEl =  document.createElement('P');
                precioEl.textContent = `Precio $${precio}`;
                precioEl.classList.add('fw-bold');

                const subtotalEl =  document.createElement('P');
                subtotalEl.textContent = calcularSubtotal(precio, cantidad);
                subtotalEl.classList.add('fw-bold');

                const btnEliminar = document.createElement('BUTTON');
                btnEliminar.classList.add('btn', 'btn-danger');
                btnEliminar.textContent = 'Eliminar del pedido';

                //funcion para eliminar del pedido
                btnEliminar.onclick = function(){
                    eliminarProducto(id);
                };

                
                const idEl =  document.createElement('P');
                idEl.textContent = `Id: ${id}`;
                idEl.classList.add('fw-bold');

                lista.appendChild(nombreEl);
                lista.appendChild(cantidadEl);
                lista.appendChild(precioEl);
                lista.appendChild(subtotalEl);
                lista.appendChild(btnEliminar);

                grupo.appendChild(lista);
            });
            
            resumen.appendChild(heading);
            resumen.appendChild(mesa);
            resumen.appendChild(hora);
            resumen.appendChild(grupo);

            contenido.appendChild(resumen);

            //mostrar form de propinas
            fomrularioPropinas();
        };

        function limpiarHTML(){
        const contenido = document.querySelector('#resumen .contenido');
            while(contenido.firstChild){
                contenido.removeChild(contenido.firstChild);
            };
        };

        function calcularSubtotal(precio, cantidad){
            return `Subtotal $${precio * cantidad}`;
        };

        function eliminarProducto(id){
            const {pedido} = cliente;

            const resultado = pedido.filter(articulo => articulo.id != id);
            cliente.pedido = [...resultado];
            limpiarHTML();
            if(cliente.pedido.length){
                actualziarResumen();
            } else {
                mensajePedidodVacio();
            };
            //productos eliminador, regresar contador a 0
            const productoEliminado = `#producto-${id}`;
            const inputEliminado = document.querySelector(productoEliminado);
            inputEliminado.value = 0;
        };

        function mensajePedidodVacio(){
            const contenido = document.querySelector('#resumen .contenido');
            const texto = document.createElement('P');
            texto.classList.add('text-center');
            texto.textContent = 'Añade los elementos del pedido';

            contenido.appendChild(texto);
        };

        function fomrularioPropinas(){
            const contenido = document.querySelector('#resumen .contenido');

            const formulario = document.createElement('DIV');
            formulario.classList.add('col-md-6','formulario');

            const divFormulario = document.createElement('DIV');
            divFormulario.classList.add('card', 'py-2', 'py-3', 'shadow');

            const heading = document.createElement('H3');
            heading.classList.add('my-4', 'text-center');
            heading.textContent = 'Propina';

            //radio Button 10%
            const radio10 = document.createElement('INPUT');
            radio10.type = 'radio';
            radio10.name = 'propina';
            radio10.value = "10";
            radio10.classList.add('form-check-input');
            radio10.onclick = calcularPropina;

            const radio10Label = document.createElement('LABEL');
            radio10Label.textContent = '10%';
            radio10Label.classList.add('form-check-label');
            
            const radio10Div = document.createElement('DIV');
            radio10Div.classList.add('form-check');

            radio10Div.appendChild(radio10);
            radio10Div.appendChild(radio10Label);

            
            //radio Button 25%
            const radio25 = document.createElement('INPUT');
            radio25.type = 'radio';
            radio25.name = 'propina';
            radio25.value = "25";
            radio25.classList.add('form-check-input');
            radio25.onclick = calcularPropina;


            const radio25Label = document.createElement('LABEL');
            radio25Label.textContent = '25%';
            radio25Label.classList.add('form-check-label');
            
            const radio25Div = document.createElement('DIV');
            radio25Div.classList.add('form-check');

            radio25Div.appendChild(radio25);
            radio25Div.appendChild(radio25Label);

            
            //radio Button 50%
            const radio50 = document.createElement('INPUT');
            radio50.type = 'radio';
            radio50.name = 'propina';
            radio50.value = "50";
            radio50.classList.add('form-check-input');
            radio50.onclick = calcularPropina;


            const radio50Label = document.createElement('LABEL');
            radio50Label.textContent = '50%';
            radio50Label.classList.add('form-check-label');
            
            const radio50Div = document.createElement('DIV');
            radio50Div.classList.add('form-check');

            radio50Div.appendChild(radio50);
            radio50Div.appendChild(radio50Label);

            divFormulario.appendChild(heading);
            divFormulario.appendChild(radio10Div);
            divFormulario.appendChild(radio25Div);
            divFormulario.appendChild(radio50Div);


            formulario.appendChild(divFormulario);
            contenido.appendChild(formulario);
        };

        function calcularPropina(){
            const {pedido} = cliente;
            let subtotal = 0;

            //calulcar el subtotal a pagar
            pedido.forEach(articulo => {
                subtotal += articulo.cantidad * articulo.precio;
            });

            //seleccionar la propina
            const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

            //calcular la propina
            const propina = ((subtotal * parseInt(propinaSeleccionada))/100);
            //calcular total a pagar
            const total = subtotal + propina;

            mostrarTotalHtml(subtotal, total, propina);
        };    

        function mostrarTotalHtml(subtotal, total, propina){
            const divTotales = document.createElement('DIV');
            divTotales.classList.add('total-pagar');

            //subtotal
            const subtotalParrafo = document.createElement('P');
            subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
            subtotalParrafo.textContent = 'Subtotal Cosumo: ';

            const subtotalSpan = document.createElement('SPAN');
            subtotalSpan.classList.add('fw-normal');
            subtotalSpan.textContent = `$${subtotal}`;

            subtotalParrafo.appendChild(subtotalSpan);
            divTotales.appendChild(subtotalParrafo);

            //propina
            const propinaParrafo = document.createElement('P');
            propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
            propinaParrafo.textContent = 'Propina: ';

            const propinaSpan = document.createElement('SPAN');
            propinaSpan.classList.add('fw-normal');
            propinaSpan.textContent = `$${propina}`;

            propinaParrafo.appendChild(propinaSpan);
            divTotales.appendChild(propinaParrafo);

            
            //total
            const totalParrafo = document.createElement('P');
            totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-2');
            totalParrafo.textContent = 'Total a Pagar: ';

            const totalSpan = document.createElement('SPAN');
            totalSpan.classList.add('fw-normal');
            totalSpan.textContent = `$${total}`;

            totalParrafo.appendChild(totalSpan);
            divTotales.appendChild(totalParrafo);

            //limpair html
            const totalPagarDiv = document.querySelector('.total-pagar');
            if(totalPagarDiv){
                totalPagarDiv.remove();
            };

            const formulario = document.querySelector('.formulario');
            formulario.appendChild(divTotales);
        };