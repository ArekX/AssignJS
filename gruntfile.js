const compileList = require('./compile');
const fs = require('fs');
const path = require('path');

const SRC_FOLDER = 'src';

const compiledSourceList = compileList('index.js', SRC_FOLDER);

module.exports = function(grunt) {

  console.log('Compiling List of Files:\n', compiledSourceList, '\n');
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: fs.readFileSync(path.join(__dirname, SRC_FOLDER, 'header.template'), 'utf8'),
        footer: fs.readFileSync(path.join(__dirname, SRC_FOLDER, 'footer.template'), 'utf8')
      },
      build: {
        src: compiledSourceList,
        dest: 'build/<%= pkg.name %>.min.js'
      },
      buildDev: {
        options: {mangle: false, sourceMap: true},
        src: compiledSourceList,
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