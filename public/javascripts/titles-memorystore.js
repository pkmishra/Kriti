// The in-memory Store. Encapsulates logic to access wine data.
window.kriti = window.kriti || {}

window.kriti.titlestore = {

    titles: {},

    populate: function () {

        this.titles[1] = {
            id: 1,
            name: "CHATEAU DE SAINT COSME",
            year: "2009",
            author: "Mr. X",
            description: "The aromas of fruit and spice give one a hint of the light drinkability of this lovely wine, which makes an excellent complement to fish dishes.",
        };
        this.titles[2] = {
            id: 2,
            name: "CHATEAU DE SAINT PETER",
            year: "2009",
            author: "Mr. Y",
            description: "The aromas of fruit and spice give one a hint of the light drinkability of this lovely wine, which makes an excellent complement to fish dishes.",
        };
        this.lastId = 2;
    },

    find: function (model) {
        return this.titles[model.id];
    },

    findAll: function () {
        return _.values(this.titles);
    },

    create: function (model) {
        this.lastId++;
        model.set('id', this.lastId);
        this.titles[this.lastId] = model;
        return model;
    },

    update: function (model) {
        this.titles[model.id] = model;
        return model;
    },

    destroy: function (model) {
        delete this.titles[model.id];
        return model;
    }
};
kriti.titlestore.populate();



// Overriding Backbone's sync method. Replace the default RESTful services-based implementation
// with a simple in-memory approach.
Backbone.sync = function (method, model, options) {

    var resp;

    switch (method) {
        case "read":
            resp = model.id ? kriti.titlestore.find(model) : kriti.titlestore.findAll();
            break;
        case "create":
            resp = kriti.titlestore.create(model);
            break;
        case "update":
            resp = kriti.titlestore.update(model);
            break;
        case "delete":
            resp = kriti.titlestore.destroy(model);
            break;
    }

    if (resp) {
        options.success(resp);
    } else {
        options.error("Record not found");
    }
};
