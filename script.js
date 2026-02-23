function mostrarResultado(resultado, formula){
    document.getElementById("resultado").value = resultado + " " + formula;
}

function unidadVelocidad(){
    let velocidad = +document.getElementById("vSelector").value;
    switch(velocidad){
        case 1:
            var unidad1 = "m/s";
            break;
        case 2:
            var unidad1 = "km/h";
            break;
        case 3:
            var unidad1 = "mi/h";
    }
    return unidad1;
}

function unidadTiempo(){
    let tiempo = +document.getElementById("tSelector").value;
    switch(tiempo){
        case 1:
            var unidad2 = "seg";
            break;
        case 2:
            var unidad2 = "min";
            break;
        case 3:
            var unidad2 = "hr";
            break;
    }
    return unidad2;
}

function unidadDistancia(){
    let distancia = +document.getElementById("tSelector").value;
    switch(distancia){
        case 1:
            var unidad3 = "mm";
            break;
        case 2:
            var unidad3 = "cm";
            break;
        case 3:
            var unidad3 = "mtr";
            break;
        case 4:
            var unidad3 = "km";
            break;
        case 5:
            var unidad3 = "mi";
            break;
    }
    return unidad3;
}

function unidadAceleracion(){
    let aceleracion = +document.getElementById("tSelector").value;
    switch(aceleracion){
        case 1:
            var unidad4 = "m/s²";
            break;
        case 2:
            var unidad4 = "km/h²";
            break;
        case 3:
            var unidad4 = "mi/h²";
            break;
    }
    return unidad4;
}

function formula1(){
    var vf = +document.getElementById("Vf").value;
    let vo = +document.getElementById("Vo").value;
    let t = +document.getElementById("t").value;
    let result = (vf-vo)/t;
    mostrarResultado(Math.round(result*100)/100, unidadAceleracion());
}

function formula2(){
    let vo = +document.getElementById("Vo").value;
    let a = +document.getElementById("a").value;
    let t = +document.getElementById("t").value;
    let result = vo + (a*t);
    mostrarResultado(Math.round(result*100)/100,unidadVelocidad());
}

function formula3(){
    let vo = +document.getElementById("Vo").value;
    let vf = +document.getElementById("Vf").value;
    let t = +document.getElementById("t").value;
    let result = ((vo+vf)/2)*t;
    mostrarResultado(Math.round(result*100)/100,unidadDistancia());
}

function formula4(){
    let vo = +document.getElementById("Vo").value;
    let t = +document.getElementById("t").value;
    let a = +document.getElementById("a").value;
    let result = (vo*t)+((1/2)*a*(t*t));    
    mostrarResultado(Math.round(result*100)/100,unidadDistancia());
}

function formula5(){
    let vo = +document.getElementById("Vo").value;
    let a = +document.getElementById("a").value;
    let d = +document.getElementById("d").value;
    result = (vo*vo)+(2*a*d);
    mostrarResultado(Math.round(result*100)/100,unidadVelocidad());
}

function conversionUnidades(resultado){

    console.log(resultado);

    document.getElementById("resultado").value = resultado + " " ;
}


function limpiar(){
    document.getElementById("Vo").value = "";
    document.getElementById("Vf").value = "";
    document.getElementById("t").value = "";
    document.getElementById("d").value = "";
    document.getElementById("a").value = "";
    document.getElementById("resultado").value = "";
}