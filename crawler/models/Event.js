class Event {
    constructor(name, address, description, price, img, baseURL, tags, date_start, date_end, location) {
        this.name = name;
        this.address = address;
        this.description = description;
        this.price = price;
        this.img = img;
        this.baseURL = baseURL;
        this.tags = tags;
        this.date_start = date_start;
        this.date_end = date_end;
        this.location = location
    }
}
module.exports = Event;