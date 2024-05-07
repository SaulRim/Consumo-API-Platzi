const products = document.querySelector("#products");
const category = document.querySelector("#category");


// Tarjeta de información del producto
const tarjetaInfo = document.querySelector("#infoSection");
const optionSection = document.querySelector("#optionSection");
const titleCrud = document.querySelector("#titleCrud");
// Componentes que muestran la info
const imgInfo = document.querySelector("#imgInfo");
const productoInfo = document.querySelector("#productoInfo");
const precioInfo = document.querySelector("#precioInfo");
const categoriaInfo = document.querySelector("#categoriaInfo");
const descriptionInfo = document.querySelector("#descriptionInfo");

// Para post
const title = document.querySelector("#postTitle");
const price = document.querySelector("#postPrice");
const description = document.querySelector("#postDescription");
const image = document.querySelector("#postURL");
var selectElemento = document.getElementById('categoryOption');


const newProduct = document.querySelector("#newProduct");
const cerrarBotones = document.querySelectorAll(".cerrar");

// Variables globales del programa
let productosActuales = [];
let categoriasActuales = [];
let idSelection = undefined;
let operacion = "";
let idCategory = undefined;

// Una vez cargado la pagina inicia los metodos
window.addEventListener('load',start);

// botones para eliminar, abir el menu de catualizacion y mardar peticion para put y post
const deleteButton = document.querySelector("#deleteButton");
const putButton = document.querySelector("#putButton");
const postButtom = document.querySelector("#sendPost");

// Eventos para los botones
postButtom.addEventListener('click',enviarFormulario);
deleteButton.addEventListener('click', deleteProduct);
putButton.addEventListener('click',putProduct);
newProduct.addEventListener('click',postProduct);

// evento para todos los botones de cerrado
cerrarBotones.forEach(boton =>{
  boton.addEventListener('click',menuCerrado);
});


//------------------------------- Metodos --------------------------------------------------
// Tarjeta de informacion
function mostrarInfo(event){
  const id = event.target.getAttribute("num");
  idSelection = id;

  productoInfo.innerHTML = productosActuales[idSelection].title;
  precioInfo.innerHTML = productosActuales[idSelection].price;
  descriptionInfo.innerHTML = productosActuales[idSelection].description;
  imgInfo.src = productosActuales[idSelection].images[0]; // toma el primer elemento por defecto

  const resultado = categoriasActuales.find(element => element.id === productosActuales[idSelection].category.id);
  categoriaInfo.innerHTML = "Categoria: " + resultado.name;

  menuCerrado();
  tarjetaInfo.classList.remove('oculto');
}


// Filtrar Por Categorias
async function filtrarCat(event){
  const id = event.target.getAttribute("num");
  try {
    const {data,status} = await axios.get("https://api.escuelajs.co/api/v1/products/?categoryId="+id);
    if(status === 200){
      idCategory = id;
      renderElements(data);
    }
    if(data.length === 0){
      alert("Sin productos");
    }
  } catch (error) {
    idCategory = undefined;
    console.log(error);
  }
}
// Renderiza los botones con las categorias asignadas
async function categorias(){ 
  try {
    const {data,status} = await axios.get("https://api.escuelajs.co/api/v1/categories?limit=7");
    if(status === 200){
      categoriasActuales = data;
      selectElemento.innerHTML = "";
      for (element of data) {
        const botonCat = document.createElement("button");
        const optionCat = document.createElement("option");

        
        botonCat.innerText = element.name;
        botonCat.setAttribute('num',element.id);

        optionCat.setAttribute('value',element.id);
        optionCat.innerHTML = element.name;

        botonCat.addEventListener('click',filtrarCat);
        category.appendChild(botonCat);
        selectElemento.appendChild(optionCat);
      }
    }
  } catch (error) {
      console.log(error);
  }
}

// Funciones GET
async function cargar(){ // Peticion
  try {
      const {data,status} = await axios.get("https://api.escuelajs.co/api/v1/products?offset=0&limit=12");
      if(status === 200){
        renderElements(data);
      }
  } catch (error) {
      console.log(error);
  }
}

