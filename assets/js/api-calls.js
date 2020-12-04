var getYearTopMovies = function(year) {
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
                                var movieHtml = $(data[i]).children()
                                var movieTitle = $(movieHtml[1]).text().trim()
                                movies.push({
                                    movieTitle: movieTitle,
                                    movieYear: year
                                })
                            }
                            omdbApiCalls(movies)
                        })
                    }
                })
            })
        }
    })
}

var getDecadeTopMovies = function(decade) {
    var sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + decade + "s_in_film&prop=sections&origin=*&formatversion=2"
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
                fetch("https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + decade + "s_in_film&prop=text&section=" + secNum + "&origin=*&formatversion=2").then(function(response){
                    if(response.ok){
                        response.json().then(function(data){
                            data = jQuery.parseHTML(data.parse.text)
                            data = $(data[0]).find("table")[0]
                            data = $(data).children()[1]
                            data = $(data).children()
                            var movies = []
                            for (var i = 1; i < data.length; i++) {
                                var movieHtml = $(data[i]).children()
                                var movieTitle = $(movieHtml[1]).text().trim()
                                var movieYear = $(movieHtml[movieHtml.length - 2]).text().trim()
                                movies.push({
                                    movieTitle: movieTitle,
                                    movieYear: movieYear
                                })
                            }
                            omdbApiCalls(movies)
                        })
                    }
                })
            })
        }
    })
}

var singleOmdbApiCall = function(title) {
    fetch("http://www.omdbapi.com/?t=" + title.trim().split(' ').join('+') + "&apikey=f92c60e5").then(function(response){
        if(response.ok){
            response.json().then(function(data){
                console.log(data)
                $("#movie-poster").attr("src", data.Poster)
            })
        }
    }) 
}

var omdbApiCalls = function(movies) {
    var movieFetches = movies.map((movie) => {
        return fetch("http://www.omdbapi.com/?t=" + movie.movieTitle.split(' ').join('+') + "&y=" + movie.movieYear + "&apikey=f92c60e5")
    })
    Promise.all(movieFetches).then((movies) => {
        var moviesArray = movies.map((movie) => {
            return movie.json()
        })
        Promise.all(moviesArray).then((movies) => {
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
}

var sortByDate = function(movies) {
    return movies.sort((a, b) => a.releasedDate - b.releasedDate)
}