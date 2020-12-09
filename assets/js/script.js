var currentYear = parseInt(moment().format("YYYY"))
if(currentYear>=2020) {
    $("#year-search").find("input").attr("max", currentYear)
}

$("#decade-btns").on("click", ".decade", function(){
    var decade = $(this).attr("id")
    async function asyncCallforDecades() {
        var results = await getDecadeTopMovies(decade)
        populateMovies(results, true, decade)
    }
    asyncCallforDecades()
})

$( "#year-search" ).submit(function( event ) {
    event.preventDefault();
    var searchTerm = $(this).find("input").val()
    var resultArr = checkIfYear(searchTerm)
    if (resultArr[0]) {
        async function asyncCallforYear() {
            var results = await getYearTopMovies(searchTerm)
            populateMovies(results, false, searchTerm)    
        }
        asyncCallforYear()
        $(this).find("input").val("")        
    } else {
        console.log(resultArr[1])
    }
});

$("#movies-display").on("click", ".exit-btn", function(){
    $("#decade-btns").removeClass("d-none")
    $("#movies-display").addClass("d-none")
})

var populateMovies = function(movies, decade, year) {
    var moviesDisplay = $("#movies-display")
    moviesDisplay.removeClass("d-none")
    moviesDisplay.empty()
    if(decade) {
        var title = "Most Popular Movies from the " + year + "'s"
    } else {
        var title = "Most Popular Movies from " + year
    }
    moviesDisplay.append(
        $("<div>").addClass("display-header").html(
            `<h2>` + title + `</h2>
            <span class="material-icons exit-btn">
                close
            </span>`
        )
    )
    var currentMonth = ""
    movies.forEach(movie => {
        var movieMonth = movie.releasedDate.format("MMMM, YYYY")
        if (currentMonth != movieMonth) {
            currentMonth = movieMonth
            moviesDisplay.append(
                $("<div>").addClass("display-date").html(
                    `<h4>` + currentMonth + `</h4>`
                )
            )
        }
        var movieContainer = $("<div>").addClass("movie-list-item").attr("id", movie.imdbID).html(
            `<img src="` + ((movie.Poster ==="N/A") ? "./assets/images/default.png" : movie.Poster) + `" alt="` + movie.Title + ` Movie Poster" class="list-movie-poster">`)
        var movieInformation = $("<div>").addClass("movie-list-item-info")
        movieInformation.append($("<h3>").text(movie.Title))
        if(movie.Genre != "N/A") {
            movieInformation.append($("<p>").text(movie.Genre))
        }
        if(movie.Rated != "N/A") {
            movieInformation.append($("<p>").text(movie.Rated))
        }
        if(movie.Ratings.length >=0) {
            movie.Ratings.forEach(rating => {
                if (rating.Source === "Internet Movie Database") {
                    movieInformation.append(
                        $("<div>").addClass("rating-div").html(
                            `<img src="./assets/images/imdb.png" alt="imdb logo"/>
                            <p>` + rating.Value + `</p>`
                        )
                    )
                } else if (rating.Source === "Rotten Tomatoes") {
                    movieInformation.append(
                        $("<div>").addClass("rating-div").html(
                            `<img src="./assets/images/rotten-tom.png" alt="rottten tomatoes logo"/>
                            <p>` + rating.Value + `</p>`
                        )
                    )
                }
            })
        }
        var iconSpan = $("<span>").addClass("material-icons").text("arrow_forward_ios")
        movieContainer.append(movieInformation, iconSpan)
        moviesDisplay.append(movieContainer)
    })
    $("#decade-btns").addClass("d-none")
}

$("#movies-display").on("click", ".movie-list-item", function(){
    window.location = "./movie.html?i=" + $(this).attr("id")
})

// function for checking if the input was a valid year
var checkIfYear = function(year) {
    if(typeof year === "string" & year.length === 4) {
        var yearNum = parseInt(year)
        if (yearNum >= 1914 & yearNum <= currentYear) {
            return [true, "Success"]
        } else {
            return [false, "Please enter a valid year between 1914 and " + currentYear]
        }
    } else {
        return [false, "Please enter a valid year like 2016"]
    }
}

// Search function for movie.html (single movie search feature)
var populateMovieInfo = function(movieInfo) {
    console.log(movieInfo)
    var releasedDate = moment(movieInfo.Released, "DD MMM YYYY")
    $("#movie-poster").attr("src", movieInfo.Poster)
    $("#movie-title").text(movieInfo.Title)
    $("#movie-genre").text(movieInfo.Genre)
    $("#movie-rated").text(movieInfo.Rated)
    $("#movie-release").text(releasedDate.format("MMMM DD, YYYY"))
    $("#movie-director").text(movieInfo.Director)
    $("#movie-actors").text(movieInfo.Actors)
    $("#movie-plot").text(movieInfo.Plot)
    $("#movie-awards").text(movieInfo.Awards)
    $("#movie-time").text(movieInfo.Runtime)
    
    $("#default-img").addClass("d-none")
    $("#error-img").addClass("d-none")
    $("#movie-display").removeClass("d-none")
}
var populateError = function(errorInfo) {
    console.log(errorInfo)    
    $("#default-img").removeClass("d-none")
    $("#error-img").removeClass("d-none")
    $("#movie-display").addClass("d-none")
}

$( "#movie-search" ).submit(function( event ) {
    event.preventDefault();
    
    $("#movie-display").addClass("d-none")
    $("#default-img").removeClass("d-none")
    $("#error-img").addClass("d-none")

    var searchTerm = $(this).find("input").val()
    window.location = "./movie.html?t=" + searchTerm.trim().split(" ").join("+")     
});

if(document.URL.indexOf("movie.html") >= 0){ 
    $("#movie-display").addClass("d-none")
    $("#default-img").removeClass("d-none")
    $("#error-img").addClass("d-none")
    var searchTerm = window.location.search.substring(1)
    if(searchTerm) {
        async function asyncCallforMovie() {
            var results = await singleOmdbApiCall(searchTerm)
            if (results.Response === "True") {
                populateMovieInfo(results) 
            } else {
                populateError(results)
            }
        }
        asyncCallforMovie()
    }
}