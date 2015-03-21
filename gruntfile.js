//
// http://24ways.org/2013/grunt-is-not-weird-and-hard/
//
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    connect: {
      test: {
        options: {
          port: 8012,
          hostname: 'localhost'
        }
      },
      dev: {
        options: {
          port: 8010,
          host: "localhost",
          keepalive: true,
          open: "http://localhost:8010/test/SpecRunner.html"
        }
      }
    },
    mocha: {
      test: {
        options: {
          log: true,
          logErrors: true,
          reporter: "Spec",
          run: false,
          timeout: 10000,
          urls: ["http://localhost:8012/test/SpecRunner.html"]
        }
      }
    },
    watch: {
      build: {
        files: ['src/**/*.js', 'test/**/*.js', '*.js'],
        tasks: ['build'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        options: {
          jshintrc: true,
          reporter: require('jshint-stylish')
        },
        src: ['src/**/*.js', 'test/**/*.js', '*.js']
      }
    },
    concurrent: {
      build: {
        tasks: ['connect:dev', 'watch:build'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha");
  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");

  grunt.registerTask("build", ["jshint:all"]);
  grunt.registerTask("test", ["connect:test", "mocha:test"]);
  grunt.registerTask("dev", ["concurrent:build"]);
};
