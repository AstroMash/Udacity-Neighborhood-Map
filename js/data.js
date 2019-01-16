'use strict';

class Location{
    constructor(title, lat, long) {
        this.title = title;
        this.lat = lat;
        this.long = long;
    }
};

const locations = [
    new Location('Cafe Du Monde', '29.957523', '-90.061862'),
    new Location('Old Absinthe House', '29.955357', '-90.068444'),
    new Location('Bourbon House', '29.954563', '-90.069131'),
    new Location('Meauxbar', '29.962700', '-90.066160'),
    new Location('Oceana Grill', '29.956270', '-90.067619'),
    new Location('Muriel\'s Jackson Square', '29.958490', '-90.063179'),
    new Location('Brennan\'s', '29.956240', '-90.066719'),
    new Location('Sylvain', '29.957100', '-90.064240')
];