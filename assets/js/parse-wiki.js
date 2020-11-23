var getTop10Movies = function(year) {
    var sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + year + "_in_film&prop=sections&origin=*&formatversion=2"

    fetch(sectionsUrl).then(function(response){
        if(response.ok) {
            response.json().then(function(sections){
                sections = sections.parse.sections
                var secNum = null
                for(var i = 0; i < sections.length; i++) {
                    if(sections[i].line === "Highest-grossing films"){
                        secNum = sections[i].index
                        break;
                    }
                }
                fetch("https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + year + "_in_film&prop=text&section=" + secNum + "&origin=*&formatversion=2").then(function(response){
                    if(response.ok){
                        response.json().then(function(data){
                            data = jQuery.parseHTML(data.parse.text)
                            data = data[0].children[3].children[1].children
                            for(var i=1; i<data.length; i++) {
                                console.log(data[i].children[1].innerText.trim())
                            }
                        })
                    }
                })
            })
        }
    })
}