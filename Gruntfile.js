module.exports = function(grunt) {
  grunt.initConfig({
    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'build/output.css': [
            'css/bootstrap.css', 
            'css/animate.css',
            'css/font-awesome.min.css',
            'css/simple-line-icons.css',
            'css/font.css',
            'css/app.css',
            'css/ng-tags-input.min.css',
            'js/modules/toaster/toaster.css',
            'js/modules/select2/select.css',
            'js/jquery/select2/select2.css',
            'js/jquery/select2/select2-bootstrap.css',
            'js/modules/smart-app-banner/jquery.smartbanner.css',
            'js/modules/date-rangpicker/daterangepicker-bs3.css',
          ]
        }
      }
    },
    uglify: {
       dist: {
          options: {
             sourceMap: true,
             banner: '/*! Shipchung Seller Center 1.0.5 */'
          },
          files: {
             'build/output.min.js': [
                'js/angular/angular-translate.js',
                'js/modules/ngFacebook.js',
                'js/modules/smart-app-banner/jquery.smartbanner.js',
                'js/angular/ngStorage.min.js',
                'js/angular/ocLazyLoad.min.js',
                'js/angular/ui-load.js',
                'js/angular/ui-jq.js',
                'js/angular/ui-validate.js',
                'js/angular/ui-codemirror.js',
                'js/angular/ui-bootstrap-tpls.min.js',
                'js/libs/tags.min.js',
                'js/libs/moment.min.js',
                'js/libs/highcharts.src.js',
                'js/libs/highcharts-ng.js', 
                'js/modules/toaster/toaster.js',
                'js/modules/fcsaNumber.js',
                'js/modules/angular-file-upload.js',
                'js/modules/bootstrap.min.js',
                'js/modules/markdown/angular-sanitize.js',
                'js/modules/markdown/showdown.js',
                'js/modules/markdown/angular-markdown-text.min.js',
                'js/modules/select2/select.js',
                'js/jquery/select2/select2.min.js',
                'js/modules/date-rangpicker/daterangepicker.js',
                'js/modules/date-rangpicker/ng-bs-daterangepicker.js'
             ],
          }
       }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['cssmin', 'uglify']);
  grunt.registerTask('mincss', ['cssmin']);
  grunt.registerTask('minjs', ['uglify']);

};