var Uppercode = require('generator-uppercode'),
    plugins = Uppercode.globalModulesSync('uppercode-'),
    next = function(){
        var pluginPath,
            pluginName,
            plugin;

        if(plugins.length){
            pluginPath = plugins.shift();
            pluginName = pluginPath.substr(pluginPath.lastIndexOf('/') + 1);
            plugin = require(pluginName);

            if(plugin['pre-commit']){
                plugin['pre-commit'].call(Uppercode, next);
            }else{
                next();
            }
        }
    };

next();
