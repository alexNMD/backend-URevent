class Event {
    constructor(name, address, description, price, img, baseURL, tags, start, end, location) {
        this.name = name;
        this.address = address;
        this.description = description;
        this.price = price;
        this.img = img;
        this.baseURL = baseURL;
        this.tags = tags;
        this.start = start;
        this.end = end;
        this.location = location
    }
}
module.exports = Event;