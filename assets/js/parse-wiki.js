var getTop10Movies = function(year) {
    var moviesForTheYear = []
    var sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + year + "_in_film&prop=sections&origin=*&formatversion=2"
    fetch(sectionsUrl).then(function(response){
        if(response.ok) {
            response.json().then(function(sections){
                sections = sections.parse.sections
                var secNum = null
                for(var i = 0; i < sections.length; i++) {
                    if(
                        sections[i].line === "Highest-grossing films" || 
                        sections[i].line === "Highest-grossing films (U.S.)" ||
                        sections[i].line === "Top-grossing films (U.S.)" ||
                        sections[i].line === "Top-grossing films"){
                        secNum = sections[i].index
                        break;
                    }
                }
                fetch("https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + year + "_in_film&prop=text&section=" + secNum + "&origin=*&formatversion=2").then(function(response){
                    if(response.ok){
                        response.json().then(function(data){
                            data = jQuery.parseHTML(data.parse.text)
                            data = $(data[0]).find("table")[0]
                            data = $(data).children()[1]
                            data = $(data).children()
                            var movies = []
                            for (var i = 1; i < data.length; i++) {
                                movies.push(data[i].children[1].innerText.trim())
                            }
                            var movieFetches = movies.map((movie) => {
                                return fetch("http://www.omdbapi.com/?t=" + movie.split(' ').join('+') + "&y=" + year + "&apikey=f92c60e5")
                            })
                            Promise.all(movieFetches).then((movies) => {
                                moviesForTheYear = movies.map((movie) => {
                                    return movie.json()
                                })
                                Promise.all(moviesForTheYear).then((movies) => {
                                    var movieArr = []
                                    movies.forEach(movie => {
                                        if(movie.Response === "True") {
                                            movie.releasedDate = moment(movie.Released, "DD MMM YYYY")
                                            movieArr.push(movie)
                                        }
                                    })
                                    var sortedMovies = sortByDate(movieArr)
                                    console.log(sortedMovies)
                                })
                            })
                        })
                    }
                })
            })
        }
    })
}

var sortByDate = function(movies) {
    return movies.sort((a, b) => a.releasedDate - b.releasedDate)
}