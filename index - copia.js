// guarda lo que exporta el modulo require lo  trae 
const puppeteer = require("puppeteer");

async function parsearUrls() {
const urlToParse = 
"https://inmuebles.mercadolibre.com.ar/departamentos/alquiler/";

// crear el navegador (pupperteer)
// se comunica con el navegadro atravez del protocolo devtools

const options = {headless: false};

// Crea un navegador y te devuelve referencia al navegador creado
const browser = await puppeteer.launch(options);

// aca esta funcion puedo usar browser
const page = await browser.newPage();

await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
  });

  await page.goto(urlToParse); 
  
  const ObtenerLinkPromise = page.evaluate(() => {
        const getlink = (publicacion) => {
          return  publicacion.getElementsByClassName(
              "poly-component__title"
          )[0].href;
        };  
      
        const todasLasPublicaciones = document.getElementsByClassName(
          "ui-search-layout__item"              
        );
                       
        return Array.from(todasLasPublicaciones).map((publicacion) => 
          getlink(publicacion)                   
        );
  });
        
  const apartamentsLink = await ObtenerLinkPromise;

  // array de link
  console.log(apartamentsLink);
  guardarLinksEnBaseDeDatos(apartamentsLink);
}
// aca ya no puedo

function guardarLinksEnBaseDeDatos(apartamentos){
  console.log("Guardando apartamentos en la base de datos");
  console.log("Han sido guardados")
}

parsearUrls();




