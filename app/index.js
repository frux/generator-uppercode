var generators = require('yeoman-generator'),
    Uppercode = require('../index'),
    fs = require('fs');

module.exports = generators.Base.extend({
    constructor: function(){
        generators.Base.apply(this, arguments);
    },
    prompting: function(){
        var done = this.async(),
            plugins = Uppercode.globalModulesSync('uppercode-', true),
            prompts = [
                {
                    name: 'plugins',
                    type: 'checkbox',
                    message: 'Choose your plugins:',
                    choices: plugins.map(function(plugin){
                            return {
                                value: plugin,
                                name: plugin.replace('uppercode-', ''),
                                checked: false
                            };
                        })
                }
            ];

        this.prompt(prompts, function(answers){
            this.plugins = answers.plugins;
            done();
        }.bind(this));
    },
    writing: function(){
        this.template('pre-commit.hook.js', '.githooks/uppercode/pre-commit.hook.js');
        this.template('_package.json', '.githooks/uppercode/package.json');

        setTimeout((function(){
            fs.chmodSync(this.destinationPath('.githooks/uppercode/pre-commit.hook.js'), '0755');
        }).bind(this), 100);
    },
    install: {
        githooks: function(){
            this.npmInstall(['git-hooks'], { 'saveDev': true });

            this.plugins.forEach((function(plugin){
                Uppercode.execSync('npm i -S ' + plugin);
                //this.spawnCommand('cd .githooks/uppercode && npm i --save-dev ' + plugin);
            }).bind(this));
        }
    }
});