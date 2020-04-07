var dust = require('dust')();
var serand = require('serand');
var RealEstates = require('model-realestates').service;

require('gallery');

dust.loadSource(dust.compile(require('./details'), 'realestates-home-details'));
dust.loadSource(dust.compile(require('./template'), 'realestates-home'));

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    RealEstates.find({
        query: {
            sort: {
                updatedAt: -1
            },
            count: 5
        }
    }, function (err, realestates) {
        if (err) return done(err);
        dust.render('realestates-home', serand.pack(realestates, container), function (err, out) {
            if (err) {
                return done(err);
            }
            sandbox.append(out);
            done(null, {
                clean: function () {
                    $('.realestates-home', sandbox).remove();
                },
                ready: function () {
                    var o = [];
                    realestates.forEach(function (realestate) {
                        var images = realestate._.images || [];
                        var href = images.length ? images[0].x800 : '';
                        o.push({href: href});
                    });
                    var gallery = blueimp.Gallery(o, {
                        container: $('.blueimp-gallery-carousel', sandbox),
                        carousel: true,
                        stretchImages: true,
                        titleElement: 'a',
                        onslide: function (index, slide) {
                            var realestate = realestates[index];
                            var url = '/realestates/' + realestate.id;
                            dust.render('realestates-home-details', serand.pack(realestate, container), function (err, out) {
                                if (err) {
                                    return console.error(err);
                                }
                                $('.blueimp-gallery-carousel .title', sandbox).attr('href', url).html(out);
                            });
                        }
                    });
                    $('.slides', sandbox).on('click', function () {
                        var index = gallery.getIndex();
                        var realestate = realestates[index];
                        var url = '/realestates/' + realestate.id;
                        window.open(url, '_blank');
                        return true;
                    });
                }
            });
        });
    });
};
