module.exports = {
    entry: './geshem.js',
    output: {
        path: __dirname,
        filename: 'static/js/bundle.js',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel?presets[]=react,presets[]=es2015' }
        ]
    }
}