// Gets current year we are in and sets to input max attribute
var currentYear = parseInt(moment().format("YYYY"))
if(currentYear>=2020) {
    $("#year-search").find("input").attr("max", currentYear)
}

// When you click a decade button an api call is made
$("#decade-btns").on("click", ".decade", function(){
    // Returns id of decade button pressed
    var decade = $(this).attr("id")
    async function asyncCallforDecades() {
        var results = await getDecadeTopMovies(decade)
        populateMovies(results, true, decade)
    }
    asyncCallforDecades()
})

// When the year search form is submitted, call this function
$( "#year-search" ).submit(function( event ) {
    event.preventDefault();

    // Get year that was typed into input 
    var searchTerm = $(this).find("input").val()
    // Check if year function ensures that the input is valid
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

// When the exit button is clicked, display decade buttons
$("#movies-display").on("click", ".exit-btn", function(){
    $("#decade-btns").removeClass("d-none")
    $("#movies-display").addClass("d-none")
})

// Populating list of movies onto the html
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

// When you click on individual movie from the list...
$("#movies-display").on("click", ".movie-list-item", function(){
// Navigates to movie.html page for specific movie
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
    $("#movie-poster").attr("src", ((movieInfo.Poster != "N/A") ? movieInfo.Poster : "./assets/images/default.png" ))
    $("#movie-title").text(movieInfo.Title)
    $("#movie-genre").text(((movieInfo.Genre != "N/A") ? movieInfo.Genre : ""))
    $("#movie-rated").text(((movieInfo.Rated != "N/A") ? movieInfo.Rated : ""))
    $("#movie-release").text(releasedDate.format("MMMM DD, YYYY"))
    $("#movie-time").text(((movieInfo.Runtime != "N/A") ? ("Length: " + movieInfo.Runtime) : ""))

    if(movieInfo.Ratings.length >= 0) {
        movieInfo.Ratings.forEach(rating => {
            if (rating.Source === "Internet Movie Database") {
                $(".top-movie-info").append(
                    $("<div>").addClass("rating-div").html(
                        `<img src="./assets/images/imdb.png" alt="imdb logo"/>
                        <p>` + rating.Value + `</p>`
                    )
                )
            } else if (rating.Source === "Rotten Tomatoes") {
                $(".top-movie-info").append(
                    $("<div>").addClass("rating-div").html(
                        `<img src="./assets/images/rotten-tom.png" alt="rotten tomatoes logo"/>
                        <p>` + rating.Value + `</p>`
                    )
                )
            }
        })
    }
    

    $("#movie-director").text(((movieInfo.Director != "N/A") ? movieInfo.Director : ""))
    $("#movie-actors").text(((movieInfo.Actors != "N/A") ? movieInfo.Actors : ""))
    $("#movie-plot").text(((movieInfo.Plot != "N/A") ? movieInfo.Plot : ""))
    $("#movie-awards").text(((movieInfo.Awards != "N/A") ? movieInfo.Awards : ""))
    
    
    $("#default-img").addClass("d-none")
    $("#error-img").addClass("d-none")
    $("#movie-display").removeClass("d-none")
}

// This function shows the error message when a user searches for a non existant film
var populateError = function() {
       
    $("#default-img").addClass("d-none")
    $("#error-img").removeClass("d-none")
    $("#movie-display").addClass("d-none")
}

// This function is called when you submit movie search form
$( "#movie-search" ).submit(function( event ) {
    event.preventDefault();
    
    $("#movie-display").addClass("d-none")
    $("#default-img").removeClass("d-none")
    $("#error-img").addClass("d-none")

    var searchTerm = $(this).find("input").val()
    window.location = "./movie.html?t=" + searchTerm.trim().split(" ").join("+")     
});

// This function uses url query params to figure out what movie to search for
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