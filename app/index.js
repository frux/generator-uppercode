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
        this.template('hook.js', '.githooks/applypatch-msg/uppercode.js', {hook: 'applypatch-msg'});
        this.template('hook.js', '.githooks/pre-applypatch/uppercode.js', {hook: 'pre-applypatch'});
        this.template('hook.js', '.githooks/post-applypatch/uppercode.js', {hook: 'post-applypatch'});
        this.template('hook.js', '.githooks/pre-commit/uppercode.js', {hook: 'pre-commit'});
        this.template('hook.js', '.githooks/prepare-commit-msg/uppercode.js', {hook: 'prepare-commit-msg'});
        this.template('hook.js', '.githooks/commit-msg/uppercode.js', {hook: 'commit-msg'});
        this.template('hook.js', '.githooks/post-commit/uppercode.js', {hook: 'post-commit'});
        this.template('hook.js', '.githooks/pre-rebase/uppercode.js', {hook: 'pre-rebase'});
        this.template('hook.js', '.githooks/post-checkout/uppercode.js', {hook: 'post-checkout'});
        this.template('hook.js', '.githooks/post-merge/uppercode.js', {hook: 'post-merge'});
        this.template('hook.js', '.githooks/pre-receive/uppercode.js', {hook: 'pre-receive'});
        this.template('hook.js', '.githooks/update/uppercode.js', {hook: 'update'});
        this.template('hook.js', '.githooks/post-receive/uppercode.js', {hook: 'post-receive'});
        this.template('hook.js', '.githooks/post-update/uppercode.js', {hook: 'post-update'});
        this.template('hook.js', '.githooks/pre-auto-gc/uppercode.js', {hook: 'pre-auto-gc'});
        this.template('hook.js', '.githooks/post-rewrite/uppercode.js', {hook: 'post-rewrite'});
        this.template('hook.js', '.githooks/pre-push/uppercode.js', {hook: 'pre-push'});
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