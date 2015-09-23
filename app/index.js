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
        this.template('pre-commit.hook.js', '.githooks/pre-commit/uppercode.hook.js');
        this.template('_package.json', '.githooks/package.json');

        setTimeout((function(){
            fs.chmodSync(this.destinationPath('.githooks/pre-commit/uppercode.hook.js'), '0755');
        }).bind(this), 100);
    },
    install: {
        githooks: function(){
            this.npmInstall(['git-hooks'], { 'saveDev': true });

            this.plugins.push('generator-uppercode');
            this.plugins.forEach(function(plugin){
                Uppercode.execSync('cd .githooks && npm install --save-dev ' + plugin);
            });
        }
    }
});