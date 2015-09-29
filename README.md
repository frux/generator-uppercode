![Uppercode](http://frux.github.io/generator-uppercode/uppercode.svg)

## Install
``npm i -g generator-uppercode``

## Set hooks

##### Run uppercode
``yo uppercode``

##### Answer the questions
````
? List plugins you want to install (separated by space): ()
````
You should list all of the plugins you are going to use in your project. For example: ``plugin1 plugin2 plugin3``. You don't have to write ``uppercode-`` prefix.

Instead of listing plugins every time you use Uppercode you can globally install all of the plugins that you are going to use in your projects. Uppercode will offer you to select plugins from the list.

````
? Do you want to add the hooks in .gitignore (y/N)
````
If you aren't going to share your hooks Upperode can add it to your .gitignore.

[Full list of available plugins](https://www.npmjs.com/search?q=uppercode)

## Remove hooks
``yo uppercode:uninstall``
