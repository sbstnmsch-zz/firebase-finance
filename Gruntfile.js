module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sftp: {
      deploy: {
        files: {
          './': ['app/.*', 'app/**']
        },
        options: {
          host: process.env.DEPLOY_HOST,
          path: process.env.DEPLOY_PATH,
          username: process.env.DEPLOY_USERNAME,
          password: process.env.DEPLOY_PASSWORD,
          showProgress: true,
          srcBasePath: 'app',
          createDirectories: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-ssh');
  grunt.registerTask('default', ['sftp:deploy']);
};
