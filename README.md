
# lycheeJS (v0.8)

lycheeJS is a JavaScript Game library that offers a
complete solution for prototyping and deployment
of HTML5 Canvas, WebGL or native OpenGL(ES) based
games inside the Web Browser or native environments.

The development process is optimized for Google Chrome
and its developer tools.


# Installation

- Download and install the newest stable release of NodeJS from [nodejs.org](http://nodejs.org).

- Download lycheeJS via [zip-file](https://github.com/LazerUnicorns/lycheeJS/archive/master.zip)
and extract its contents to **/var/www/lycheeJS**.

- Navigate to the folder in the shell (or PowerShell) and execute:

```bash
cd /var/www/lycheeJS;
./sorbet.sh start
```

- If your OS has no support for the **nohup** or **pkill** command, you can still start
sorbet manually. Note that the third parameter is the profile name (without .json):

```bash
cd /var/www/lycheeJS/sorbet;
nodejs init.js default
```

- Open your Web Browser, navigate to **http://localhost:8080** or try out the examples
at [sorbet.lycheejs.org](http://sorbet.lycheejs.org) and have fun :)

Those games show you how to develop real cross-platform games and the best practices
in high-performant JavaScript code.

[Link to examples on github](https://github.com/LazerUnicorns/lycheeJS/tree/master/game)


# Documentation

The documentation is available online at [http://lycheejs.org/docs](http://lycheejs.org/docs)
or in the [lycheejs.org github repository](https://github.com/LazerUnicorns/lycheeJS-website)


# License

The lycheeJS framework is licensed under MIT License.


### Other (yet unsupported) JavaScript environments

**The lycheeJS architecture is independent of the environment which
means it will run on any theoretical JavaScript environment.**

The only requirement for such a platform is a fully implemented
[lychee.Preloader](http://lycheejs.org/docs/api-lychee-Preloader.html)
API.

As the lychee.Preloader itself is inside the core, you only need
to implement the [lychee.Preloader.\_load](http://lycheejs.org/docs/api-lychee-Preloader.html#lychee-Preloader-_load)
method.

For fully supporting a client-side environment, you will also
have to implement a [lychee.Renderer](http://lycheejs.org/docs/api-lychee-Renderer.html),
a [lychee.Input](http://lycheejs.org/docs/api-lychee-Input.html),
and a [lychee.Jukebox](http://lycheejs.org/docs/api-lychee-Jukebox.html);
but these are fully optional and only necessary if you are using
them inside your Game or App.

