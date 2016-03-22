module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-protractor-coverage');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-istanbul');

  grunt.initConfig({
    clean: {
      tests_e2e: ['tmp'],
    },
    instrument: {
      files: 'bower_components/**/*.js',
      options: {
        lazy: true,
        basePath: "tmp/instrumented"
      }
    },
    protractor_coverage: {
      options: {
        keepAlive: true,
        noColor: false,
        coverageDir: 'tmp/coverage',
        args: {
          baseUrl: 'http://localhost:8081'
        }
      },
      local: {
        options: {
          configFile: 'protractor-local.conf.js'
        }
      }
    },
    makeReport: {
      src: 'tmp/coverage/*.json',
      options: {
        type: 'lcov',
        dir: 'tmp/coverage/report',
        print: 'detail'
      }
    }
  });

  // real one
  //grunt.registerTask('test', ['clean:tests_e2e', 'instrument', 'protractor_coverage:local', 'makeReport', 'clean:tests_e2e']);
  // debug one
  grunt.registerTask('test', ['clean:tests_e2e', 'instrument', 'protractor_coverage:local', 'makeReport']);
}
