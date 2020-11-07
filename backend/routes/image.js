const url = config.mongoURI;
const connect = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let gfs;

connect.once('open', () => {
    gfs = new mongoose.mongo.GridFSbucket(connect.db, {
        bucketName: "uploads"
    });
});