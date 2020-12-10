// this function calls the wiki api and returns an array of movies that were found in the highest grossing films page
var getYearTopMovies = function(year) {
    // create new promise that will only resolve when the results are received
    return new Promise(resolve => {
        // the link we are calling from the api to see what section number we need to look at
        var sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + year + "_in_film&prop=sections&origin=*&formatversion=2"
        fetch(sectionsUrl).then(function(response){
            if(response.ok) {
                response.json().then(function(sections){
                    if("error" in sections) {
                        resolve({
                            Response: "False",
                            Error: "Incorrect year input!"
                        })
                    } else {
                        sections = sections.parse.sections
                        var secNum = null
                        // loop all the sections for that given page
                        for(var i = 0; i < sections.length; i++) {
                            // check the names of the sections; if they equal any of the ones below, then thats the section number we want
                            if(
                                sections[i].line === "Highest-grossing films" || 
                                sections[i].line === "Highest-grossing films (U.S.)" ||
                                sections[i].line === "Top-grossing films (U.S.)" ||
                                sections[i].line === "Top-grossing films"){
                                secNum = sections[i].index
                                break;
                            }
                        }
                        // now make the same call again except now with the specific section number so we can narrow our search
                        fetch("https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + year + "_in_film&prop=text&section=" + secNum + "&origin=*&formatversion=2").then(function(response){
                            if(response.ok){
                                response.json().then(function(data){
                                    // parse through the html received from the api
                                    data = jQuery.parseHTML(data.parse.text)
                                    // look for the table
                                    data = $(data[0]).find("table")[0]
                                    data = $(data).children()[1]
                                    data = $(data).children()
                                    // start an empty array that will hold the movies
                                    var movies = []
                                    for (var i = 1; i < data.length; i++) {
                                        // loop through every row of the table
                                        var movieHtml = $(data[i]).children()
                                        var movieTitle = $(movieHtml[1]).text().trim()
                                        // save the movie name and the year of the film
                                        movies.push({
                                            movieTitle: movieTitle,
                                            movieYear: year
                                        })
                                    }
                                    // now that you have the array of movies, call the omdb api for each movie to receive more details
                                    async function asyncCalltoOMDB() {
                                        var res = await omdbApiCalls(movies)
                                        resolve(res)
                                    }
                                    asyncCalltoOMDB()
                                })
                            }
                        })                    
                    }
                })
            }
        })
    })
}

// this function calls the wiki api and returns an array of movies that were found in the highest grossing films page
var getDecadeTopMovies = function(decade) {
    // create new promise that will only resolve when the results are received
    return new Promise(resolve => {
        // the link we are calling from the api to see what section number we need to look at
        var sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + decade + "s_in_film&prop=sections&origin=*&formatversion=2"
        fetch(sectionsUrl).then(function(response){
            if(response.ok) {
                response.json().then(function(sections){
                    if("error" in sections) {
                        console.log({
                            Response: "False",
                            Error: "Incorrect decade input!"
                        })
                    } else {
                        sections = sections.parse.sections
                        var secNum = null
                        // loop through all the available sections of the page
                        for(var i = 0; i < sections.length; i++) {
                            // now we are only looking for one possible section, if it is there, return the section number
                            if(sections[i].line === "Highest-grossing films"){
                                secNum = sections[i].index
                                break;
                            }
                        }
                        // now that we have the section, repeat the call except now with the section number to narrow the search
                        fetch("https://en.wikipedia.org/w/api.php?action=parse&format=json&page=" + decade + "s_in_film&prop=text&section=" + secNum + "&origin=*&formatversion=2").then(function(response){
                            if(response.ok){
                                response.json().then(function(data) {
                                    // parse through the returned html text from the api
                                    data = jQuery.parseHTML(data.parse.text)
                                    // find the table of all the movies... should be the first or only table of the section
                                    data = $(data[0]).find("table")[0]
                                    data = $(data).children()[1]
                                    data = $(data).children()
                                    // creat ean empty array that will hold all the movies
                                    var movies = []
                                    for (var i = 1; i < data.length; i++) {
                                        var movieHtml = $(data[i]).children()
                                        // get the movie title from that row
                                        var movieTitle = $(movieHtml[1]).text().trim()
                                        // get the movie year from that row
                                        var movieYear = $(movieHtml[movieHtml.length - 2]).text().trim()
                                        // add it to the array
                                        movies.push({
                                            movieTitle: movieTitle,
                                            movieYear: movieYear
                                        })
                                    }
                                    // now make an omdb api call for all the movies in the array
                                    async function asyncCalltoOMDB() {
                                        var res = await omdbApiCalls(movies)
                                        resolve(res)
                                    }
                                    asyncCalltoOMDB()
                                })
                            }
                        })
                    }
                })
            }
        })
    })
}

// this function is only used for single api calls for individual movies i.e. the movie.html page
var singleOmdbApiCall = function (title) {
    // create a new promise to make sure to wait for all the reuslts before returning the value
    return new Promise(resolve => {
        if (typeof title === "string") {
            // the title variable will either start with i= for imdb number or t= for title string
            fetch("https://www.omdbapi.com/?" + title.trim() + "&apikey=f92c60e5").then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {
                        // return data received from the api
                        resolve(data)
                    })
                }
            })  
        } else {
            resolve({
                Response: "False",
                Error: "Search term was not a string!"
            })
        }
    })
}

// this function makes omdb api calls several times for the array 
var omdbApiCalls = function (movies) {
    return new Promise(resolve => {
        // this map() function will create a pending fetch request for every single element of the array
        var movieFetches = movies.map((movie) => {
            // this section of code helps handle little bugs we found with the search function of the api
            movie.movieTitle = movie.movieTitle.replace("Star Wars: ", "")
            movie.movieTitle = ((movie.movieTitle === "Seven") ? "Se7en" : movie.movieTitle)
            // return the fetch for the given movie title and year the film came out
            return fetch("https://www.omdbapi.com/?t=" + movie.movieTitle.split(' ').join('+') + "&y=" + movie.movieYear + "&apikey=f92c60e5")
        })
        // make a promise for when all the fetches from above are done
        Promise.all(movieFetches).then((movies) => {
            // now make another map for the .json request
            var moviesArray = movies.map((movie) => {
                return movie.json()
            })
            // make yet another promise for when all the .json() requests are done
            Promise.all(moviesArray).then((movies) => {
                var movieArr = []
                // loop through every movie
                movies.forEach(movie => {
                    if(movie.Response === "True") {
                        // add a moment key value pair that will save the date of the film, so we can sort them
                        movie.releasedDate = moment(movie.Released, "DD MMM YYYY")
                        movieArr.push(movie)
                    }
                })
                // sort all the movies from oldest first to newest last (january to decemeber.... 2000 to 2009)
                sortedMovies = sortByDate(movieArr)
                // return the objects of all the movies that are now sorted
                resolve(sortedMovies)
            })
        })        
    })
}

// This function will sort the movies by release date
var sortByDate = function(movies) {
    return movies.sort((a, b) => a.releasedDate - b.releasedDate)
}