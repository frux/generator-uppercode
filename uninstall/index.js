var generators = require('yeoman-generator'),
    Uppercode = require('../index'),
    fs = require('fs');

module.exports = generators.Base.extend({
    constructor: function(){
        generators.Base.apply(this, arguments);
    },

    prompting: function(){
        var done = this.async();

        this.prompt({
            type: 'confirm',
            name: 'sure',
            message: 'Hooks will be removed. Are you sure?',
            default: true
        }, function(answers){
            if(!answers.sure){
                process.exit(1);
            }

            done();
        }.bind(this));
    },

    writing: function(){
        Uppercode.execSync('find .githooks -name uppercode.js -exec rm -rf {} \\;');
        Uppercode.execSync('rm -rf .githooks/package.json');
        Uppercode.execSync('rm -rf .githooks/node_modules');

        this.spawnCommand('npm', ['uninstall', '--save-dev', 'git-hooks']);
    }
});
