const puppeteer = require("puppeteer");

const urlToParse = 
"https://inmuebles.mercadolibre.com.ar/departamentos/alquiler/";

// crear el navegador (pupperteer) se comunica con el navegadro atravez del protocolo devtools
const options = {headless: false};

// Crea un navegador y te devuelve referencia al navegador creado
puppeteer.launch(options).then((browser) => {
    // Aca puedo empezar a usar browser
    browser.newPage().then((page) => {
      page
        .setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    })
    .then(() => {
      page.goto(urlToParse).then(() => {
        page.evaluate(() => {
          /*const getlink = (publicacion) => {
            return publicacion.getElementsByClassName(
              "ui-search-layout__item"
            )[0].href;    
          };*/

          //const todasLasPublicaciones = document.getElementsByClassName(
          //  "poly-component__title"
          //);
          
          // console.log(todasLasPublicaciones);

          //return Array.from(todasLasPublicaciones).map((publicacion) => 
          //  getlink(publicacion)
          //);

        })
        //.then((resultadoDeEjecutarElScript) => {
        //    console.log(resultadoDeEjecutarElScript);
        //})
      });
    });
  });
  // Aca ya no voy a poder
});

     
        
       

    
 

    






