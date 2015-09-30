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

		try{

			//run command
			result = ChildProcess.execSync(command + ' ' + args).toString().replace(/\n$/, '');
		}catch(e){
			return;
		}

		return result;
	}
}

/**
 * Execs command
 * @param command {string} Command line
 * @param args {Array|undefined} Array of string arguments
 * @param callback {Function|undefined} Callback function
 */
function exec(command, args, callback){
	var data,
	err;

	if(typeof callback !== 'function'){
		if(typeof args === 'function'){
			callback = args;
		}else{
			callback = function(){};
		}
	}

	try{
		data = execSync(command, args);
	}catch(e){
		err = e;
	}

	callback(err, data);
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
 * Returns list of files staged to commit
 * @param changeFilter {string} Filter by type of file change. Available value: ACDMRTUXB*. Default *. For details lookup for --diff-filter values.
 * @param callback {Function} Callback function
 */
function stagedFiles(changeFilter, callback){
	var data,
	err;

	if(typeof changeFilter === 'function'){
		callback = changeFilter;
	}else{
		callback = function(){};
	}

	try{
		data = stagedFilesSync(changeFilter);
	}catch(e){
		err = e;
	}

	callback(err, data);
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

	commandResult = execSync('npm', ['ls', '-g', '--depth=0', '--parseable' + grep]);

	if(commandResult){
		modules = commandResult.split('\n');

		if(nameOnly){
			modules = modules.map(function(modulePath){
				return modulePath.substr(modulePath.lastIndexOf('/') + 1);
			});
		}
	}else{
		modules = [];
	}

	return modules;
}

/**
 * Returns list of globally installed npm modules
 * @param grep {string|undefined} Grep pattern
 * @param nameOnly {boolean|undefined} Return names only instead of full path
 * @param callback
 */
function globalModules(grep, nameOnly, callback){

	var data,
	err;

	if(typeof callback !== 'function'){
		if(typeof nameOnly === 'function'){
			callback = nameOnly;
		}else if(typeof grep === 'function'){
			callback = grep;
		}else{
			callback = function(){};
		}
	}

	try{
		data = globalModulesSync(grep, nameOnly);
	}catch(e){
		err = e;
	}

	callback(err, data);
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

		//get list of locally installed plugins started with "uppercode-" split it by rows, trim path, require it
		plugins = execSync('ls -1 ' + __dirname + '/.. | grep uppercode-').split('\n').map(function(plugin){
			return require(plugin.substr(plugin.lastIndexOf('/') + 1))[event];
		}).filter(function(plugin){ return !!plugin; });

		/**
		         * Calls next hook
		         */
		function next(){
			var plugin;

			//if there are plugins which haven't worked yet
			if(plugins.length){

				//get name of the next plugin in a list
				plugin = plugins.shift();

				//if this plugin exists
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
