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
                plugins && {
                    name: 'globalPlugins',
                    type: 'checkbox',
                    message: 'Choose from your global plugins:',
                    choices: plugins.map(function(plugin){
                            return {
                                value: plugin,
                                name: plugin.replace('uppercode-', ''),
                                checked: false
                            };
                        })
                },
                {
                    name: 'rowPlugins',
                    type: 'text',
                    message: 'List plugins you want to install (separated by space):',
                    default: ''
                }
            ];

        this.prompt(prompts, function(answers){
            var globalPlugins = answers.globalPlugins || [],
                rowPlugins = answers.rowPlugins || '';

            if(!/^([\sa-z\-\_]+)?$/i.test(rowPlugins)){
                throw Error('Plugins must be separated by space. "uppercode-" prefix is not needed. For example: "csscomb jscs yet-another-plugin"');
            }

            rowPlugins = rowPlugins.trim().split(' ')
                .filter(function(plugin){ return !!plugin; })
                .map(function(plugin){
                    return (plugin.indexOf('uppercode-') === -1 ? 'uppercode-' : '') + plugin;
                });

            this.plugins = globalPlugins.concat(rowPlugins);

            if(!this.plugins.length){
                console.log('No plugins were selected');
                process.exit(0);
            }

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
            Uppercode.execSync('chmod', ['-R', '0755', '.githooks/*/uppercode.js']);
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