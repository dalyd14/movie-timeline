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
        // make API calls to return an array of the top movies of the decade
        var results = await getDecadeTopMovies(decade)
        // call the function that will display the movies in the HTML
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
            // make API calls to return an array of the top movies of the year
            var results = await getYearTopMovies(searchTerm)
            // call the function that will display the movies in the HTML
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
    // get the movie display section by id
    var moviesDisplay = $("#movies-display")
    moviesDisplay.removeClass("d-none")
    // empty all children
    moviesDisplay.empty()
    if(decade) {
        var title = "Most Popular Movies from the " + year + "'s"
    } else {
        var title = "Most Popular Movies from " + year
    }
    // Put the title of the section
    moviesDisplay.append(
        $("<div>").addClass("display-header").html(
            `<h2>` + title + `</h2>
            <span class="material-icons exit-btn">
                close
            </span>`
        )
    )
    // this variable will hold the current month and year of where we are in the array i.e. july 2005
    var currentMonth = ""
    // loop through all movies in the array
    movies.forEach(movie => {
        // get the release date of the movie
        var movieMonth = movie.releasedDate.format("MMMM, YYYY")
        // see if the release date is different than the current month above
        if (currentMonth != movieMonth) {
            currentMonth = movieMonth
            // if it is different, create a new header for the new month i.e. august 2005
            moviesDisplay.append(
                $("<div>").addClass("display-date").html(
                    `<h4>` + currentMonth + `</h4>`
                )
            )
        }
        // creat a movie div that will hold all the contents and information for that paticular movie
        // include the movie poster... if there isnt a poster url available, do the default TM logo
        var movieContainer = $("<div>").addClass("movie-list-item").attr("id", movie.imdbID).html(
            `<img src="` + ((movie.Poster ==="N/A") ? "./assets/images/default.png" : movie.Poster) + `" alt="` + movie.Title + ` Movie Poster" class="list-movie-poster">`)
        // create a div that will hold the individual movie information
        var movieInformation = $("<div>").addClass("movie-list-item-info")
        movieInformation.append($("<h3>").text(movie.Title))
        // if there is a genre display it etc. etc. etc.
        if(movie.Genre != "N/A") {
            movieInformation.append($("<p>").text(movie.Genre))
        }
        if(movie.Rated != "N/A") {
            movieInformation.append($("<p>").text(movie.Rated))
        }
        // if there are ratings, loop through them and only display imdb and rotten tomatoes
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
        // display the right arrow icon to indicate a button
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
    // get the release date so we can reformat how the date is displayed
    var releasedDate = moment(movieInfo.Released, "DD MMM YYYY")
    // diplay the movie poster, if there isnt a url available, display the default TM logo
    $("#movie-poster").attr("src", ((movieInfo.Poster != "N/A") ? movieInfo.Poster : "./assets/images/default.png" ))
    // the rest is similar to above populateMovies() function
    $("#movie-title").text(movieInfo.Title)
    $("#movie-genre").text(((movieInfo.Genre != "N/A") ? movieInfo.Genre : ""))
    $("#movie-rated").text(((movieInfo.Rated != "N/A") ? movieInfo.Rated : ""))
    $("#movie-release").text(releasedDate.format("MMMM DD, YYYY"))
    $("#movie-time").text(((movieInfo.Runtime != "N/A") ? ("Length: " + movieInfo.Runtime) : ""))
    // same as above for looping through and only grabbing IMDB and rotten tom rating
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
    // get the rest of the movie information
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
    $("#movie-display").addClass("d-none")   
    $("#default-img").addClass("d-none")
    $("#error-img").removeClass("d-none")
}

// This function is called when you submit movie search form
$( "#movie-search" ).submit(function( event ) {
    event.preventDefault();
    
    $("#movie-display").addClass("d-none")
    $("#error-img").addClass("d-none")
    $("#default-img").removeClass("d-none")
    
    var searchTerm = $(this).find("input").val()
    window.location = "./movie.html?t=" + searchTerm.trim().split(" ").join("+")     
});

// This function uses url query params to figure out what movie to search for
if(document.URL.indexOf("movie.html") >= 0){
    // when the page loads, if it is the movie.html page, do everything in this function
    $("#movie-display").addClass("d-none")
    $("#error-img").addClass("d-none")
    $("#default-img").removeClass("d-none")

    // get the search string i.e. t=shrek or i=tt01234
    var searchTerm = window.location.search.substring(1)
    if(searchTerm) {
        // call the api for the individual movie
        async function asyncCallforMovie() {
            var results = await singleOmdbApiCall(searchTerm)
            if (results.Response === "True") {
                // if a result was found populate the movie info
                populateMovieInfo(results) 
            } else {
                // if a result was not found, display the error img
                populateError(results)
            }
        }
        asyncCallforMovie()
    }
}