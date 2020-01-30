function createXhrObject()
{
    if (window.XMLHttpRequest)
        return new XMLHttpRequest();
    if (window.ActiveXObject) {
        var names = [
            "Msxml2.XMLHTTP.6.0",
            "Msxml2.XMLHTTP.3.0",
            "Msxml2.XMLHTTP",
            "Microsoft.XMLHTTP"
        ];
        for(var i in names) {
            try{ return new ActiveXObject(names[i]); }
            catch(e){}
        }
    }
    window.alert("pas de XMLHTTPRequest.");
    return null;
}

function deleteNode(element ){
    while($(element).attr('class') !== 'deletable'){
        element = $(element).parent();
    }
    $(element).remove();
}

function processDeletion(xhr, element, token , id , cb) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let result = JSON.parse(xhr.responseText);
                if (result.success === true) {
                    cb(element);
                } else alert('impossible de supprimer une photo')
            }
        }
    };
    xhr.open("POST", "/album/delete/" + id, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader('X-CSRF-Token', token);

    xhr.send();

}

function displayError(result) {
    const errorMessage = document.querySelector("#formUpload");
    const error = document.createElement('div');
    error.setAttribute('class', 'alert alert-danger');
    error.textContent = "impossible d'uploader le fichier " + "\"" + result.errors + "\"";
    errorMessage.insertAdjacentElement('afterbegin', error);
}

function getLastPic() {
    const result = $.get({
        url: '/album/lastpic',
        dataType: 'json',
    });
    result.done(
        function () {
            const file = result.responseJSON;
            if (file.status === "bad") alert('impossible de récupérer la dernière photo');
            const cardElement = document.createElement('div');
            const imageElement = document.createElement('img');

            cardElement.setAttribute('class', 'card');
            imageElement.setAttribute('src', file.picture.picture.path);
            imageElement.setAttribute('class', 'card-img-top');

            const rowElement = document.querySelector('.row');
            rowElement.appendChild(cardElement);
            cardElement.appendChild(imageElement);
        }
    )
}