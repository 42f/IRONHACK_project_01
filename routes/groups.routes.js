const isLoggedIn = require('../middleware/isLoggedIn');

const router = require("express").Router();



// const listMoviesRoute = (req) => `${req.baseUrl}`;
// const newMovieRoute = (req) => `${req.baseUrl}/create`;

// const listMovieView = `movies/movies`;
// const detailsMovieView = `movies/movie-details`;
// const newMovieView = `movies/new-movie`;
// const editMovieView = `movies/edit-movie`;


router.get('/', (req, res, next)=>{

    res.render('groups/allGroups')
})

router.get('/create', (req, res, next)=>{

    res.render('groups/createGroup')

})
router.post('/create', (req, res, next)=>{

    res.render('groups/createGroup')

})

router.get('/:id', (req, res, next)=>{

    res.render('groups/showOneGroup')
})

router.get('/:id/edit', (req, res, next)=>{

    res.render('groups/editOneGroup')

})

router.post('/:id/edit', (req, res, next)=>{

    res.redirect('/:id')
    
})

router.post('/:id/delete', (req, res, next)=>{
    res.redirect('/groups')

})

module.exports = router;

