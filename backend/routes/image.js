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

imageRouter.route('/files')
    .get((req, res, next) => {
        gfs.find().toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No files available'
                });
            }

            files.map(file => {
                if (file.contentType === 'image/jpeg'
                    || file.contentType === 'image/png'
                    || file.contentType === 'image/svg+xml'
                ) {
                    file.isImage = true;
                } else {
                    files.isImage = false;
                }
            });

            res.status(200).json({
                success: true,
                files,
            });
        });
    });


// GET : Fetches  particular image and renders on the browser

imageRouter.route('/image/:filename')
    .get((req, res, next) => {
        gfs.find({ filename: req.params.filename }).toArray((err, files) => {
            if (!files[0] || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No files available',
                });
            }

            if (files[0].contentType == 'image/jpeg'
                || file.contentType === 'image/png'
                || file.contentType === 'image/svg+xml'
            ) {
                gfs.openDownloadsStreambyName(req.params.filename).pipe(res)
            } else {
                res.status(404).json({
                    err: 'Not an image',
                });
            }
        });
    });

//deletin a file by ID

imageRouter.route('/file/del/:id')
    .post((req, res, next) => {
        console.log(req.params.id);
        gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
            if (err) {
                return res.status(404).json({ err: err });
            }

            res.status(200).json({
                success: true,
                message: `File with ID ${req.params.id} is deleted`,
            });
        });
    });