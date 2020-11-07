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

imageRouter.route('/').post(upload.single('file'), (req, res, next) => {
    console.log(req.body);
    Image.findOne({ caption: req.body.caption })
        .then((image) => {
            console.log(image);
            if (image) {
                return res.status(200).json({
                    success: false,
                    message: 'Image already exists',
                });
            }

            let newImage = new Image({
                caption: req.body.caption,
                filename: req.file.filename,
                fileId: req.file.id,
            });

            newImage.save()
                .then((image) => {
                    res.status(200).json({
                        success: true,
                        image,
                    });
                })
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
})

imageRouter.route('/multiple')
    .post(upload.array('file', 3), (req, res, next) => {
        res.status(200).json({
            success: true,
            message: `${req.files.length} files uploaded successfully`,
        });
    });