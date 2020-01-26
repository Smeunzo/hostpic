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