const BaseModel = require('./BaseModel');

class Event extends BaseModel {
    constructor() {
        super();
        this.table = 'event';
        this.primaryKey = 'id';
        this.allowedFields = [
            'created_by', 'name', 'startdate', 'enddate', 'active', 'local',
            'created_at', 'updated_at', 'deleted_at'
        ];
    }
}

module.exports = Event; 