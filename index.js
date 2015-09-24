var Uppercode = {
        exec: exec,
        execSync: execSync,
        stagedFiles: stagedFiles,
        stagedFilesSync: stagedFilesSync,
        globalModules: globalModules,
        globalModulesSync: globalModulesSync,
        trigger: triggerHook
    },
    ChildProcess = require('child_process');

/**
 * Execs command
 * @param command {string} Command line
 * @param args {Array|undefined} Array of string arguments
 * @param callback {Function|undefined} Callback function
 */
function exec(command, args, callback){
    var commandProcess;

    if(typeof command === 'string'){

        //if arguments were skipped
        if(typeof args === 'function'){
            callback = args;
        }

        //if arguments is not an array replace it by empty array
        if(args instanceof Array){
            args = args.join(' ');
        }else{
            args = '';
        }

        if(typeof callback !== 'function'){
            callback = function(){};
        }

        //run command
        ChildProcess.exec(command + ' ' + args, function(err, stdout, stderr){
            if(err || stderr){
                callback(err || stderr.toString());
            }

            callback(undefined, stdout.toString().replace(/\n$/, ''));
        });
    }
}

/**
 * Synchronously execs command
 * @param command {string} Command line
 * @param args {Array|undefined} Array of string arguments
 * @returns {string}
 */
function execSync(command, args){
    var commandProcess,
        result;

    if(typeof command === 'string'){

        //if arguments is not an array replace it by empty array
        if(args instanceof Array){
            args = args.join(' ');
        }else{
            args = '';
        }

        //run command
        result = ChildProcess.execSync(command + ' ' + args).toString().replace(/\n$/, '');

        return result;
    }
}

/**
 * Returns list of files staged to commit
 * @param changeFilter {string} Filter by type of file change. Available value: ACDMRTUXB*. Default *. For details lookup for --diff-filter values.
 * @param callback {Function} Callback function
 */
function stagedFiles(changeFilter, callback){

    //if the first argument is provided
    if(changeFilter){

        //if the first argument is function
        if(typeof changeFilter === 'function'){
            callback = changeFilter;

            //if the first argument is a string
        }else if(typeof changeFilter === 'string'){

            //if filter is not valid exit
            if(!/^[ACDMRTUXB\*]+$/.test(changeFilter)){
                return;
            }
        }

        //if filter was not specified use default
    }else{
        changeFilter = '*';
    }

    if(typeof callback !== 'function'){
        callback = function(){};
    }

    exec('git', ['diff', '--cached', '--name-only', '--diff-filter=' + changeFilter], function(err, data){
        var files;

        if(err){
            callback(err);
        }

        files = data.split('\n');

        callback(undefined, files);
    });
}

/**
 * Synchronously returns list of files staged to commit
 * @param changeFilter {string} Filter by type of file change. Available value: ACDMRTUXB*. Default *. For details lookup for --diff-filter values.
 * @returns {Array}
 */
function stagedFilesSync(changeFilter){
    var commandResult,
        files;

    //if the first argument is provided
    if(typeof changeFilter === 'string'){

        //if filter is not valid exit
        if(!/^[ACDMRTUXB\*]+$/.test(changeFilter)){
            return;
        }

        //if filter was not specified use default
    }else{
        changeFilter = '*';
    }

    try{
        commandResult = execSync('git', ['diff', '--cached', '--name-only', '--diff-filter=' + changeFilter]);
    }catch(e){
        throw e;
    }

    files = commandResult.split('\n');

    return files;
}

/**
 * Returns list of globally installed npm modules
 * @param grep {string|undefined} Grep pattern
 * @param nameOnly {boolean|undefined} Return names only instead of full path
 * @param callback
 */
function globalModules(grep, nameOnly, callback){

    if(typeof grep === 'boolean'){
        callback = nameOnly;
        nameOnly = grep;
    }else if(typeof grep === 'function'){
        callback = grep;
        nameOnly = false;
    }

    if(typeof grep === 'string'){
        grep = ' | grep ' + grep;
    }else{
        grep = '';
    }

    if(typeof nameOnly === 'function'){
        callback = nameOnly;
    }


    exec('npm ls -g --depth=0 --parseable' + grep, function(err, data){
        var modules;

        if(err){
            callback(err);
        }

        modules = data.split('\n');

        if(nameOnly){
            modules = modules.map(function(modulePath){
                return modulePath.substr(modulePath.lastIndexOf('/') + 1);
            });
        }

        callback(undefined, modules);
    });
}

/**
 * Synchronously returns list of globally installed npm modules
 * @param grep {string} Grep pattern
 * @param nameOnly {boolean|undefined} Return names only instead of full path
 * @returns {Array}
 */
function globalModulesSync(grep, nameOnly){
    var commandResult,
        modules;

    if(typeof grep === 'boolean'){
        nameOnly = grep;
    }

    if(typeof grep === 'string'){
        grep = ' | grep ' + grep;
    }else{
        grep = '';
    }

    try{
        commandResult = execSync('npm', ['ls', '-g', '--depth=0', '--parseable' + grep]);
    }catch(e){
        throw e;
    }

    modules = commandResult.split('\n');

    if(nameOnly){
        modules = modules.map(function(modulePath){
            return modulePath.substr(modulePath.lastIndexOf('/') + 1);
        });
    }

    return modules;
}

/**
 * Triggers hook
 * @param event {string} Event that has been hooked
 * @param callback {Function} Callback function
 */
function triggerHook(event, callback){
    var plugins,
        timestamp;

    //event should be a string
    if(typeof event === 'string'){

        //if callback is not a function use empty function
        if(typeof callback !== 'function'){
            callback = function(){};
        }

        //get list of locally installed plugins started with "uppercode-" split it by rows a trim path
        plugins = execSync('ls -1 ' + __dirname + '/.. | grep uppercode-').split('\n').map(function(plugin){
            return plugin.substr(plugin.lastIndexOf('/') + 1);
        });

        /**
         * Calls next hook
         */
        function next(){
            var pluginPath,
                pluginName,
                plugin;

            //if there are plugins which haven't worked yet
            if(plugins.length){

                //get name of the next plugin in a list
                pluginName = plugins.shift();

                //connect method of this plugin which called the same as an event
                plugin = require(pluginName)[event];

                //if this method exists
                if(plugin){

                    //call it
                    plugin.call(Uppercode, next);

                }else{

                    //call next
                    next();
                }
            }else{

                //finish hook
                finish();
            }
        }

        /**
         * Start hook with calling the first plugin
         */
        function start(){
            timestamp = +new Date;
            console.log('==================\nUppercode started:');
            next();
        }

        /**
         * Finish hook
         */
        function finish(){
            callback();
            console.log('Uppercode has finished in ' + (+new Date - timestamp) + 'ms\n==================');
        }

        //if there is any plugin
        if(plugins.length){

            //start hook
            start();
        }
    }
}

module.exports = Uppercode;