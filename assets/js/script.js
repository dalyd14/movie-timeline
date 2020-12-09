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
        var title = "Movies from the " + year + "'s"
    } else {
        var title = "Movies from " + year
    }
    moviesDisplay.append(
        $("<div>").addClass("display-header pure-g").html(
            `<div class="pure-u-11-12">
                <h2>` + title + `</h2>
            </div>
            <div class="exit-btn pure-u-1-12">
                <span class="material-icons">
                    close
                </span>
            </div>`
        )
    )
    var currentMonth = ""
    movies.forEach(movie => {
        var movieMonth = movie.releasedDate.format("MMMM, YYYY")
        if (currentMonth != movieMonth) {
            currentMonth = movieMonth
            moviesDisplay.append(
                $("<div>").addClass("display-header pure-g").html(
                    `<div class="pure-u-11-12">
                        <h4>` + currentMonth + `</h4>
                    </div>`
                )
            )
        }
        var movieContainer = $("<div>").addClass("pure-g movie-list-item").attr("id", movie.imdbID).html(
            `<div class="pure-u-10-24">
                <img src="` + movie.Poster + `" alt="` + movie.Title + ` Movie Poster" class="list-movie-poster">
            </div>
            <div class="pure-u-12-24">
                <h3>` + movie.Title + `</h3>
            </div>
            <div class="pure-u-2-24">
                <span class="material-icons">
                    arrow_forward_ios
                </span>
            </div>`
        )
        moviesDisplay.append(movieContainer)
    })
    $("#decade-btns").addClass("d-none")
}

$("#movies-display").on("click", ".movie-list-item", function(){
    window.location = "./movie.html?" + $(this).attr("id")
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
    $("#movie-poster").attr("src", movieInfo.Poster)
    $("#movie-title").text(movieInfo.Title)
    $("#movie-genre").text(movieInfo.Genre)
    $("#movie-rated").text(movieInfo.Rated)
    $("#movie-release").text(movieInfo.Released)
    $("#movie-director").text(movieInfo.Director)
    $("#movie-actors").text(movieInfo.Actors)
    $("#movie-plot").text(movieInfo.Plot)
    $("#movie-awards").text(movieInfo.Awards)
    $("#movie-time").text(movieInfo.Runtime)
}
$( "#movie-search" ).submit(function( event ) {
    event.preventDefault();
    var searchTerm = $(this).find("input").val()
    
    async function asyncCallforMovie() {
        var results = await singleOmdbApiCall(searchTerm, false)
        populateMovieInfo(results) 
    }
    asyncCallforMovie()
    $(this).find("input").val("")         
});

if(document.URL.indexOf("movie.html") >= 0){ 
    var imdbID = window.location.search.substring(1)
    if(imdbID) {
        async function asyncCallforMovie() {
            var results = await singleOmdbApiCall(imdbID, true)
            populateMovieInfo(results) 
        }
        asyncCallforMovie()
    }
}