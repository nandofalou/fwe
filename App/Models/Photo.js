const BaseModel = require('./BaseModel');

class Photo extends BaseModel {
    constructor() {
        super();
        this.table = 'photo';
        this.primaryKey = 'ticket_id';
        this.allowedFields = ['ticket_id', 'image', 'image_url', 'created_at'];
    }
}

module.exports = Photo; 