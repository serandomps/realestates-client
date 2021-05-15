var serand = require('serand');
var navigation = require('navigation');
var utils = require('utils');
var watcher = require('watcher');

var context;

var ready = false;

var render = function (token, done) {
    async.parallel({
        primary: function (parallelDone) {
            utils.menus('realestates-primary', parallelDone);
        },
        secondary: function (parallelDone) {
            if (!token) {
                return parallelDone();
            }
            utils.menus('realestates-secondary', parallelDone);
        }
    }, function (err, menus) {
        if (err) {
            return done(err);
        }
        done(null, {
            root: {url: 'www://', title: 'serandives'},
            home: {url: '/', title: 'realestates'},
            global: menus.primary,
            local: menus.secondary,
            user: [
                {url: 'accounts://', title: 'Account'}
            ]
        });
    });
};

var filter = function (options, token, links) {
    links.fixed = true;
    links.background = 'bg-light';
    links.color = 'navbar-light';
    if (token) {
        return links;
    }
    links.signin = {url: '/signin', title: 'Sign in'};
    return links;
};

module.exports = function (ctx, container, options, done) {
    options = options || {};
    context = {
        ctx: ctx,
        container: container,
        options: options,
        done: done
    };
    if (!ready) {
        return;
    }
    render(ctx.token, function (err, links) {
        if (err) {
            return done(err);
        }
        navigation(ctx, container, serand.pack(filter(options, null, links), container), done);
    });
};

watcher.on('user', 'ready', function (token) {
    ready = true;
    if (!context) {
        return;
    }
    render(token, function (err, links) {
        if (err) {
            return context.done(err);
        }
        navigation(context.ctx, context.container, serand.pack(filter(context.options, token, links), context.container), context.done);
    });
});
