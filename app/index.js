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
        ([
            'applypatch-msg',
            'pre-applypatch',
            'post-applypatch',
            'pre-commit',
            'prepare-commit-msg',
            'commit-msg',
            'post-commit',
            'pre-rebase',
            'post-checkout',
            'post-merge',
            'pre-receive',
            'update',
            'post-receive',
            'post-update',
            'pre-auto-gc',
            'post-rewrite',
            'pre-push'
        ]).map((function(hook){
            this.template('hook.js', '.githooks/' + hook + '/uppercode.js', {hook: hook});
        }).bind(this));

        this.template('_package.json', '.githooks/package.json');

        setTimeout((function(){
            fs.chmodSync(this.destinationPath('.githooks/pre-commit/uppercode.js'), '0755');
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