/** Error message */
function showError(errorText){
    const errorBoxdiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorText;
    errorBoxdiv.appendChild(errorTextElement);
    console.log(errorText);
}
showError('Error message');

function helloTriangle(){

}

try{ helloTriangle();
}
catch(e){
    showError(`Uncaught Js exception: ${e}`)
}