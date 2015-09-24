#!/usr/bin/env node
var Uppercode = require('generator-uppercode'),
    plugins = Uppercode.execSync('ls -1 .githooks/node_modules | grep uppercode-'),
    timestamp;

plugins = plugins.split('\n').map(function(plugin){
    return plugin.substr(plugin.lastIndexOf('/') + 1);
});

function next(){
    var pluginPath,
        pluginName,
        plugin;

    if(plugins.length){
        pluginPath = plugins.shift();
        pluginName = pluginPath.substr(pluginPath.lastIndexOf('/') + 1);
        plugin = require(pluginName)['pre-commit'];

        if(plugin){
            plugin.call(Uppercode, next);
        }else{
            next();
        }
    }else{
        finish();
    }
}

function start(){
    timestamp = +new Date;
    console.log('==================\nUppercode started:');
    next();
}

function finish(){
    console.log('Uppercode has finished in ' + (+new Date - timestamp) + 'ms\n==================');
}

if(plugins.length){
    start();
}
