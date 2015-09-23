#!/usr/bin/env node
var Uppercode = require('generator-uppercode'),
    plugins = Uppercode.execSync('cd .githooks && npm ls --depth=0 --parseable | grep /.githooks/node_modules/uppercode-'),
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

plugins = plugins.split('\n').map(function(plugin){
    return plugin.substr(plugin.lastIndexOf('/') + 1);
});

next();

//TODO: start and finish labels
