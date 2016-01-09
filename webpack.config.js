module.exports = {
    entry: './geshem.js',
    output: {
        path: __dirname,
        filename: 'static/js/bundle.js',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0' },
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.scss$/, loader: 'style!css!sass' }
        ]
    }
}