var generators = require('yeoman-generator'),
    fs = require('fs');

module.exports = generators.Base.extend({
    constructor: function(){
        generators.Base.apply(this, arguments);
    },
    prompting: function(){
        var done = this.async();

        this.prompt({
            type: 'boolean',
            name: 'sure',
            message: 'Pre-commit hook will be removed. Are you sure?',
            default: true
        }, function(answers){
            if(!answers.sure){
                process.exit(1);
            }
            done();
        }.bind(this));
    },
    writing: function(){
        fs.unlinkSync(this.destinationPath('./uppercode/pre-commit.js'));
        fs.rmdirSync(this.destinationPath('./uppercode'));
        fs.unlinkSync(this.destinationPath('./.git/hooks/pre-commit'));
    }
});