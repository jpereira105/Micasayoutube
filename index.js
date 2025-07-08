// guarda lo que exporta el modulo require lo  trae 
const puppeteer = require("puppeteer");

async function getApartamentLink(urlToParse) {
// Configuracion inicial del navegador
const options = {headless: false};

// Crea un navegador y te devuelve referencia al navegador creado
const browser = await puppeteer.launch(options);

// aca esta funcion puedo usar browser
const page = await browser.newPage();
// setea el viewport a la pagina
await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
  });

  await page.goto(urlToParse); 
  
  const obtenerLinks = () => {
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
  };
        
  const ObtenerLinkPromise = page.evaluate(obtenerLinks);
  
  const apartamentsLink = await ObtenerLinkPromise;

  // array de link
  console.log(apartamentsLink);
  guardarLinksEnBaseDeDatos(apartamentsLink);
}

async function getApartamentData(apartamentsLink) {
  // Configuracion inicial del navegador
  const options = {headless: false};
  
  // Crea un navegador y te devuelve referencia al navegador creado
  const browser = await puppeteer.launch(options);
  
  // aca esta funcion puedo usar browser
  const page = await browser.newPage();
  // setea el viewport a la pagina
  await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
  
    
    await page.goto(apartamentsLink); 
    
    const ObtenerInitialState = page.evaluate(() => {
      return window.__PRELOADED_STATE__.initialState;    
    });
    
    const initialState = await ObtenerInitialState;
    const apartamentData = {
      "gastos" : { 
        "Precio" : initialState.components.price.price.value,
        "moneda" :  initialState.components.price.price.currency_symbol,
        },
      };  
    
    console.log(apartamentData);
    
    return apartamentData;
  }
  
// aca ya no puedo

function getPageNumberUrl(numeroDePagina){
  const desdeParameter = `_Desde_${48 * (numeroDePagina -1) +1}`;
  return `https://inmuebles.mercadolibre.com.ar/departamentos/
  alquiler${desdeParameter}_Noindex_True`;  
}

/*
const urlToParse = 
"https://inmuebles.mercadolibre.com.ar/departamentos/alquiler/";

getApartamentLink(urlToParse);
*/

const apartamentToParsed =
"https://departamento.mercadolibre.com.ar/MLA-2039897396-departamento-alquiler-1-ambiente-villa-crespo-_JM#polycard_client=search-nordic&position=3&search_layout=grid&type=item&tracking_id=f41b9958-0111-4880-87d4-738c0b37c8e2";

getApartamentData(apartamentToParsed);