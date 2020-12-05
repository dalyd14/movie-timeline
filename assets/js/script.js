$("#decade-btns").on("click", ".decade", function(){
    var decade = $(this).attr("id")
    async function asyncCallforDecades() {
        var results = await getDecadeTopMovies(decade)
        populateMovies(results)
    }
    asyncCallforDecades()
})

var populateMovies = function(movies) {
    var moviesDisplay = $("#movies-display")
    moviesDisplay.empty()
    movies.forEach(movie => {
        var movieContainer = $("<div>").addClass("pure-g").html(
            `<div class="pure-u-2-5">
                <img src="` + movie.Poster + `" alt="` + movie.Title + ` Movie Poster" class="list-movie-poster">
            </div>
            <div class="pure-u-2-5">
                <h3>` + movie.Title + `</h3>
            </div>
            <div class="pure-u-1-5">
                <h4>></h4>
            </div>`
        )
        moviesDisplay.append(movieContainer)
    })
}