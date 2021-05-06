let mix = require("laravel-mix");

mix.react("resources/assets/js/app.jsx", "public/js")
    .sass("resources/assets/sass/app.scss", "public/css")
    .browserSync("https://gokada-delivery.z")
    .sourceMaps();
