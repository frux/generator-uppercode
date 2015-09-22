var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
    constructor: function(){
        generators.Base.apply(this, arguments);
    },
    prompting: function(){
        var done = this.async();

        this.prompt({
            type: 'input',
            name: 'name',
            message: 'Your project name',
            default: this.appname
        }, function(answers){
            done();
        }.bind(this));
    },
    writing: function(){
        this.template('hooks/pre-commit', './.git/hooks/pre-commit');
        this.template('uppercode/pre-commit.js', './uppercode/pre-commit.js');
    },
    install: function(){}
});