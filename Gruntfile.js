module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    ,uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> http://html5beta.com/apps/mobile-slider.html <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        ,report: ['min', 'gzip']
        ,mangle: {
          except: ['exports', 'module', 'require']
        }
      }
      ,dist: {
        files: {'./dist/mobile-slider.min.js': ['./src/mobile-slider.js']}
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-newer')
  grunt.registerTask('u', ['uglify'])
  grunt.registerTask('nu', ['newer:uglify'])
  grunt.registerTask('default', ['newer:uglify'])

}