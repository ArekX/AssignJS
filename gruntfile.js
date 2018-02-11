module.exports = function(grunt) {

  const sourceList = [
    'src/core/index.js',
    'src/core/vars.js',
    'src/core/assert.js',
    'src/core/modules.js',
    'src/core/html.js',
    'src/*.js',
    'src/container/*.js',
    'src/component/*.js'
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: `/*! <%= pkg.name %> <%= pkg.version %> by <%= pkg.author %>. License: <%= pkg.license %> */`
      },
      build: {
        src: sourceList,
        dest: 'build/<%= pkg.name %>.min.js'
      },
      buildDev: {
        options: {mangle: false, sourceMap: true},
        src: sourceList,
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    watch: {
      options: {
        atBegin: true
      },
      files: ['src/**/*.js'],
      
      tasks: ['build']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['uglify']);
};