function renderElements(array){ // Renderiza los productos al inicio de la pagina
  productosActuales = array;
  products.innerHTML = "";
  var fila = document.createElement("div");
  fila.classList.add('fila');  
  let cont = 0;

  for (element of array) {
    if((cont%4) == 0){ // Divide en filas
      products.appendChild(fila);
      fila = document.createElement("div");
      fila.classList.add('fila'); 
    }

    const targeta = document.createElement("div");
    const img = document.createElement("img");
    const divisor = document.createElement("div");
    const producto = document.createElement("span");
    const costo = document.createElement("span");

    img.setAttribute('src',element.images[0]);
    img.setAttribute('num',cont);
    producto.innerText = element.title;
    costo.innerText = element.price;

    targeta.classList.add('targeta');
    img.classList.add('productImg');
    fila.appendChild(targeta);

    img.addEventListener('click',mostrarInfo); // Evento para información especifica

    divisor.append(producto,costo);
    targeta.append(img,divisor);

    cont++;
  }
  products.appendChild(fila); // Agrega todos al elemento

}

// Mandar informacion de peticion
function enviarFormulario(){
  if(operacion === "post"){
    postApi();
  } else if(operacion === "put"){
    putApi();
  }

}

// Funcion POST
async function postProduct(){ // Limpia los campos
  menuCerrado();
  titleCrud.innerHTML = "Nuevo Producto";
  title.value = "";
  price.value = "";
  description.value = "";
  image.value = "";
  optionSection.classList.remove('oculto');
  operacion = "post";
}

async function postApi(){ // Manda la peticion
  var opcionSeleccionada = selectElemento.options[selectElemento.selectedIndex].value;
  const obj = {
    "title": title.value.trim(),
    "price": Number(price.value.trim()),
    "description": description.value.trim(),
    "categoryId": opcionSeleccionada,
    "images": [image.value.trim()]
  }

  try {
    if(obj.title && obj.price && obj.description && obj.categoryId){
      const {data,status} = await axios.post("https://api.escuelajs.co/api/v1/products/", obj);
      console.log(status);
      optionSection.classList.add('oculto');
      alert("Se ha agregado un nuevo producto");
    } else{
      alert("Llene todos los campos");
    }

  } catch (error) {
    console.error(error); 
  }
}

// Funcion PUT
function putProduct(event){ // se agregan los datos a los campos pertenecientes al producto
  tarjetaInfo.classList.add('oculto');
  optionSection.classList.remove('oculto');
  
  titleCrud.innerHTML = "Modificar Producto " + productosActuales[idSelection].id;
  
  title.value = productosActuales[idSelection].title;
  price.value = productosActuales[idSelection].price;
  description.value = productosActuales[idSelection].description;
  image.value = productosActuales[idSelection].images[0];
  const resultado = categoriasActuales.findIndex(element => element.id === productosActuales[idSelection].category.id);
  selectElemento.selectedIndex = resultado;


  operacion = "put";
}

async function putApi(){
  var opcionSeleccionada = selectElemento.options[selectElemento.selectedIndex].value;
  const obj = {
    "title": title.value.trim(),
    "price": Number(price.value.trim()),
    "description": description.value.trim(),
    "categoryId": opcionSeleccionada,
    "images": [image.value.trim()]
  }

  try {
    const {data,status} = await axios.put("https://api.escuelajs.co/api/v1/products/"+ productosActuales[idSelection].id, obj);

    alert("Se ha actualizado el producto " + productosActuales[idSelection].id);
  } catch (error) {
    console.error(error);
  }
  
} 

// Funcion DELETE
async function deleteProduct(event){
  tarjetaInfo.classList.add('oculto');
  try {
    const {status} = await axios.delete("https://api.escuelajs.co/api/v1/products/"+ 
    productosActuales[idSelection].id);
    alert("Se ha eliminado el Producto: " + productosActuales[idSelection].id);
  } catch (error) {
    console.error(error);
  }
  operacion = "delete";
}

function menuCerrado(){
  if(!optionSection.classList.value){
    optionSection.classList.add('oculto');
  } 
  if(!tarjetaInfo.classList.value){
    tarjetaInfo.classList.add('oculto');
  }
}

function start(){ // Carga inicial de datos y categorias
  cargar();
  categorias();
}
